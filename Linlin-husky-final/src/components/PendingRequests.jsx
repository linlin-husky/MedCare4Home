import { useEffect } from 'react';
import { ACTIONS } from '../reducers/appReducer.js';
import * as api from '../services/api.js';
import { formatDate, capitalizeFirst, getTrustScoreColor } from '../utils/helpers.js';
import './PendingRequests.css';

function PendingRequests({ state, dispatch, navigateTo }) {
  useEffect(() => {
    loadPendingRequests();
  }, []);

  function loadPendingRequests() {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    api.getPendingRequests()
      .then(data => {
        dispatch({ type: ACTIONS.SET_PENDING_REQUESTS, payload: data.requests });
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to load requests' });
      });
  }

  function handleAccept(request) {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    api.acceptLending(request.id)
      .then(() => {
        dispatch({ type: ACTIONS.SET_SUCCESS, payload: 'Request accepted!' });
        loadPendingRequests();
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to accept' });
      });
  }

  function handleDecline(request) {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    api.declineLending(request.id, 'Declined')
      .then(() => {
        dispatch({ type: ACTIONS.SET_SUCCESS, payload: 'Request declined' });
        loadPendingRequests();
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to decline' });
      });
  }

  return (
    <div className="pending-requests-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigateTo('dashboard')}>
          ← Back to Dashboard
        </button>
        <h1 className="page-title">Pending Requests</h1>
      </div>

      {state.pendingRequests.length === 0 ? (
        <div className="empty-state">
          <p className="empty-message">No pending requests at this time.</p>
          <button 
            className="action-button"
            onClick={() => navigateTo('public-library')}
          >
            Browse Items to Borrow
          </button>
        </div>
      ) : (
        <div className="requests-list">
          {state.pendingRequests.map(request => (
            <article key={request.id} className="request-card">
              <header className="request-header">
                <h2 className="item-name">{request.item?.name || 'Unknown Item'}</h2>
                <span className={'status-badge ' + request.status}>
                  {capitalizeFirst(request.status)}
                </span>
              </header>
              
              <div className="request-details">
                <div className="requester-info">
                  <span className="label">
                    {request.isBorrowRequest ? 'Requester:' : 'From:'}
                  </span>
                  <span className="requester-name">
                    {request.isBorrowRequest 
                      ? (request.borrower?.displayName || 'Unknown')
                      : request.lender?.displayName}
                  </span>
                  <span className={'trust-badge ' + getTrustScoreColor(
                    request.isBorrowRequest 
                      ? (request.borrower?.trustScore || 50) 
                      : (request.lender?.trustScore || 50)
                  )}>
                    Trust: {request.isBorrowRequest 
                      ? (request.borrower?.trustScore || '?') 
                      : (request.lender?.trustScore || '?')}
                  </span>
                </div>
                {request.isBorrowRequest && (
                  <div className="request-type-info">
                    <span className="request-type-badge">Borrow Request</span>
                  </div>
                )}
                
                <div className="terms-summary">
                  <div className="term">
                    <span className="label">Duration:</span>
                    <span>{formatDate(request.terms.dateLent)} - {formatDate(request.terms.expectedReturnDate)}</span>
                  </div>
                  {request.terms.requireDeposit && (
                    <div className="term">
                      <span className="label">Deposit Required:</span>
                      <span>${request.terms.depositAmount}</span>
                    </div>
                  )}
                </div>
                
                {request.terms.conditionExpectation && (
                  <div className="expectations">
                    <span className="label">Expectations:</span>
                    <p>{request.terms.conditionExpectation}</p>
                  </div>
                )}
                
                {request.negotiationRounds > 0 && (
                  <div className="negotiation-info">
                    <span className="rounds">Negotiation round {request.negotiationRounds} of 3</span>
                  </div>
                )}
              </div>
              
              <div className="request-actions">
                <button 
                  className="view-button"
                  onClick={() => navigateTo('lending-detail', { lending: request })}
                >
                  View Details
                </button>
                <button 
                  className="accept-button"
                  onClick={() => handleAccept(request)}
                >
                  Accept
                </button>
                <button 
                  className="decline-button"
                  onClick={() => handleDecline(request)}
                >
                  Decline
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default PendingRequests;

