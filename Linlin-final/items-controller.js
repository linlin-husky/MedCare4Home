import express from 'express';
import { randomUUID } from 'crypto';
import items from './items.js';

const router = express.Router();

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (m) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[m];
    });
}

function isValidDate(dateStr) {
    if (/[<>&"']/.test(dateStr)) {
        return false;
    }
    const date = new Date(dateStr);
    return (
        /^\d{4}-\d{2}-\d{2}$/.test(dateStr) &&
        date instanceof Date &&
        !isNaN(date) &&
        dateStr === date.toISOString().slice(0, 10)
    );
}

router.get('/', (req, res) => {
    res.json({ items: Object.values(items) });
});

router.post('/', (req, res) => {
    const name = req.body.name ? escapeHtml(req.body.name.trim()) : '';
    const owner = req.body.owner ? escapeHtml(req.body.owner.trim()) : '';
    const lendDate = req.body.lendDate ? req.body.lendDate.trim() : '';
    const category = req.body.category ? escapeHtml(req.body.category.trim()) : '';
    const expectedReturnDate = req.body.expectedReturnDate ? req.body.expectedReturnDate.trim() : '';
    const description = req.body.description ? escapeHtml(req.body.description.trim()) : '';

    if (!name || !owner || !lendDate || !expectedReturnDate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!/^[a-zA-Z0-9 _-]+$/.test(name)) {
        return res.status(400).json({ error: 'Name contains invalid characters.' });
    }

    if (new Date(expectedReturnDate) <= new Date(lendDate)) {
        return res.status(400).json({ error: "Expected Return Date must be after Lend Date." });
    }

    if (!isValidDate(lendDate) || !isValidDate(expectedReturnDate)) {
        return res.status(400).json({ error: "Invalid date format." });
    }

    const newItem = {
        id: (typeof randomUUID === 'function') ? randomUUID() : Math.random().toString(36).slice(2),
        name,
        owner,
        lendDate,
        category: category || '',
        expectedReturnDate: expectedReturnDate || '',
        description: description || '',
        borrower: null,
        borrowDate: null,
        dueDate: null,
        returnedDate: null,
    };
    items[newItem.id] = newItem;
    res.status(201).json({ item: newItem });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const {
        borrower,
        borrowDate,
        dueDate,
        returnedDate,
        reservation,
        name,
        owner,
        lendDate,
        category,
        expectedReturnDate,
        description
    } = req.body;
    const item = items[id];
    if (!item) {
        return res.status(404).json({ error: 'Item not found' });
    }
    if (typeof name !== 'undefined') item.name = name;
    if (typeof owner !== 'undefined') item.owner = owner;
    if (typeof lendDate !== 'undefined') item.lendDate = lendDate;
    if (typeof category !== 'undefined') item.category = category;
    if (typeof expectedReturnDate !== 'undefined') item.expectedReturnDate = expectedReturnDate;
    if (typeof description !== 'undefined') item.description = description;
    if (reservation) {
        const { username, startDate, dueDate } = reservation;
        if (!username || !startDate || !dueDate) {
            return res.status(400).json({ error: 'Missing reservation fields.' });
        }
        if (item.borrower) {
            return res.status(400).json({ error: 'Item is currently borrowed.' });
        }
        if (!isValidDate(startDate) || !isValidDate(dueDate)) {
            return res.status(400).json({ error: 'Invalid date format.' });
        }
        if (new Date(dueDate) <= new Date(startDate)) {
            return res.status(400).json({ error: 'Due date must be after start date.' });
        }
        item.reservation = {
            username: escapeHtml(username.trim()),
            startDate,
            dueDate,
        };
    } else if (reservation === null) {
        item.reservation = null;
    }

    if (typeof borrower !== 'undefined') {
        if (borrower) {
            if (!borrowDate || !dueDate) {
                return res.status(400).json({ error: 'Missing borrowDate or dueDate.' });
            }
            if (!isValidDate(borrowDate) || !isValidDate(dueDate)) {
                return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
            }
            if (new Date(dueDate) <= new Date(borrowDate)) {
                return res.status(400).json({ error: 'Due date must be after borrow date.' });
            }
            item.borrower = escapeHtml(borrower.trim());
            item.borrowDate = borrowDate;
            item.dueDate = dueDate;
            item.returnedDate = null;
            item.reservation = null;
        } else if (borrower === null) {
            if (!item.borrower) {
                return res.status(400).json({ error: 'Item is not currently borrowed.' });
            }

            let dateToSet = returnedDate || new Date().toISOString().slice(0, 10);
            if (!isValidDate(dateToSet)) {
                return res.status(400).json({ error: 'Invalid returned date format.' });
            }
            item.borrower = null;
            item.borrowDate = null;
            item.dueDate = null;
            item.returnedDate = returnedDate || null;
        }
    }
    res.json({ item });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const item = items[id];
    if (!item) {
        return res.status(404).json({ error: 'Item not found' });
    }
    if (item.borrower) {
        return res.status(400).json({ error: 'Cannot delete: item is currently borrowed' });
    }
    delete items[id];
    res.status(204).end();
});

export default router;