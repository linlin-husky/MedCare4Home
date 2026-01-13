import { useEffect, useState } from 'react';
import { ACTIONS } from '../reducers/appReducer.js';
import * as api from '../services/api.js';
import { formatDate, formatCurrency, capitalizeFirst, getStatusColor, getDaysUntil } from '../utils/helpers.js';
import './LendingList.css';

function LendingList({ state, dispatch, navigateTo }) {
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    loadLendings();
  }, []);

  function loadLendings() {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    api.getLendings()
      .then(data => {
        dispatch({ type: ACTIONS.SET_LENDINGS, payload: data.lendings });
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to load lendings' });
      });
  }

  function getFilteredLendings() {
    switch (filter) {
      case 'active':
        return state.lendings.filter(l => l.status === 'active' || l.status === 'return-initiated');
      case 'pending':
        return state.lendings.filter(l => l.status === 'pending' || l.status === 'negotiating');
      case 'completed':
        return state.lendings.filter(l => l.status === 'completed');
      case 'overdue':
        return state.lendings.filter(l => {
          if (l.status !== 'active') return false;
          return getDaysUntil(l.terms.expectedReturnDate) < 0;
        });
      default:
        return state.lendings;
    }
  }

  const filteredLendings = getFilteredLendings();
  const overdueCounts = state.lendings.filter(l => 
    l.status === 'active' && getDaysUntil(l.terms.expectedReturnDate) < 0
  ).length;

  return (
    <div className="lending-list-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">My Lendings</h1>
          <p className="page-subtitle">Items you have lent to others</p>
        </div>
        <button 
          className="add-button"
          onClick={() => navigateTo('inventory')}
        >
          Lend an Item
        </button>
      </div>

      <div className="filter-tabs">
        <button 
          className={'tab-button' + (filter === 'active' ? ' active' : '')}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button 
          className={'tab-button' + (filter === 'pending' ? ' active' : '')}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={'tab-button' + (filter === 'overdue' ? ' active' : '')}
          onClick={() => setFilter('overdue')}
        >
          Overdue
          {overdueCounts > 0 && <span className="tab-badge">{overdueCounts}</span>}
        </button>
        <button 
          className={'tab-button' + (filter === 'completed' ? ' active' : '')}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
        <button 
          className={'tab-button' + (filter === 'all' ? ' active' : '')}
          onClick={() => setFilter('all')}
        >
          All
        </button>
      </div>

      {filteredLendings.length === 0 ? (
        <div className="empty-state">
          <p className="empty-message">
            {filter === 'all' 
              ? "You haven't lent any items yet."
              : "No " + filter + " lendings found."
            }
          </p>
          {state.lendings.length === 0 && (
            <button 
              className="action-button"
              onClick={() => navigateTo('inventory')}
            >
              Browse Your Items
            </button>
          )}
        </div>
      ) : (
        <div className="lending-grid">
          {filteredLendings.map(lending => {
            const daysLeft = getDaysUntil(lending.terms.expectedReturnDate);
            const isOverdue = daysLeft < 0 && lending.status === 'active';
            
            return (
              <article 
                key={lending.id} 
                className={'lending-card' + (isOverdue ? ' overdue' : '')}
                onClick={() => navigateTo('lending-detail', { lending })}
              >
                <header className="lending-header">
                  <h3 className="item-name">{lending.item?.name || 'Unknown Item'}</h3>
                  <span className={'status-badge ' + getStatusColor(lending.status)}>
                    {capitalizeFirst(lending.status)}
                  </span>
                </header>
                
                <div className="lending-borrower">
                  <span className="label">Borrower:</span>
                  <span className="borrower-name">
                    {lending.borrower?.displayName || lending.borrowerInfo?.name || 'Unknown'}
                  </span>
                </div>
                
                <div className="lending-dates">
                  <div className="date-item">
                    <span className="label">Lent:</span>
                    <span>{formatDate(lending.terms.dateLent)}</span>
                  </div>
                  <div className="date-item">
                    <span className="label">Due:</span>
                    <span>{formatDate(lending.terms.expectedReturnDate)}</span>
                  </div>
                </div>
                
                {lending.status === 'active' && (
                  <div className={'due-indicator' + (isOverdue ? ' overdue' : daysLeft <= 3 ? ' soon' : '')}>
                    {isOverdue 
                      ? Math.abs(daysLeft) + ' days overdue'
                      : daysLeft === 0 
                        ? 'Due today'
                        : daysLeft + ' days left'
                    }
                  </div>
                )}
                
                {lending.terms.requireDeposit && (
                  <div className="deposit-info">
                    Deposit: {formatCurrency(lending.terms.depositAmount)}
                  </div>
                )}
                
                {lending.extensionRequest?.status === 'pending' && (
                  <div className="extension-pending">
                    Extension requested
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LendingList;

