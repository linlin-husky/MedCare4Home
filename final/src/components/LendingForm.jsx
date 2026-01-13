import { useState, useEffect } from 'react';
import { ACTIONS } from '../reducers/appReducer.js';
import * as api from '../services/api.js';
import { getTodayDateString, formatCurrency, validateRequired, getTrustScoreColor } from '../utils/helpers.js';
import './LendingForm.css';

function LendingForm({ state, dispatch, navigateTo, item }) {
  const [borrowerType, setBorrowerType] = useState('platform');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    borrowerName: '',
    borrowerEmail: '',
    borrowerPhone: '',
    dateLent: getTodayDateString(),
    expectedReturnDate: '',
    conditionExpectation: '',
    notes: '',
    requireDeposit: false,
    depositAmount: '',
    allowExtensions: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const debounceTimer = setTimeout(() => {
        api.searchUsers(searchQuery)
          .then(data => {
            setSearchResults(data.users);
          })
          .catch(() => {
            setSearchResults([]);
          });
      }, 300);
      
      return () => clearTimeout(debounceTimer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  function validateForm() {
    const newErrors = {};
    
    if (borrowerType === 'platform') {
      if (!selectedUser) {
        newErrors.borrower = ['Please select a borrower'];
      }
    } else {
      const nameErrors = validateRequired(formData.borrowerName, 'Borrower name');
      if (nameErrors.length > 0) {
        newErrors.borrowerName = nameErrors;
      }
      
      if (!formData.borrowerEmail && !formData.borrowerPhone) {
        newErrors.borrowerContact = ['Please provide email or phone number'];
      }
    }
    
    const dateLentErrors = validateRequired(formData.dateLent, 'Date lent');
    if (dateLentErrors.length > 0) {
      newErrors.dateLent = dateLentErrors;
    }
    
    const returnDateErrors = validateRequired(formData.expectedReturnDate, 'Expected return date');
    if (returnDateErrors.length > 0) {
      newErrors.expectedReturnDate = returnDateErrors;
    } else if (new Date(formData.expectedReturnDate) <= new Date(formData.dateLent)) {
      newErrors.expectedReturnDate = ['Return date must be after lending date'];
    }
    
    if (formData.requireDeposit) {
      if (!formData.depositAmount || parseFloat(formData.depositAmount) <= 0) {
        newErrors.depositAmount = ['Deposit amount must be greater than zero'];
      }
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
    
    const borrower = borrowerType === 'platform'
      ? { username: selectedUser.username }
      : { 
          name: formData.borrowerName,
          email: formData.borrowerEmail,
          phone: formData.borrowerPhone
        };
    
    const lendingData = {
      itemId: item.id,
      borrower,
      terms: {
        dateLent: formData.dateLent,
        expectedReturnDate: formData.expectedReturnDate,
        conditionExpectation: formData.conditionExpectation,
        notes: formData.notes,
        requireDeposit: formData.requireDeposit,
        depositAmount: formData.requireDeposit ? parseFloat(formData.depositAmount) : 0,
        allowExtensions: formData.allowExtensions
      }
    };
    
    api.createLending(lendingData)
      .then(data => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        dispatch({ type: ACTIONS.SET_SUCCESS, payload: 'Lending created successfully!' });
        navigateTo('lending-detail', { lending: data.lending });
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to create lending' });
      });
  }

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }

  function handleSelectUser(user) {
    setSelectedUser(user);
    setSearchQuery('');
    setSearchResults([]);
    if (errors.borrower) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.borrower;
        return newErrors;
      });
    }
  }

  if (!item) {
    return (
      <div className="lending-form-page">
        <p>Please select an item to lend</p>
        <button onClick={() => navigateTo('inventory')}>Go to Inventory</button>
      </div>
    );
  }

  return (
    <div className="lending-form-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigateTo('inventory')}>
          ← Back
        </button>
        <h1 className="page-title">Lend Item</h1>
      </div>

      <div className="item-summary">
        <h2 className="item-name">{item.name}</h2>
        <p className="item-value">Value: {formatCurrency(item.estimatedValue)}</p>
      </div>

      <form className="lending-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <h2 className="section-title">Borrower Information</h2>
          
          <div className="borrower-type-toggle">
            <button
              type="button"
              className={'toggle-button' + (borrowerType === 'platform' ? ' active' : '')}
              onClick={() => {
                setBorrowerType('platform');
                setSelectedUser(null);
              }}
            >
              Platform User
            </button>
            <button
              type="button"
              className={'toggle-button' + (borrowerType === 'external' ? ' active' : '')}
              onClick={() => {
                setBorrowerType('external');
                setSelectedUser(null);
              }}
            >
              External Person
            </button>
          </div>

          {borrowerType === 'platform' ? (
            <div className="user-search-section">
              {selectedUser ? (
                <div className="selected-user">
                  <div className="user-info">
                    <span className="user-name">{selectedUser.displayName}</span>
                    <span className={'trust-score ' + getTrustScoreColor(selectedUser.trustScore)}>
                      Trust: {selectedUser.trustScore}
                    </span>
                  </div>
                  <button 
                    type="button"
                    className="change-button"
                    onClick={() => setSelectedUser(null)}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="user-search" className="form-label">
                      Search for a user
                    </label>
                    <input
                      type="text"
                      id="user-search"
                      className="form-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type username or display name..."
                    />
                  </div>
                  
                  {searchResults.length > 0 && (
                    <ul className="search-results">
                      {searchResults.map(user => (
                        <li 
                          key={user.username}
                          className="search-result-item"
                          onClick={() => handleSelectUser(user)}
                        >
                          <span className="result-name">{user.displayName}</span>
                          <span className="result-username">@{user.username}</span>
                          <span className={'result-trust ' + getTrustScoreColor(user.trustScore)}>
                            {user.trustScore}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {errors.borrower && (
                    <ul className="field-errors">
                      {errors.borrower.map((error, i) => (
                        <li key={i} className="field-error">{error}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="external-borrower-section">
              <div className="form-group">
                <label htmlFor="borrower-name" className="form-label">
                  Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="borrower-name"
                  name="borrowerName"
                  className={'form-input' + (errors.borrowerName ? ' error' : '')}
                  value={formData.borrowerName}
                  onChange={handleInputChange}
                  placeholder="Borrower's name"
                />
                {errors.borrowerName && (
                  <ul className="field-errors">
                    {errors.borrowerName.map((error, i) => (
                      <li key={i} className="field-error">{error}</li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="borrower-email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="borrower-email"
                    name="borrowerEmail"
                    className="form-input"
                    value={formData.borrowerEmail}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="borrower-phone" className="form-label">Phone</label>
                  <input
                    type="tel"
                    id="borrower-phone"
                    name="borrowerPhone"
                    className="form-input"
                    value={formData.borrowerPhone}
                    onChange={handleInputChange}
                    placeholder="Phone number"
                  />
                </div>
              </div>
              
              {errors.borrowerContact && (
                <ul className="field-errors">
                  {errors.borrowerContact.map((error, i) => (
                    <li key={i} className="field-error">{error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        <section className="form-section">
          <h2 className="section-title">Lending Terms</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date-lent" className="form-label">
                Date Lent <span className="required">*</span>
              </label>
              <input
                type="date"
                id="date-lent"
                name="dateLent"
                className={'form-input' + (errors.dateLent ? ' error' : '')}
                value={formData.dateLent}
                onChange={handleInputChange}
              />
              {errors.dateLent && (
                <ul className="field-errors">
                  {errors.dateLent.map((error, i) => (
                    <li key={i} className="field-error">{error}</li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="return-date" className="form-label">
                Expected Return <span className="required">*</span>
              </label>
              <input
                type="date"
                id="return-date"
                name="expectedReturnDate"
                className={'form-input' + (errors.expectedReturnDate ? ' error' : '')}
                value={formData.expectedReturnDate}
                onChange={handleInputChange}
                min={formData.dateLent}
              />
              {errors.expectedReturnDate && (
                <ul className="field-errors">
                  {errors.expectedReturnDate.map((error, i) => (
                    <li key={i} className="field-error">{error}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="condition-expectation" className="form-label">
              Condition Expectations
            </label>
            <textarea
              id="condition-expectation"
              name="conditionExpectation"
              className="form-textarea"
              value={formData.conditionExpectation}
              onChange={handleInputChange}
              placeholder="Any specific expectations about how the item should be returned..."
              rows="2"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lending-notes" className="form-label">
              Additional Notes
            </label>
            <textarea
              id="lending-notes"
              name="notes"
              className="form-textarea"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any other important information for the borrower..."
              rows="2"
            />
          </div>
        </section>

        <section className="form-section">
          <h2 className="section-title">Options</h2>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="requireDeposit"
                checked={formData.requireDeposit}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">Require security deposit</span>
            </label>
          </div>
          
          {formData.requireDeposit && (
            <div className="form-group deposit-amount-group">
              <label htmlFor="deposit-amount" className="form-label">
                Deposit Amount ($) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="deposit-amount"
                name="depositAmount"
                className={'form-input' + (errors.depositAmount ? ' error' : '')}
                value={formData.depositAmount}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errors.depositAmount && (
                <ul className="field-errors">
                  {errors.depositAmount.map((error, i) => (
                    <li key={i} className="field-error">{error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="allowExtensions"
                checked={formData.allowExtensions}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">Allow borrower to request extensions</span>
            </label>
          </div>
        </section>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigateTo('inventory')}
          >
            Cancel
          </button>
          <button type="submit" className="submit-button">
            Create Lending
          </button>
        </div>
      </form>
    </div>
  );
}

export default LendingForm;
