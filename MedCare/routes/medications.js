"use strict";

import express from 'express';

function createMedicationRoutes(models) {
    const router = express.Router();
    const { medications, sessions } = models;

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

    // GET all medications
    router.get('/', requireAuth, async (req, res) => {
        try {
            const meds = await medications.getMedications(req.username);
            res.json({ medications: meds });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // POST new medication
    router.post('/', requireAuth, async (req, res) => {
        try {
            const data = req.body;
            if (!data.name) {
                return res.status(400).json({ error: 'required-fields', message: 'Name is required' });
            }
            const med = await medications.addMedication(req.username, data);
            res.status(201).json({ medication: med });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });

    // DELETE medication
    router.delete('/:id', requireAuth, async (req, res) => {
        try {
            await medications.removeMedication(req.params.id, req.username);
            res.json({ message: 'Medication deleted' });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });

    return router;
}

export default createMedicationRoutes;