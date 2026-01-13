"use strict";

import express from 'express';

export default function activityRoutes(models) {
  const router = express.Router();
  const { sessions, activities } = models;

  function requireAuth(req, res, next) {
    const sid = req.cookies.sid;
    if (!sid || !sessions.isValidSession(sid)) {
      return res.status(401).json({ error: 'auth-missing', message: 'Not logged in' });
    }
    req.username = sessions.getUsername(sid);
    next();
  }

  router.get('/', requireAuth, (req, res) => {
    const userActivities = activities.getActivitiesForUser(req.username);
    res.json({ activities: userActivities });
  });

  router.get('/unread', requireAuth, (req, res) => {
    const count = activities.getUnreadCount(req.username);
    res.json({ count });
  });

  router.patch('/:activityId/read', requireAuth, (req, res) => {
    const { activityId } = req.params;
    const success = activities.markAsRead(req.username, activityId);
    
    if (success) {
      res.json({ message: 'Marked as read' });
    } else {
      res.status(404).json({ message: 'Activity not found' });
    }
  });

  router.post('/mark-all-read', requireAuth, (req, res) => {
    activities.markAllAsRead(req.username);
    res.json({ message: 'All activities marked as read' });
  });

  return router;
}
