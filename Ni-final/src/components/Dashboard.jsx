import { useEffect } from 'react';
import { ACTIONS } from '../reducers/appReducer.js';
import * as api from '../services/api.js';
import { formatCurrency, getTrustScoreColor } from '../utils/helpers.js';
import './Dashboard.css';

function Dashboard({ state, dispatch, navigateTo }) {
  useEffect(() => {
    loadDashboard();
  }, []);

  function loadDashboard() {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    api.getDashboardAnalytics()
      .then(data => {
        dispatch({ type: ACTIONS.SET_ANALYTICS, payload: data });
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to load dashboard' });
      });
  }

  const { analytics } = state;
  const trustClass = getTrustScoreColor(state.user.trustScore);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="page-title">Welcome, {state.user.displayName}</h1>
        <p className="page-subtitle">Your lending activity overview</p>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-card trust-card">
          <h2 className="card-title">Your Trust Score</h2>
          <div className="trust-display">
            <div className={'trust-circle ' + trustClass}>
              <span className="trust-number">{state.user.trustScore}</span>
            </div>
            <span className={'trust-label ' + trustClass}>{state.user.badge.badge}</span>
          </div>
          {analytics && (
            <div className="trust-stats">
              <div className="stat-item">
                <span className="stat-value">{analytics.trust.onTimeReturns}</span>
                <span className="stat-label">On-time Returns</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{analytics.trust.lateReturns}</span>
                <span className="stat-label">Late Returns</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{analytics.trust.totalRatings}</span>
                <span className="stat-label">Ratings Received</span>
              </div>
            </div>
          )}
        </section>

        {analytics && (
          <section className="dashboard-card lending-stats-card">
            <h2 className="card-title">Lending Overview</h2>
            <div className="stats-grid">
              <div className="stat-box" onClick={() => navigateTo('inventory')}>
                <span className="stat-number">{analytics.lending.totalItems}</span>
                <span className="stat-text">Total Items</span>
              </div>
              <div className="stat-box available" onClick={() => navigateTo('inventory')}>
                <span className="stat-number">{analytics.lending.availableItems}</span>
                <span className="stat-text">Available</span>
              </div>
              <div className="stat-box lent" onClick={() => navigateTo('lendings')}>
                <span className="stat-number">{analytics.lending.lentItems}</span>
                <span className="stat-text">Lent Out</span>
              </div>
              <div className="stat-box warning" onClick={() => navigateTo('lendings')}>
                <span className="stat-number">{analytics.lending.overdueLendings}</span>
                <span className="stat-text">Overdue</span>
              </div>
            </div>
            <div className="value-display">
              <span className="value-label">Total Value on Loan</span>
              <span className="value-amount">{formatCurrency(analytics.lending.totalValueOnLoan)}</span>
            </div>
          </section>
        )}

        {analytics && (
          <section className="dashboard-card borrowing-stats-card">
            <h2 className="card-title">Borrowing Overview</h2>
            <div className="stats-grid">
              <div className="stat-box" onClick={() => navigateTo('borrowings')}>
                <span className="stat-number">{analytics.borrowing.totalBorrowings}</span>
                <span className="stat-text">Total Borrowed</span>
              </div>
              <div className="stat-box active" onClick={() => navigateTo('borrowings')}>
                <span className="stat-number">{analytics.borrowing.activeBorrowings}</span>
                <span className="stat-text">Currently Have</span>
              </div>
              <div className="stat-box warning" onClick={() => navigateTo('borrowings')}>
                <span className="stat-number">{analytics.borrowing.overdueBorrowings}</span>
                <span className="stat-text">Overdue</span>
              </div>
              <div className="stat-box success">
                <span className="stat-number">{analytics.borrowing.onTimeRate}%</span>
                <span className="stat-text">On-time Rate</span>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
