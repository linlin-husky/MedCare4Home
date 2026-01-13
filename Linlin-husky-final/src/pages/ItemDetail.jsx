import { useEffect, useState } from 'react';
import { ACTIONS } from '../reducers/appReducer.js';
import * as api from '../services/api.js';
import { formatCurrency, formatDate, capitalizeFirst, getConditionColor, getStatusColor } from '../utils/helpers.js';
import starFilledIcon from '../assets/icons/star-filled.svg';
import starOutlineIcon from '../assets/icons/star-outline.svg';
import './ItemDetail.css';

function ItemDetail({ state, dispatch, navigateTo, item }) {
  const [history, setHistory] = useState([]);
  const [itemData, setItemData] = useState(item);

  useEffect(() => {
    if (item?.id) {
      loadItemDetails();
      loadHistory();
    }
  }, [item?.id]);

  function loadItemDetails() {
    api.getItem(item.id)
      .then(data => {
        setItemData(data.item);
      })
      .catch(() => {});
  }

  function loadHistory() {
    api.getItemHistory(item.id)
      .then(data => {
        setHistory(data.history);
      })
      .catch(() => {});
  }

  if (!itemData) {
    return (
      <div className="item-detail-page">
        <p>Item not found</p>
        <button onClick={() => navigateTo('inventory')}>Back to Inventory</button>
      </div>
    );
  }

  return (
    <div className="item-detail-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigateTo('inventory')}>
          ← Back to Inventory
        </button>
      </div>

      <article className="item-detail-card">
        <header className="detail-header">
          <div className="detail-title-row">
            <h1 className="detail-title">{itemData.name}</h1>
            <span className={'status-badge ' + getStatusColor(itemData.status)}>
              {capitalizeFirst(itemData.status)}
            </span>
          </div>
          <div className="detail-meta">
            <span className="category-badge">{capitalizeFirst(itemData.category)}</span>
            <span className={'condition-badge ' + getConditionColor(itemData.condition)}>
              {capitalizeFirst(itemData.condition)} Condition
            </span>
            {itemData.isPublic && <span className="public-badge">Public</span>}
          </div>
        </header>

        <section className="detail-section">
          <h2 className="section-title">Description</h2>
          <p className="detail-text">
            {itemData.description || 'No description provided'}
          </p>
        </section>

        <section className="detail-section">
          <h2 className="section-title">Value</h2>
          <p className="detail-value">{formatCurrency(itemData.estimatedValue)}</p>
        </section>

        {itemData.notes && (
          <section className="detail-section">
            <h2 className="section-title">Care Instructions</h2>
            <p className="detail-text">{itemData.notes}</p>
          </section>
        )}

        <section className="detail-section">
          <h2 className="section-title">Item Information</h2>
          <dl className="info-list">
            <div className="info-item">
              <dt>Added</dt>
              <dd>{formatDate(itemData.createdAt)}</dd>
            </div>
            <div className="info-item">
              <dt>Last Updated</dt>
              <dd>{formatDate(itemData.updatedAt)}</dd>
            </div>
            <div className="info-item">
              <dt>Times Lent</dt>
              <dd>{itemData.lendingHistory?.length || 0}</dd>
            </div>
          </dl>
        </section>

        {itemData.status === 'available' && (
          <div className="detail-actions">
            <button 
              className="action-button primary"
              onClick={() => navigateTo('lending-form', { item: itemData })}
            >
              Lend This Item
            </button>
            <button 
              className="action-button secondary"
              onClick={() => navigateTo('item-form', { item: itemData })}
            >
              Edit Item
            </button>
          </div>
        )}
      </article>

      {history.length > 0 && (
        <section className="history-section">
          <h2 className="section-title">Lending History</h2>
          <div className="history-list">
            {history.map(record => (
              <article 
                key={record.id} 
                className="history-card"
                onClick={() => navigateTo('lending-detail', { lending: record })}
              >
                <div className="history-header">
                  <span className="borrower-name">
                    {record.borrower?.displayName || record.borrowerInfo?.name || 'Unknown'}
                  </span>
                  <span className={'status-tag ' + getStatusColor(record.status)}>
                    {capitalizeFirst(record.status)}
                  </span>
                </div>
                <div className="history-dates">
                  <span>Lent: {formatDate(record.terms?.dateLent)}</span>
                  {record.actualReturnDate && (
                    <span>Returned: {formatDate(record.actualReturnDate)}</span>
                  )}
                </div>
                {record.borrowerRating && (
                  <div className="history-rating">
                    <span className="rating-label">Rating given:</span>
                    <span className="rating-stars">
                      {[1, 2, 3, 4, 5].map(star => (
                        <img 
                          key={star} 
                          src={star <= record.borrowerRating ? starFilledIcon : starOutlineIcon} 
                          alt="" 
                          className={'star-icon' + (star <= record.borrowerRating ? ' filled' : '')} 
                        />
                      ))}
                    </span>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ItemDetail;

