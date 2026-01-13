import { useState, useEffect } from 'react';
import { ACTIONS } from '../reducers/appReducer.js';
import * as api from '../services/api.js';
import { formatTimeAgo } from '../utils/helpers.js';
import sendIcon from '../assets/icons/send.svg';
import checkCircleIcon from '../assets/icons/check-circle.svg';
import cancelIcon from '../assets/icons/cancel.svg';
import inventoryIcon from '../assets/icons/inventory.svg';
import syncIcon from '../assets/icons/sync.svg';
import scheduleIcon from '../assets/icons/schedule.svg';
import warningIcon from '../assets/icons/warning.svg';
import starIcon from '../assets/icons/star.svg';
import inboxIcon from '../assets/icons/inbox.svg';
import notificationsIcon from '../assets/icons/notifications.svg';
import './ActivityFeed.css';

function ActivityFeed({ state, dispatch, navigateTo }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  function loadActivities() {
    setIsLoading(true);
    api.getActivities()
      .then(data => {
        setActivities(data.activities || []);
        setIsLoading(false);
        dispatch({ type: ACTIONS.SET_UNREAD_COUNT, payload: 0 });
      })
      .catch(() => {
        setActivities([]);
        setIsLoading(false);
      });
  }

  function markAsRead(activityId) {
    api.markActivityAsRead(activityId)
      .then(() => {
        setActivities(prev => prev.map(a => 
          a.id === activityId ? { ...a, read: true } : a
        ));
      })
      .catch(() => {});
  }

  function handleActivityClick(activity) {
    if (!activity.read) {
      markAsRead(activity.id);
    }
    
    if (activity.relatedLendingId) {
      api.getLending(activity.relatedLendingId)
        .then(data => {
          navigateTo('lending-detail', { lending: data.lending });
        })
        .catch(() => {
          dispatch({ type: ACTIONS.SET_ERROR, payload: 'Could not load lending details' });
        });
    }
  }

  function getActivityIcon(type) {
    switch (type) {
      case 'lending_request':
        return <img src={sendIcon} alt="" className="activity-svg-icon send" />;
      case 'lending_accepted':
        return <img src={checkCircleIcon} alt="" className="activity-svg-icon success" />;
      case 'lending_declined':
        return <img src={cancelIcon} alt="" className="activity-svg-icon danger" />;
      case 'item_returned':
        return <img src={inventoryIcon} alt="" className="activity-svg-icon success" />;
      case 'return_initiated':
        return <img src={syncIcon} alt="" className="activity-svg-icon info" />;
      case 'extension_requested':
        return <img src={scheduleIcon} alt="" className="activity-svg-icon warning" />;
      case 'extension_approved':
        return <img src={checkCircleIcon} alt="" className="activity-svg-icon success" />;
      case 'extension_denied':
        return <img src={cancelIcon} alt="" className="activity-svg-icon danger" />;
      case 'due_reminder':
        return <img src={scheduleIcon} alt="" className="activity-svg-icon warning" />;
      case 'overdue':
        return <img src={warningIcon} alt="" className="activity-svg-icon danger" />;
      case 'rating_received':
        return <img src={starIcon} alt="" className="activity-svg-icon star" />;
      case 'borrow_request':
        return <img src={inboxIcon} alt="" className="activity-svg-icon info" />;
      default:
        return <img src={notificationsIcon} alt="" className="activity-svg-icon default" />;
    }
  }

  if (isLoading) {
    return (
      <div className="activity-feed-page">
        <div className="page-header">
          <h1 className="page-title">Activity</h1>
          <p className="page-subtitle">Stay updated on your lending activity</p>
        </div>
        <div className="loading-state">Loading activities...</div>
      </div>
    );
  }

  return (
    <div className="activity-feed-page">
      <div className="page-header">
        <h1 className="page-title">Activity</h1>
        <p className="page-subtitle">Stay updated on your lending activity</p>
      </div>

      {activities.length === 0 ? (
        <div className="empty-state">
          <p className="empty-message">No activities yet</p>
          <p className="empty-hint">Your lending activity will appear here</p>
        </div>
      ) : (
        <ul className="activity-list">
          {activities.map(activity => (
            <li 
              key={activity.id}
              className={'activity-item' + (activity.read ? '' : ' unread')}
              onClick={() => handleActivityClick(activity)}
            >
              <span className="activity-icon">{getActivityIcon(activity.type)}</span>
              <div className="activity-content">
                <p className="activity-message">{activity.message}</p>
                <span className="activity-time">{formatTimeAgo(activity.timestamp)}</span>
              </div>
              {!activity.read && <span className="unread-indicator"></span>}
            </li>
          ))}
        </ul>
      )}

      <div className="activity-actions">
        <button className="refresh-btn" onClick={loadActivities}>
          Refresh
        </button>
      </div>
    </div>
  );
}

export default ActivityFeed;
