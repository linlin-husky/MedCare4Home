import { useEffect, useState } from 'react';
import { ACTIONS } from '../reducers/appReducer.js';
import * as api from '../services/api.js';
import { formatDate, capitalizeFirst, getStatusColor, getDaysUntil, getTrustScoreColor } from '../utils/helpers.js';
import './BorrowingList.css';

function BorrowingList({ state, dispatch, navigateTo }) {
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    loadBorrowings();
  }, []);

  function loadBorrowings() {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    api.getBorrowings()
      .then(data => {
        dispatch({ type: ACTIONS.SET_BORROWINGS, payload: data.borrowings });
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to load borrowings' });
      });
  }

  function getFilteredBorrowings() {
    switch (filter) {
      case 'active':
        return state.borrowings.filter(b => b.status === 'active' || b.status === 'return-initiated');
      case 'pending':
        return state.borrowings.filter(b => b.status === 'pending' || b.status === 'negotiating');
      case 'completed':
        return state.borrowings.filter(b => b.status === 'completed');
      case 'overdue':
        return state.borrowings.filter(b => {
          if (b.status !== 'active') return false;
          return getDaysUntil(b.terms.expectedReturnDate) < 0;
        });
      default:
        return state.borrowings;
    }
  }

  const filteredBorrowings = getFilteredBorrowings();
  const pendingCount = state.borrowings.filter(b => 
    b.status === 'pending' || b.status === 'negotiating'
  ).length;
  const overdueCount = state.borrowings.filter(b => 
    b.status === 'active' && getDaysUntil(b.terms.expectedReturnDate) < 0
  ).length;

  return (
    <div className="borrowing-list-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">My Borrowings</h1>
          <p className="page-subtitle">Items you have borrowed from others</p>
        </div>
        <button 
          className="browse-button"
          onClick={() => navigateTo('public-library')}
        >
          Browse Library
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
          {pendingCount > 0 && <span className="tab-badge">{pendingCount}</span>}
        </button>
        <button 
          className={'tab-button' + (filter === 'overdue' ? ' active' : '')}
          onClick={() => setFilter('overdue')}
        >
          Overdue
          {overdueCount > 0 && <span className="tab-badge danger">{overdueCount}</span>}
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

      {filteredBorrowings.length === 0 ? (
        <div className="empty-state">
          <p className="empty-message">
            {filter === 'all' 
              ? "You haven't borrowed any items yet."
              : "No " + filter + " borrowings found."
            }
          </p>
          {state.borrowings.length === 0 && (
            <button 
              className="action-button"
              onClick={() => navigateTo('public-library')}
            >
              Discover Items to Borrow
            </button>
          )}
        </div>
      ) : (
        <div className="borrowing-grid">
          {filteredBorrowings.map(borrowing => {
            const daysLeft = getDaysUntil(borrowing.terms.expectedReturnDate);
            const isOverdue = daysLeft < 0 && borrowing.status === 'active';
            
            return (
              <article 
                key={borrowing.id} 
                className={'borrowing-card' + (isOverdue ? ' overdue' : '')}
                onClick={() => navigateTo('lending-detail', { lending: borrowing })}
              >
                <header className="borrowing-header">
                  <h3 className="item-name">{borrowing.item?.name || 'Unknown Item'}</h3>
                  <span className={'status-badge ' + getStatusColor(borrowing.status)}>
                    {capitalizeFirst(borrowing.status)}
                  </span>
                </header>
                
                <div className="borrowing-lender">
                  <span className="label">From:</span>
                  <span className="lender-name">{borrowing.lender?.displayName}</span>
                  <span className={'lender-trust ' + getTrustScoreColor(borrowing.lender?.trustScore || 50)}>
                    {borrowing.lender?.trustScore || '?'}
                  </span>
                </div>
                
                <div className="borrowing-dates">
                  <div className="date-item">
                    <span className="label">Borrowed:</span>
                    <span>{formatDate(borrowing.terms.dateLent)}</span>
                  </div>
                  <div className="date-item">
                    <span className="label">Due:</span>
                    <span>{formatDate(borrowing.terms.expectedReturnDate)}</span>
                  </div>
                </div>
                
                {borrowing.status === 'active' && (
                  <div className={'due-indicator' + (isOverdue ? ' overdue' : daysLeft <= 3 ? ' soon' : '')}>
                    {isOverdue 
                      ? Math.abs(daysLeft) + ' days overdue!'
                      : daysLeft === 0 
                        ? 'Due today!'
                        : daysLeft + ' days left'
                    }
                  </div>
                )}
                
                {(borrowing.status === 'pending' || borrowing.status === 'negotiating') && (
                  <div className="pending-action waiting">
                    {borrowing.isBorrowRequest 
                      ? 'Waiting for owner to approve'
                      : 'Action required - Review terms'}
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

export default BorrowingList;

