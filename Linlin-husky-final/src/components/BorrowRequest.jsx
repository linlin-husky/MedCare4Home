import { useState } from 'react';
import { ACTIONS } from '../reducers/appReducer.js';
import * as api from '../services/api.js';
import { formatCurrency, capitalizeFirst, getConditionColor, getTrustScoreColor, getTodayDateString } from '../utils/helpers.js';
import './BorrowRequest.css';

function BorrowRequest({ state, dispatch, navigateTo, item }) {
  const [formData, setFormData] = useState({
    message: '',
    proposedReturnDate: '',
    needByDate: getTodayDateString()
  });
  const [errors, setErrors] = useState({});

  function validateForm() {
    const newErrors = {};
    
    if (!formData.proposedReturnDate) {
      newErrors.proposedReturnDate = ['Please specify when you will return the item'];
    } else if (new Date(formData.proposedReturnDate) <= new Date()) {
      newErrors.proposedReturnDate = ['Return date must be in the future'];
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    api.requestToBorrow(item.id, formData)
      .then(data => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        dispatch({ type: ACTIONS.SET_SUCCESS, payload: 'Borrow request sent successfully!' });
        navigateTo('borrowings');
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to send request' });
      });
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }

  if (!item) {
    return (
      <div className="borrow-request-page">
        <p>Item not found</p>
        <button className="back-button" onClick={() => navigateTo('public-library')}>
          Back to Discover
        </button>
      </div>
    );
  }

  return (
    <div className="borrow-request-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigateTo('public-library')}>
          ← Back to Discover
        </button>
        <h1 className="page-title">Request to Borrow</h1>
      </div>

      <div className="item-preview">
        <div className="preview-header">
          <h2 className="preview-title">{item.name}</h2>
          <span className={'condition-badge ' + getConditionColor(item.condition)}>
            {capitalizeFirst(item.condition)}
          </span>
        </div>
        
        <div className="preview-details">
          <div className="detail-row">
            <span className="detail-label">Category:</span>
            <span className="detail-value">{capitalizeFirst(item.category)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Value:</span>
            <span className="detail-value">{formatCurrency(item.estimatedValue)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Owner:</span>
            <span className="detail-value">
              {item.owner?.displayName}
              <span className={'owner-trust ' + getTrustScoreColor(item.owner?.trustScore || 50)}>
                ({item.owner?.trustScore || '?'})
              </span>
            </span>
          </div>
        </div>
        
        {item.description && (
          <p className="preview-description">{item.description}</p>
        )}
        
        {item.notes && (
          <div className="care-instructions">
            <h4>Care Instructions:</h4>
            <p>{item.notes}</p>
          </div>
        )}
      </div>

      <form className="borrow-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="section-title">Your Request</h3>
          
          <div className="form-group">
            <label htmlFor="proposed-return" className="form-label">
              When will you return it? <span className="required">*</span>
            </label>
            <input
              type="date"
              id="proposed-return"
              name="proposedReturnDate"
              className={'form-input' + (errors.proposedReturnDate ? ' error' : '')}
              value={formData.proposedReturnDate}
              onChange={handleInputChange}
              min={getTodayDateString()}
            />
            {errors.proposedReturnDate && (
              <ul className="field-errors">
                {errors.proposedReturnDate.map((error, i) => (
                  <li key={i} className="field-error">{error}</li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="message" className="form-label">
              Message to Owner (optional)
            </label>
            <textarea
              id="message"
              name="message"
              className="form-textarea"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Introduce yourself and explain why you need this item..."
              rows="4"
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigateTo('public-library')}
          >
            Cancel
          </button>
          <button type="submit" className="submit-button">
            Send Request
          </button>
        </div>
      </form>
    </div>
  );
}

export default BorrowRequest;

