"use strict";

import express from 'express';

function createUserRoutes(models) {
  const router = express.Router();
  const { sessions, users } = models;

  function requireAuth(req, res, next) {
    const sid = req.cookies.sid;
    if (!sid || !sessions.isValidSession(sid)) {
      return res.status(401).json({ error: 'auth-missing', message: 'Not logged in' });
    }
    req.username = sessions.getUsername(sid);
    next();
  }

  router.get('/profile', requireAuth, (req, res) => {
    const user = users.getUser(req.username);
    if (!user) {
      return res.status(404).json({ error: 'not-found', message: 'User not found' });
    }

    res.json({
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      phone: user.phone,
      trustScore: user.trustScore,
      badge: users.getTrustBadge(user.trustScore),
      totalLendings: user.totalLendings,
      totalBorrowings: user.totalBorrowings,
      onTimeReturns: user.onTimeReturns,
      lateReturns: user.lateReturns,
      memberSince: user.createdAt
    });
  });

  router.put('/profile', requireAuth, (req, res) => {
    const { displayName, email, phone } = req.body;

    if (email && !email.includes('@')) {
      return res.status(400).json({ error: 'invalid-email', message: 'Invalid email format' });
    }

    const updatedUser = users.updateUser(req.username, { displayName, email, phone });

    if (!updatedUser) {
      return res.status(404).json({ error: 'not-found', message: 'User not found' });
    }

    res.json({
      username: updatedUser.username,
      displayName: updatedUser.displayName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      trustScore: updatedUser.trustScore,
      badge: users.getTrustBadge(updatedUser.trustScore)
    });
  });

  router.get('/search', requireAuth, (req, res) => {
    const query = req.query.q || '';
    
    if (query.length < 2) {
      return res.json({ users: [] });
    }

    const searchResults = users.searchUsers(query);
    
    const filteredResults = searchResults.filter(
      user => user.username !== req.username
    );

    res.json({ users: filteredResults });
  });

  router.get('/:username', requireAuth, (req, res) => {
    const { username } = req.params;
    const profile = users.getPublicProfile(username);

    if (!profile) {
      return res.status(404).json({ error: 'not-found', message: 'User not found' });
    }

    res.json({ user: profile });
  });

  return router;
}

export default createUserRoutes;

