import { useEffect, useState } from 'react';
import { ACTIONS } from '../reducers/appReducer.js';
import * as api from '../services/api.js';
import { formatDate, formatCurrency, capitalizeFirst, getStatusColor, getDaysUntil, getTrustScoreColor, getConditionColor } from '../utils/helpers.js';
import starFilledIcon from '../assets/icons/star-filled.svg';
import starOutlineIcon from '../assets/icons/star-outline.svg';
import './LendingDetail.css';

function LendingDetail({ state, dispatch, navigateTo, lending }) {
  const [lendingData, setLendingData] = useState(lending);
  const [rating, setRating] = useState(0);
  const [returnCondition, setReturnCondition] = useState('');
  const [returnNotes, setReturnNotes] = useState('');
  const [extensionDate, setExtensionDate] = useState('');
  const [extensionReason, setExtensionReason] = useState('');
  const [negotiationTerms, setNegotiationTerms] = useState({});
  const [negotiationMessage, setNegotiationMessage] = useState('');
  const [showNegotiate, setShowNegotiate] = useState(false);
  const [conditions, setConditions] = useState([]);

  useEffect(() => {
    if (lending?.id) {
      loadLendingDetails();
      loadConditions();
    }
  }, [lending?.id]);

  function loadLendingDetails() {
    api.getLending(lending.id)
      .then(data => {
        setLendingData(data.lending);
      })
      .catch(() => {});
  }

  function loadConditions() {
    api.getConditions()
      .then(data => setConditions(data.conditions))
      .catch(() => {});
  }

  function handleAccept() {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    api.acceptLending(lending.id)
      .then(data => {
        setLendingData(data.lending);
        dispatch({ type: ACTIONS.SET_SUCCESS, payload: 'Lending accepted!' });
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to accept' });
      });
  }

  function handleDecline() {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    api.declineLending(lending.id, 'Declined by borrower')
      .then(() => {
        dispatch({ type: ACTIONS.SET_SUCCESS, payload: 'Lending declined' });
        navigateTo('borrowings');
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to decline' });
      });
  }

  function handleNegotiate() {
    if (Object.keys(negotiationTerms).length === 0) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Please propose at least one change' });
      return;
    }
    
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    api.negotiateLending(lending.id, negotiationTerms, negotiationMessage)
      .then(data => {
        setLendingData(data.lending);
        setShowNegotiate(false);
        setNegotiationTerms({});
        setNegotiationMessage('');
        dispatch({ type: ACTIONS.SET_SUCCESS, payload: 'Counter-proposal sent!' });
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to negotiate' });
      });
  }

  function handleRequestExtension() {
    if (!extensionDate) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Please select a new return date' });
      return;
    }
    
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    api.requestExtension(lending.id, extensionDate, extensionReason)
      .then(data => {
        setLendingData(data.lending);
        setExtensionDate('');
        setExtensionReason('');
        dispatch({ type: ACTIONS.SET_SUCCESS, payload: 'Extension requested!' });
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to request extension' });
      });
  }

  function handleRespondToExtension(approved) {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    api.respondToExtension(lending.id, approved)
      .then(data => {
        setLendingData(data.lending);
        dispatch({ type: ACTIONS.SET_SUCCESS, payload: approved ? 'Extension approved!' : 'Extension denied' });
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to respond' });
      });
  }

  function handleInitiateReturn() {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    api.initiateReturn(lending.id)
      .then(data => {
        setLendingData(data.lending);
        dispatch({ type: ACTIONS.SET_SUCCESS, payload: 'Return initiated!' });
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to initiate return' });
      });
  }

  function handleConfirmReturn() {
    if (returnCondition && returnCondition !== lendingData.conditionAtLending && !returnNotes) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Please explain the condition change' });
      return;
    }
    
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    api.confirmReturn(lending.id, returnCondition || lendingData.conditionAtLending, returnNotes)
      .then(data => {
        setLendingData(data.lending);
        dispatch({ type: ACTIONS.SET_SUCCESS, payload: 'Return confirmed!' });
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to confirm return' });
      });
  }

  function handleRate() {
    if (rating < 1 || rating > 5) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Please select a rating' });
      return;
    }
    
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    api.rateLending(lending.id, rating, lendingData.isBorrower)
      .then(data => {
        setLendingData(data.lending);
        dispatch({ type: ACTIONS.SET_SUCCESS, payload: 'Rating submitted!' });
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to submit rating' });
      });
  }

  if (!lendingData) {
    return (
      <div className="lending-detail-page">
        <p>Lending not found</p>
        <button onClick={() => navigateTo('lendings')}>Back to Lendings</button>
      </div>
    );
  }

  const daysLeft = getDaysUntil(lendingData.terms.expectedReturnDate);
  const isOverdue = daysLeft < 0 && lendingData.status === 'active';

  return (
    <div className="lending-detail-page">
      <div className="page-header">
        <button 
          className="back-button" 
          onClick={() => navigateTo(lendingData.isBorrower ? 'borrowings' : 'lendings')}
        >
          ← Back
        </button>
      </div>

      <article className="lending-detail-card">
        <header className="detail-header">
          <h1 className="detail-title">{lendingData.item?.name || 'Unknown Item'}</h1>
          <span className={'status-badge large ' + getStatusColor(lendingData.status)}>
            {capitalizeFirst(lendingData.status)}
          </span>
        </header>

        <section className="parties-section">
          <div className="party-card lender">
            <h3 className="party-label">Lender</h3>
            <div className="party-info">
              <span className="party-name">{lendingData.lender?.displayName}</span>
              {lendingData.lender && (
                <span className={'party-trust ' + getTrustScoreColor(lendingData.lender.trustScore)}>
                  Trust: {lendingData.lender.trustScore}
                </span>
              )}
            </div>
          </div>
          
          <div className="party-card borrower">
            <h3 className="party-label">Borrower</h3>
            <div className="party-info">
              <span className="party-name">
                {lendingData.borrower?.displayName || lendingData.borrowerInfo?.name}
              </span>
              {lendingData.borrower && (
                <span className={'party-trust ' + getTrustScoreColor(lendingData.borrower.trustScore)}>
                  Trust: {lendingData.borrower.trustScore}
                </span>
              )}
              {!lendingData.borrowerInfo?.isPlatformUser && (
                <span className="external-badge">External</span>
              )}
            </div>
          </div>
        </section>

        <section className="terms-section">
          <h2 className="section-title">Lending Terms</h2>
          <dl className="terms-list">
            <div className="term-item">
              <dt>Date Lent</dt>
              <dd>{formatDate(lendingData.terms.dateLent)}</dd>
            </div>
            <div className="term-item">
              <dt>Expected Return</dt>
              <dd>{formatDate(lendingData.terms.expectedReturnDate)}</dd>
            </div>
            <div className="term-item">
              <dt>Condition at Lending</dt>
              <dd className={getConditionColor(lendingData.conditionAtLending)}>
                {capitalizeFirst(lendingData.conditionAtLending)}
              </dd>
            </div>
            {lendingData.terms.requireDeposit && (
              <div className="term-item">
                <dt>Security Deposit</dt>
                <dd>{formatCurrency(lendingData.terms.depositAmount)}</dd>
              </div>
            )}
            <div className="term-item">
              <dt>Extensions Allowed</dt>
              <dd>{lendingData.terms.allowExtensions ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
          
          {lendingData.terms.conditionExpectation && (
            <div className="term-notes">
              <h3>Condition Expectations</h3>
              <p>{lendingData.terms.conditionExpectation}</p>
            </div>
          )}
          
          {lendingData.terms.notes && (
            <div className="term-notes">
              <h3>Additional Notes</h3>
              <p>{lendingData.terms.notes}</p>
            </div>
          )}
        </section>

        {lendingData.status === 'active' && (
          <section className={'status-section' + (isOverdue ? ' overdue' : '')}>
            <div className="due-status">
              {isOverdue 
                ? <span className="overdue-text">{Math.abs(daysLeft)} days overdue!</span>
                : daysLeft === 0
                  ? <span className="due-today">Due today</span>
                  : <span className="days-left">{daysLeft} days until due</span>
              }
            </div>
          </section>
        )}

        {(lendingData.status === 'pending' || lendingData.status === 'negotiating') && (

          (lendingData.isBorrowRequest ? lendingData.isLender : lendingData.isBorrower) ? (
            <section className="action-section">
              <h2 className="section-title">
                {lendingData.isBorrowRequest ? 'Borrow Request' : 'Respond to Lending Offer'}
              </h2>
              
              {lendingData.isBorrowRequest && (
                <div className="request-info">
                  <p>{lendingData.borrower?.displayName || 'Someone'} wants to borrow this item.</p>
                </div>
              )}
              
              {lendingData.negotiationHistory?.length > 0 && (
                <div className="negotiation-history">
                  <h3>Negotiation History</h3>
                  {lendingData.negotiationHistory.map((round, i) => (
                    <div key={i} className="negotiation-round">
                      <span className="round-number">Round {round.round}</span>
                      <span className="round-by">by {round.proposedBy}</span>
                      {round.message && <p className="round-message">{round.message}</p>}
                    </div>
                  ))}
                  <p className="negotiation-warning">
                    {3 - lendingData.negotiationRounds} rounds remaining before auto-decline
                  </p>
                </div>
              )}
              
              <div className="response-buttons">
                <button className="accept-button" onClick={handleAccept}>
                  {lendingData.isBorrowRequest ? 'Approve Request' : 'Accept Terms'}
                </button>
                <button className="decline-button" onClick={handleDecline}>
                  Decline
                </button>
                <button 
                  className="negotiate-button"
                  onClick={() => setShowNegotiate(!showNegotiate)}
                >
                  Propose Different Terms
                </button>
              </div>
              
              {showNegotiate && (
                <div className="negotiate-form">
                  <div className="form-group">
                    <label htmlFor="new-return-date" className="form-label">New Return Date</label>
                    <input
                      type="date"
                      id="new-return-date"
                      className="form-input"
                      onChange={(e) => setNegotiationTerms(prev => ({ ...prev, expectedReturnDate: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="negotiation-message" className="form-label">Message</label>
                    <textarea
                      id="negotiation-message"
                      className="form-textarea"
                      value={negotiationMessage}
                      onChange={(e) => setNegotiationMessage(e.target.value)}
                      placeholder="Explain your counter-proposal..."
                    />
                  </div>
                  <button className="submit-button" onClick={handleNegotiate}>
                    Send Counter-Proposal
                  </button>
                </div>
              )}
            </section>
          ) : (
            <section className="waiting-section">
              <h2 className="section-title">Waiting for Response</h2>
              <p className="waiting-message">
                {lendingData.isBorrowRequest 
                  ? 'Your borrow request is pending. Waiting for the owner to respond.'
                  : 'This lending offer is pending. Waiting for the borrower to respond.'}
              </p>
            </section>
          )
        )}

        {lendingData.extensionRequest?.status === 'pending' && lendingData.isLender && (
          <section className="action-section extension-request">
            <h2 className="section-title">Extension Request</h2>
            <p>
              Borrower requested extension to: {formatDate(lendingData.extensionRequest.newReturnDate)}
            </p>
            {lendingData.extensionRequest.reason && (
              <p>Reason: {lendingData.extensionRequest.reason}</p>
            )}
            <div className="response-buttons">
              <button 
                className="accept-button"
                onClick={() => handleRespondToExtension(true)}
              >
                Approve Extension
              </button>
              <button 
                className="decline-button"
                onClick={() => handleRespondToExtension(false)}
              >
                Deny Extension
              </button>
            </div>
          </section>
        )}

        {lendingData.status === 'active' && lendingData.isBorrower && lendingData.terms.allowExtensions && (
          <section className="action-section">
            <h2 className="section-title">Request Extension</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="extension-date" className="form-label">New Return Date</label>
                <input
                  type="date"
                  id="extension-date"
                  className="form-input"
                  value={extensionDate}
                  onChange={(e) => setExtensionDate(e.target.value)}
                  min={lendingData.terms.expectedReturnDate}
                />
              </div>
              <div className="form-group">
                <label htmlFor="extension-reason" className="form-label">Reason</label>
                <input
                  type="text"
                  id="extension-reason"
                  className="form-input"
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  placeholder="Why do you need more time?"
                />
              </div>
            </div>
            <button className="action-button" onClick={handleRequestExtension}>
              Request Extension
            </button>
          </section>
        )}

        {lendingData.status === 'active' && lendingData.isBorrower && (
          <section className="action-section">
            <h2 className="section-title">Return Item</h2>
            <button className="return-button" onClick={handleInitiateReturn}>
              Initiate Return
            </button>
          </section>
        )}

        {lendingData.status === 'return-initiated' && lendingData.isLender && (
          <section className="action-section">
            <h2 className="section-title">Confirm Return</h2>
            <div className="form-group">
              <label htmlFor="return-condition" className="form-label">Condition Upon Return</label>
              <select
                id="return-condition"
                className="form-select"
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
              >
                <option value="">Same as before ({capitalizeFirst(lendingData.conditionAtLending)})</option>
                {conditions.map(cond => (
                  <option key={cond} value={cond}>{capitalizeFirst(cond)}</option>
                ))}
              </select>
            </div>
            
            {returnCondition && returnCondition !== lendingData.conditionAtLending && (
              <div className="form-group">
                <label htmlFor="return-notes" className="form-label">
                  Explain Condition Change <span className="required">*</span>
                </label>
                <textarea
                  id="return-notes"
                  className="form-textarea"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Describe any damage or changes..."
                />
              </div>
            )}
            
            <button className="confirm-button" onClick={handleConfirmReturn}>
              Confirm Return
            </button>
          </section>
        )}

        {lendingData.status === 'completed' && (
          <section className="completed-section">
            <h2 className="section-title">Lending Completed</h2>
            <dl className="completed-info">
              <div className="info-item">
                <dt>Returned On</dt>
                <dd>{formatDate(lendingData.actualReturnDate)}</dd>
              </div>
              <div className="info-item">
                <dt>Condition at Return</dt>
                <dd className={getConditionColor(lendingData.conditionAtReturn)}>
                  {capitalizeFirst(lendingData.conditionAtReturn)}
                </dd>
              </div>
            </dl>
            
            {lendingData.isBorrower && !lendingData.lenderRating && (
              <div className="rating-section">
                <h3>Rate the Lender</h3>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      className={'star-button' + (rating >= star ? ' active' : '')}
                      onClick={() => setRating(star)}
                    >
                      <img src={rating >= star ? starFilledIcon : starOutlineIcon} alt="" className="star-icon" />
                    </button>
                  ))}
                </div>
                <button className="submit-rating" onClick={handleRate}>
                  Submit Rating
                </button>
              </div>
            )}
            
            {lendingData.isLender && !lendingData.borrowerRating && (
              <div className="rating-section">
                <h3>Rate the Borrower</h3>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      className={'star-button' + (rating >= star ? ' active' : '')}
                      onClick={() => setRating(star)}
                    >
                      <img src={rating >= star ? starFilledIcon : starOutlineIcon} alt="" className="star-icon" />
                    </button>
                  ))}
                </div>
                <button className="submit-rating" onClick={handleRate}>
                  Submit Rating
                </button>
              </div>
            )}
            
            {lendingData.lenderRating && (
              <div className="given-rating">
                <span className="rating-label">Lender rating:</span>
                <span className="rating-stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <img 
                      key={star} 
                      src={star <= lendingData.lenderRating ? starFilledIcon : starOutlineIcon} 
                      alt="" 
                      className={'star-icon' + (star <= lendingData.lenderRating ? ' filled' : '')} 
                    />
                  ))}
                </span>
              </div>
            )}
            
            {lendingData.borrowerRating && (
              <div className="given-rating">
                <span className="rating-label">Borrower rating:</span>
                <span className="rating-stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <img 
                      key={star} 
                      src={star <= lendingData.borrowerRating ? starFilledIcon : starOutlineIcon} 
                      alt="" 
                      className={'star-icon' + (star <= lendingData.borrowerRating ? ' filled' : '')} 
                    />
                  ))}
                </span>
              </div>
            )}
          </section>
        )}

      </article>
    </div>
  );
}

export default LendingDetail;

