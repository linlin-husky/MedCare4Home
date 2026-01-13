import { useState, useEffect } from 'react';
import { ACTIONS } from '../reducers/appReducer.js';
import * as api from '../services/api.js';
import { capitalizeFirst, validateRequired, validatePositiveNumber } from '../utils/helpers.js';
import './ItemForm.css';

function ItemForm({ state, dispatch, navigateTo, item }) {
  const isEditing = Boolean(item);
  const [categories, setCategories] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    category: item?.category || '',
    condition: item?.condition || '',
    estimatedValue: item?.estimatedValue || '',
    notes: item?.notes || '',
    isPublic: item?.isPublic || false
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.getCategories()
      .then(data => setCategories(data.categories))
      .catch(() => {});
    
    api.getConditions()
      .then(data => setConditions(data.conditions))
      .catch(() => {});
  }, []);

  function validateForm() {
    const newErrors = {};
    
    const nameErrors = validateRequired(formData.name, 'Item name');
    if (nameErrors.length > 0) {
      newErrors.name = nameErrors;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = ['Item name must be at least 2 characters'];
    }
    
    const categoryErrors = validateRequired(formData.category, 'Category');
    if (categoryErrors.length > 0) {
      newErrors.category = categoryErrors;
    }
    
    const conditionErrors = validateRequired(formData.condition, 'Condition');
    if (conditionErrors.length > 0) {
      newErrors.condition = conditionErrors;
    }
    
    if (formData.estimatedValue) {
      const valueErrors = validatePositiveNumber(formData.estimatedValue, 'Estimated value');
      if (valueErrors.length > 0) {
        newErrors.estimatedValue = valueErrors;
      }
    }
    
    if (formData.isPublic && !formData.estimatedValue) {
      newErrors.estimatedValue = ['Estimated value is required for public items'];
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
    
    const submitData = {
      ...formData,
      estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : 0
    };
    
    const apiCall = isEditing 
      ? api.updateItem(item.id, submitData)
      : api.createItem(submitData);
    
    apiCall
      .then(data => {
        if (isEditing) {
          dispatch({ type: ACTIONS.UPDATE_ITEM, payload: data.item });
          dispatch({ type: ACTIONS.SET_SUCCESS, payload: 'Item updated successfully' });
        } else {
          dispatch({ type: ACTIONS.ADD_ITEM, payload: data.item });
          dispatch({ type: ACTIONS.SET_SUCCESS, payload: 'Item created successfully' });
        }
        navigateTo('inventory');
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to save item' });
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

  return (
    <div className="item-form-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigateTo('inventory')}>
          ← Back to Inventory
        </button>
        <h1 className="page-title">{isEditing ? 'Edit Item' : 'Add New Item'}</h1>
      </div>

      <form className="item-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2 className="section-title">Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="item-name" className="form-label">
              Item Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="item-name"
              name="name"
              className={'form-input' + (errors.name ? ' error' : '')}
              value={formData.name}
              onChange={handleInputChange}
              placeholder="What are you lending?"
            />
            {errors.name && (
              <ul className="field-errors">
                {errors.name.map((error, i) => (
                  <li key={i} className="field-error">{error}</li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="item-category" className="form-label">
                Category <span className="required">*</span>
              </label>
              <select
                id="item-category"
                name="category"
                className={'form-select' + (errors.category ? ' error' : '')}
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{capitalizeFirst(cat)}</option>
                ))}
              </select>
              {errors.category && (
                <ul className="field-errors">
                  {errors.category.map((error, i) => (
                    <li key={i} className="field-error">{error}</li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="item-condition" className="form-label">
                Condition <span className="required">*</span>
              </label>
              <select
                id="item-condition"
                name="condition"
                className={'form-select' + (errors.condition ? ' error' : '')}
                value={formData.condition}
                onChange={handleInputChange}
              >
                <option value="">Select condition</option>
                {conditions.map(cond => (
                  <option key={cond} value={cond}>{capitalizeFirst(cond)}</option>
                ))}
              </select>
              {errors.condition && (
                <ul className="field-errors">
                  {errors.condition.map((error, i) => (
                    <li key={i} className="field-error">{error}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="item-description" className="form-label">
              Description
            </label>
            <textarea
              id="item-description"
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the item..."
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">Value and Notes</h2>
          
          <div className="form-group">
            <label htmlFor="item-value" className="form-label">
              Estimated Value ($)
              {formData.isPublic && <span className="required">*</span>}
            </label>
            <input
              type="number"
              id="item-value"
              name="estimatedValue"
              className={'form-input' + (errors.estimatedValue ? ' error' : '')}
              value={formData.estimatedValue}
              onChange={handleInputChange}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            {errors.estimatedValue && (
              <ul className="field-errors">
                {errors.estimatedValue.map((error, i) => (
                  <li key={i} className="field-error">{error}</li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="item-notes" className="form-label">
              Care Instructions / Notes
            </label>
            <textarea
              id="item-notes"
              name="notes"
              className="form-textarea"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any special care instructions or notes for borrowers..."
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">Visibility</h2>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">
                Make this item available for community borrowing
              </span>
            </label>
            <p className="field-hint">
              Public items can be discovered and requested by other platform users
            </p>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigateTo('inventory')}
          >
            Cancel
          </button>
          <button type="submit" className="submit-button">
            {isEditing ? 'Save Changes' : 'Create Item'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ItemForm;

