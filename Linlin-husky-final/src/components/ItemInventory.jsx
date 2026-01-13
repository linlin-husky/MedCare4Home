import { useEffect, useState } from 'react';
import { ACTIONS } from '../reducers/appReducer.js';
import * as api from '../services/api.js';
import { formatCurrency, capitalizeFirst, getConditionColor, getStatusColor } from '../utils/helpers.js';
import ConfirmDialog from './ConfirmDialog.jsx';
import './ItemInventory.css';

function ItemInventory({ state, dispatch, navigateTo }) {
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    item: null
  });

  useEffect(() => {
    loadItems();
    loadCategories();
  }, []);

  function loadItems() {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    api.getItems()
      .then(data => {
        dispatch({ type: ACTIONS.SET_ITEMS, payload: data.items });
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to load items' });
      });
  }

  function loadCategories() {
    api.getCategories()
      .then(data => {
        setCategories(data.categories);
      })
      .catch(() => { });
  }

  function handleDeleteClick(item) {
    setConfirmDialog({
      isOpen: true,
      item: item
    });
  }

  function handleConfirmDelete() {
    const item = confirmDialog.item;
    setConfirmDialog({ isOpen: false, item: null });

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    api.deleteItem(item.id)
      .then(() => {
        dispatch({ type: ACTIONS.REMOVE_ITEM, payload: item.id });
        dispatch({ type: ACTIONS.SET_SUCCESS, payload: 'Item deleted successfully' });
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to delete item' });
      });
  }

  function handleCancelDelete() {
    setConfirmDialog({ isOpen: false, item: null });
  }

  function getFilteredItems() {
    let filtered = state.items;

    if (filter === 'available') {
      filtered = filtered.filter(item => item.status === 'available');
    } else if (filter === 'lent') {
      filtered = filtered.filter(item => item.status === 'lent');
    }

    if (categoryFilter) {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  const filteredItems = getFilteredItems();
  const totalValue = filteredItems.reduce((sum, item) => sum + (item.estimatedValue || 0), 0);

  return (
    <div className="inventory-page">
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Item"
        message={'Are you sure you want to delete "' + (confirmDialog.item?.name || '') + '"? This action cannot be undone.'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">My Items</h1>
          <p className="page-subtitle">
            {filteredItems.length} items • Total value: {formatCurrency(totalValue)}
          </p>
        </div>
        <button
          className="add-button"
          onClick={() => navigateTo('item-form')}
        >
          + Add Item
        </button>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <label htmlFor="status-filter" className="filter-label">Status:</label>
          <select
            id="status-filter"
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Items</option>
            <option value="available">Available</option>
            <option value="lent">Lent Out</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="category-filter" className="filter-label">Category:</label>
          <select
            id="category-filter"
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{capitalizeFirst(cat)}</option>
            ))}
          </select>
        </div>

        <div className="search-group">
          <label htmlFor="item-search" className="visually-hidden">Search items</label>
          <input
            type="text"
            id="item-search"
            className="search-input"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <p className="empty-message">
            {state.items.length === 0
              ? "You haven't added any items yet. Start by adding your first item!"
              : "No items match your filters."
            }
          </p>
          {state.items.length === 0 && (
            <button
              className="add-button"
              onClick={() => navigateTo('item-form')}
            >
              Add Your First Item
            </button>
          )}
        </div>
      ) : (
        <div className="items-grid">
          {filteredItems.map(item => (
            <article key={item.id} className="item-card">
              <div className="item-header">
                <h3 className="item-name">{item.name}</h3>
                <span className={'item-status ' + getStatusColor(item.status)}>
                  {capitalizeFirst(item.status)}
                </span>
              </div>

              <div className="item-details">
                <span className="item-category">{capitalizeFirst(item.category)}</span>
                <span className={'item-condition ' + getConditionColor(item.condition)}>
                  {capitalizeFirst(item.condition)}
                </span>
              </div>

              {item.description && (
                <p className="item-description">{item.description}</p>
              )}

              <div className="item-meta">
                <span className="item-value">{formatCurrency(item.estimatedValue)}</span>
                {item.isPublic && <span className="public-badge">Public</span>}
              </div>

              <div className="item-actions">
                <button
                  className="action-button view"
                  onClick={() => navigateTo('item-detail', { item })}
                >
                  View
                </button>
                {item.status === 'available' && (
                  <>
                    <button
                      className="action-button edit"
                      onClick={() => navigateTo('item-form', { item })}
                    >
                      Edit
                    </button>
                    <button
                      className="action-button lend"
                      onClick={() => navigateTo('lending-form', { item })}
                    >
                      Lend
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => handleDeleteClick(item)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default ItemInventory;

