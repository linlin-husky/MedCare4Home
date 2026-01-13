"use strict";

import express from 'express';

function createVitalsRoutes(models) {
    const router = express.Router();
    const { sessions, vitals } = models;

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
        const type = req.query.type;
        const history = await vitals.getVitals(req.username, type);
        res.json({ history });
    });

    router.get('/latest', requireAuth, async (req, res) => {
        const latest = await vitals.getLatestVitals(req.username);
        res.json({ latest });
    });

    router.post('/', requireAuth, async (req, res) => {
        const data = req.body;
        if (!data.type || data.value === undefined) {
            return res.status(400).json({ error: 'required-fields', message: 'Type and Value are required' });
        }

        const vital = await vitals.addVital(req.username, data);
        res.status(201).json({ vital });
    });

    return router;
}

export default createVitalsRoutes;
