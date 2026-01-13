import { useEffect, useState } from 'react';
import { ACTIONS } from '../reducers/appReducer.js';
import * as api from '../services/api.js';
import './AdminPanel.css';

function AdminPanel({ state, dispatch, navigateTo }) {
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    if (!state.user?.isAdmin) {
      navigateTo('dashboard');
      return;
    }
    loadOverview();
  }, []);

  function loadOverview() {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    api.getAdminOverview()
      .then(data => {
        setOverview(data);
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to load overview' });
      });
  }

  if (!state.user?.isAdmin) {
    return null;
  }

  return (
    <div className="admin-panel-page">
      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-subtitle">Platform management and oversight</p>
      </div>

      {overview && (
        <section className="overview-section">
          <div className="stats-cards">
            <div className="stat-card">
              <h3 className="stat-title">Users</h3>
              <span className="stat-value">{overview.users.total}</span>
              <div className="trust-distribution">
                <div className="trust-bar elite" title={overview.users.trustDistribution.elite + ' Elite'}>
                  {overview.users.trustDistribution.elite}
                </div>
                <div className="trust-bar trusted" title={overview.users.trustDistribution.trusted + ' Trusted'}>
                  {overview.users.trustDistribution.trusted}
                </div>
                <div className="trust-bar reliable" title={overview.users.trustDistribution.reliable + ' Reliable'}>
                  {overview.users.trustDistribution.reliable}
                </div>
                <div className="trust-bar new" title={overview.users.trustDistribution.newUser + ' New'}>
                  {overview.users.trustDistribution.newUser}
                </div>
                <div className="trust-bar caution" title={overview.users.trustDistribution.caution + ' Caution'}>
                  {overview.users.trustDistribution.caution}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <h3 className="stat-title">Active Lendings</h3>
              <span className="stat-value">{overview.lendings.active}</span>
              {overview.lendings.overdue > 0 && (
                <span className="overdue-indicator">{overview.lendings.overdue} overdue</span>
              )}
            </div>
          </div>

          <div className="trust-legend">
            <h4>Trust Score Distribution Legend</h4>
            <div className="legend-items">
              <span className="legend-item elite">Elite (95+)</span>
              <span className="legend-item trusted">Trusted (85-94)</span>
              <span className="legend-item reliable">Reliable (70-84)</span>
              <span className="legend-item new">New (50-69)</span>
              <span className="legend-item caution">Caution (&lt;50)</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default AdminPanel;
