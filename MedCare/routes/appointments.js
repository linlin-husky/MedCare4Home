"use strict";

import express from 'express';

function createAppointmentRoutes(models) {
    const router = express.Router();
    const { sessions, appointments } = models;

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
        const list = await appointments.getAppointments(req.username);
        res.json({ appointments: list });
    });

    router.post('/', requireAuth, async (req, res) => {
        const data = req.body;
        if (!data.title || !data.date) {
            return res.status(400).json({ error: 'required-fields', message: 'Title and Date are required' });
        }

        // Ensure date is a valid date string or timestamp
        if (new Date(data.date).toString() === 'Invalid Date') {
            return res.status(400).json({ error: 'invalid-date', message: 'Invalid date format' });
        }

        const appt = await appointments.createAppointment(req.username, data);
        res.status(201).json({ appointment: appt });
    });

    router.put('/:id', requireAuth, async (req, res) => {
        const { id } = req.params;
        const updates = req.body;

        const updated = await appointments.updateAppointment(id, req.username, updates);
        if (!updated) {
            return res.status(404).json({ error: 'not-found', message: 'Appointment not found' });
        }
        res.json({ appointment: updated });
    });

    router.delete('/:id', requireAuth, async (req, res) => {
        const { id } = req.params;
        await appointments.deleteAppointment(id, req.username);
        res.json({ message: 'Appointment deleted' });
    });

    return router;
}

export default createAppointmentRoutes;
