import express from 'express';
import sessions from './sessions.js';
import users from './users.js';
import items from './items.js';

const router = express.Router();

router.get('/all-details', (req, res) => {
    const sid = req.cookies.sid;
    const username = sid ? sessions.getSessionUser(sid) : '';
    if (username !== 'admin') {
        return res.status(403).json({ error: 'forbidden' });
    }
    const allUsers = users.getAllUserData();

    res.json({ users: allUsers, items });
});

router.get('/:username', (req, res) => {
    const username = req.params.username;
    const userData = users.getUserData(username);
    if (userData) {
        res.json(userData);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

router.post('/', (req, res) => {
    const { username, userData } = req.body;
    if (!users.isValid(username)) {
        res.status(400).json({ error: 'Invalid username' });
        return;
    }
    users.addUserData(username, userData);
    res.status(201).json({ message: 'User added successfully' });
});

router.get('/', (req, res) => {
    const userList = sessions.getAllRegisterUsers ? sessions.getAllRegisterUsers() : [];
    res.json({ users: userList });
});

router.delete('/:username', (req, res) => {
    const username = req.params.username;
    const sid = req.cookies.sid;

    res.clearCookie('sid');

    if (sid && username) {
        sessions.deleteSession(sid);
    }

    res.json({ username });
});

export default router;