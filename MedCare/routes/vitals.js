"use strict";

import express from 'express';

function createVitalsRoutes(models) {
    const router = express.Router();
    const { vitals, sessions } = models;

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

    // GET all vitals
    router.get('/', requireAuth, async (req, res) => {
        try {
            const vitalsList = await vitals.getVitals(req.username, req.query.type);
            res.json({ vitals: vitalsList });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // POST new vital
    router.post('/', requireAuth, async (req, res) => {
        try {
            const data = req.body;
            if (!data.type || !data.value) {
                return res.status(400).json({ error: 'required-fields', message: 'Type and value are required' });
            }
            const vital = await vitals.addVital(req.username, data);
            res.status(201).json({ vital });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });

    // DELETE vital
    router.delete('/:id', requireAuth, async (req, res) => {
        try {
            await vitals.removeVital(req.params.id, req.username);
            res.json({ message: 'Vital deleted' });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });

    return router;
}

export default createVitalsRoutes;