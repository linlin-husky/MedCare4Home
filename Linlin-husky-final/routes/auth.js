"use strict";

import express from 'express';

function createAuthRoutes(models) {
  const router = express.Router();
  const { sessions, users, activities } = models;

  router.get('/session', async (req, res) => {
    const sid = req.cookies.sid;
    if (!sid) {
      return res.status(401).json({ error: 'auth-missing', message: 'Not logged in' });
    }

    // Check session validity async
    const isValid = await sessions.isValidSession(sid);
    if (!isValid) {
      return res.status(401).json({ error: 'auth-missing', message: 'Not logged in' });
    }

    const username = await sessions.getUsername(sid);
    const user = await users.getUser(username);
    const unreadCount = await activities.getUnreadCount(username);

    if (!user) {
      res.clearCookie('sid');
      return res.status(401).json({ error: 'auth-missing', message: 'Session invalid' });
    }

    res.json({
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      phone: user.phone,
      trustScore: user.trustScore,
      badge: users.getTrustBadge(user.trustScore),
      isAdmin: users.isAdmin(username),
      unreadCount
    });
  });

  router.post('/register', async (req, res) => {
    const { username, displayName, email, phone } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'required-username', message: 'Username is required' });
    }

    const validation = users.isValidUsername(username);
    if (!validation.valid) {
      return res.status(400).json({ error: 'invalid-username', message: validation.reason });
    }

    if (users.isBannedUser(username)) {
      return res.status(403).json({ error: 'auth-insufficient', message: 'This username is not allowed' });
    }

    if (await users.userExists(username)) {
      return res.status(409).json({ error: 'username-exists', message: 'Username already taken' });
    }

    if (email && !email.includes('@')) {
      return res.status(400).json({ error: 'invalid-email', message: 'Invalid email format' });
    }

    const result = await users.createUser(username, displayName, email, phone);
    if (!result.success) {
      return res.status(400).json({ error: 'registration-failed', message: result.reason });
    }

    const sid = await sessions.createSession(username.toLowerCase());
    res.cookie('sid', sid, { httpOnly: true, sameSite: 'strict' });

    res.json({
      username: result.user.username,
      displayName: result.user.displayName,
      email: result.user.email,
      phone: result.user.phone,
      trustScore: result.user.trustScore,
      badge: users.getTrustBadge(result.user.trustScore),
      isAdmin: users.isAdmin(username),
      unreadCount: 0
    });
  });

  router.post('/login', async (req, res) => {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'required-username', message: 'Username is required' });
    }

    const validation = users.isValidUsername(username);
    if (!validation.valid) {
      return res.status(400).json({ error: 'invalid-username', message: validation.reason });
    }

    if (users.isBannedUser(username)) {
      return res.status(403).json({ error: 'auth-insufficient', message: 'This user does not have permission to access the platform' });
    }

    const exists = await users.userExists(username);
    if (!exists) {
      return res.status(401).json({ error: 'user-not-found', message: 'User not registered. Please register first.' });
    }

    const user = await users.getUser(username);
    const sid = await sessions.createSession(username.toLowerCase());
    const unreadCount = await activities.getUnreadCount(username);

    res.cookie('sid', sid, { httpOnly: true, sameSite: 'strict' });

    res.json({
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      phone: user.phone,
      trustScore: user.trustScore,
      badge: users.getTrustBadge(user.trustScore),
      isAdmin: users.isAdmin(username),
      unreadCount
    });
  });

  router.post('/logout', async (req, res) => {
    const sid = req.cookies.sid;
    if (sid) {
      await sessions.deleteSession(sid);
    }
    res.clearCookie('sid');
    res.json({ message: 'Logged out successfully' });
  });

  return router;
}

export default createAuthRoutes;
