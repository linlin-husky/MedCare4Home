"use strict";

import express from 'express';

function createMedicationRoutes(models) {
    const router = express.Router();
    const { sessions, medications } = models;

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
        const list = await medications.getMedications(req.username);
        res.json({ medications: list });
    });

    router.post('/', requireAuth, async (req, res) => {
        const data = req.body;
        if (!data.name) {
            return res.status(400).json({ error: 'required-name', message: 'Medication name is required' });
        }

        const med = await medications.addMedication(req.username, data);
        res.status(201).json({ medication: med });
    });

    router.delete('/:id', requireAuth, async (req, res) => {
        const { id } = req.params;
        await medications.removeMedication(id, req.username);
        res.json({ message: 'Medication removed' });
    });

    return router;
}

export default createMedicationRoutes;
