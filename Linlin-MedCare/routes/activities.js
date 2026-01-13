"use strict";

import express from 'express';

export default function createActivityRoutes(models) {
  const router = express.Router();
  const { sessions, activities } = models;

  const requireAuth = async (req, res, next) => {
    const sid = req.cookies.sid;
    if (!sid) {
      return res.status(401).json({ error: 'auth-missing', message: 'Not logged in' });
    }
    const isValid = await sessions.isValidSession(sid);
    if (!isValid) {
      return res.status(401).json({ error: 'auth-missing', message: 'Not logged in' });
    }
    req.username = await sessions.getUsername(sid);
    next();
  };

  router.get('/', requireAuth, async (req, res) => {
    const userActivities = await activities.getActivitiesForUser(req.username);
    res.json({ activities: userActivities });
  });

  router.get('/unread', requireAuth, async (req, res) => {
    const count = await activities.getUnreadCount(req.username);
    res.json({ count });
  });

  router.patch('/:activityId/read', requireAuth, async (req, res) => {
    const { activityId } = req.params;
    const success = await activities.markAsRead(req.username, activityId);

    if (success) {
      res.json({ message: 'Marked as read' });
    } else {
      res.status(404).json({ message: 'Activity not found' });
    }
  });

  router.post('/mark-all-read', requireAuth, async (req, res) => {
    await activities.markAllAsRead(req.username);
    res.json({ message: 'All activities marked as read' });
  });

  return router;
}
