"use strict";

import express from 'express';

function createSymptomRoutes(models) {
    const router = express.Router();
    const { symptoms, sessions } = models;

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
        try {
            const symptomsList = await symptoms.getSymptoms(req.username);
            res.json({ symptoms: symptomsList });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    router.post('/', requireAuth, async (req, res) => {
        try {
            const data = req.body;
            if (!data.symptomName || !data.severity) {
                return res.status(400).json({ error: 'required-fields', message: 'Symptom name and severity are required' });
            }
            const symptom = await symptoms.addSymptom(req.username, data);
            res.status(201).json({ symptom });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });

    router.delete('/:id', requireAuth, async (req, res) => {
        try {
            await symptoms.removeSymptom(req.params.id, req.username);
            res.json({ message: 'Symptom deleted' });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });

    return router;
}

export default createSymptomRoutes;