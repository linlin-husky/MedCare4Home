import sessions from './sessions.js';
import users from './users.js';

const authController = {};

authController.signup = function (req, res) {
    const { username, email } = req.body;
    if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'invalid-username', message: 'Username is required.' });
    }
    const usernameRegex = /^[a-zA-Z0-9_]{2,20}$/;
    if (!usernameRegex.test(username)) {
        return res.status(400).json({ error: 'invalid-username', message: 'Username must be 2-20 characters and contain only letters, numbers, or underscores.' });
    }
    if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'invalid-email', message: 'Email is required.' });
    }
    if (users.getUserData(username)) {
        return res.status(409).json({ error: 'user-exists', message: 'User already exists.' });
    }
    users.addUserData(username, email);
    res.status(201).json({ message: 'signup-success' });
};

authController.checkSession = function (req, res) {
    const sid = req.cookies.sid;
    const username = sid ? sessions.getSessionUser(sid) : '';

    if (!sid || !users.isValid(username)) {
        res.status(401).json({ error: 'auth-missing' });
        return;
    }
    res.json({ username });
};

authController.createSession = function (req, res) {
    const { username } = req.body;
    if (!users.isValid(username)) {
        res.status(400).json({ error: 'required-username' });
        return;
    }

    const userData = users.getUserData(username);
    if (!userData) {
        return res.status(401).json({ error: 'username-not-found' });
    }

    if (username === 'dog') {
        res.status(403).json({ error: 'auth-insufficient' });
        return;
    }

    const sid = sessions.addSession(username);
    res.cookie('sid', sid, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: 'strict',
    });

    res.json({ success: true, username });
};

authController.checkUserList = function (req, res) {
    const userList = sessions.getAllRegisterUsers ? sessions.getAllRegisterUsers() : [];
    res.json({ users: userList });
};

authController.endSession = function (req, res) {
    const sid = req.cookies.sid;
    const username = sid ? sessions.getSessionUser(sid) : '';

    res.clearCookie('sid');

    if (username) {
        sessions.deleteSession(sid);
    }

    res.json({ username });
};

export default authController;