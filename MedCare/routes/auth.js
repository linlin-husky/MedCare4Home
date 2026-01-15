"use strict";

function createAuthController(models) {
  const { sessions, users } = models;
  const authController = {};

  authController.signup = async function (req, res) {
    const { username, email, displayName, phone } = req.body;
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'invalid-username', message: 'Username is required.' });
    }

    const validation = users.isValidUsername(username);
    if (!validation.valid) {
      return res.status(400).json({ error: 'invalid-username', message: validation.reason });
    }

    if (users.isBannedUser(username)) {
      return res.status(403).json({ error: 'auth-insufficient', message: 'This username is not allowed.' });
    }

    if (await users.userExists(username)) {
      return res.status(409).json({ error: 'user-exists', message: 'User already exists.' });
    }

    const result = await users.createUser(username, displayName, email, phone);
    if (!result.success) {
      return res.status(400).json({ error: 'registration-failed', message: result.reason });
    }

    const sid = await sessions.createSession(username.toLowerCase());
    res.cookie('sid', sid, { httpOnly: true, sameSite: 'strict' });

    res.status(201).json({
      message: 'signup-success',
      username: result.user.username,
      displayName: result.user.displayName,
      email: result.user.email,
      phone: result.user.phone,
      familyMembers: result.user.familyMembers || []
    });
  };

  authController.checkSession = async function (req, res) {
    const sid = req.cookies.sid;
    if (!sid) {
      return res.status(401).json({ error: 'auth-missing' });
    }

    const isValid = await sessions.isValidSession(sid);
    if (!isValid) {
      return res.status(401).json({ error: 'auth-missing' });
    }

    const username = await sessions.getUsername(sid);
    const user = await users.getUser(username);

    if (!user) {
      res.clearCookie('sid');
      return res.status(401).json({ error: 'auth-missing' });
    }

    res.json({
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      phone: user.phone,
      trustScore: user.trustScore,
      familyMembers: user.familyMembers || [],
      isAdmin: users.isAdmin(username)
    });
  };

  authController.createSession = async function (req, res) {
    const { username } = req.body;

    const validation = users.isValidUsername(username);
    if (!validation.valid) {
      return res.status(400).json({ error: 'required-username', message: validation.reason });
    }

    if (users.isBannedUser(username)) {
      return res.status(403).json({ error: 'auth-insufficient', message: 'User not allowed.' });
    }

    const userData = await users.getUser(username);
    if (!userData) {
      return res.status(401).json({ error: 'username-not-found', message: 'User not found.' });
    }

    const sid = await sessions.createSession(username.toLowerCase());
    res.cookie('sid', sid, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'strict',
    });

    res.json({
      success: true,
      username: userData.username,
      displayName: userData.displayName,
      email: userData.email,
      phone: userData.phone,
      trustScore: userData.trustScore,
      familyMembers: userData.familyMembers || [],
      isAdmin: users.isAdmin(username)
    });
  };

  authController.endSession = async function (req, res) {
    const sid = req.cookies.sid;
    const username = sid ? await sessions.getUsername(sid) : '';

    res.clearCookie('sid');

    if (username) {
      await sessions.deleteSession(sid);
    }

    res.json({ username });
  };

  return authController;
}

export default createAuthController;