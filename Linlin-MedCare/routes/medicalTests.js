"use strict";

import express from 'express';

function createMedicalTestRoutes(models) {
    const router = express.Router();
    const { medicalTests, sessions } = models;

    // Middleware to verify session
    async function verifySession(req, res, next) {
        const sid = req.cookies.sid;
        if (!sid) {
            return res.status(401).json({ error: 'auth-missing' });
        }
        const isValid = await sessions.isValidSession(sid);
        if (!isValid) {
            return res.status(401).json({ error: 'auth-missing' });
        }
        const username = await sessions.getUsername(sid);
        req.username = username;
        next();
    }

    // Get all tests for current user
    router.get('/', verifySession, async (req, res) => {
        try {
            const tests = await medicalTests.getTests(req.username);
            res.json(tests);
        } catch (err) {
            console.error('Error fetching tests:', err);
            res.status(500).json({ error: 'failed-to-fetch-tests' });
        }
    });

    // Filter by status
    router.get('/filter/status/:status', verifySession, async (req, res) => {
        try {
            const { status } = req.params;
            const tests = await medicalTests.getTestsByStatus(req.username, status);
            res.json(tests);
        } catch (err) {
            console.error('Error filtering by status:', err);
            res.status(500).json({ error: 'failed-to-filter' });
        }
    });

    // Filter by category
    router.get('/filter/category/:category', verifySession, async (req, res) => {
        try {
            const { category } = req.params;
            const tests = await medicalTests.getTestsByCategory(req.username, category);
            res.json(tests);
        } catch (err) {
            console.error('Error filtering by category:', err);
            res.status(500).json({ error: 'failed-to-filter' });
        }
    });

    // Search tests
    router.get('/search/:query', verifySession, async (req, res) => {
        try {
            const { query } = req.params;
            if (!query || query.length < 1) {
                return res.status(400).json({ error: 'invalid-search-query' });
            }
            const tests = await medicalTests.searchTests(req.username, query);
            res.json(tests);
        } catch (err) {
            console.error('Error searching tests:', err);
            res.status(500).json({ error: 'failed-to-search' });
        }
    });

    // Add a new test
    router.post('/', verifySession, async (req, res) => {
        try {
            const { testName, category, status, testDate, resultDate, result, notes, doctor, facility } = req.body;

            if (!testName || !category) {
                return res.status(400).json({ error: 'missing-required-fields' });
            }

            const test = await medicalTests.addTest(req.username, {
                testName,
                category,
                status: status || 'pending',
                testDate,
                resultDate,
                result,
                notes,
                doctor,
                facility
            });

            res.status(201).json(test);
        } catch (err) {
            console.error('Error adding test:', err);
            res.status(500).json({ error: 'failed-to-add-test' });
        }
    });

    // Update test
    router.put('/:id', verifySession, async (req, res) => {
        try {
            const { id } = req.params;
            const test = await medicalTests.updateTest(id, req.username, req.body);

            if (!test) {
                return res.status(404).json({ error: 'test-not-found' });
            }

            res.json(test);
        } catch (err) {
            console.error('Error updating test:', err);
            res.status(500).json({ error: 'failed-to-update-test' });
        }
    });

    // Delete test
    router.delete('/:id', verifySession, async (req, res) => {
        try {
            const { id } = req.params;
            await medicalTests.removeTest(id, req.username);
            res.json({ success: true });
        } catch (err) {
            console.error('Error deleting test:', err);
            res.status(500).json({ error: 'failed-to-delete-test' });
        }
    });

    return router;
}

export default createMedicalTestRoutes;
