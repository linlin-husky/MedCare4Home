"use strict";

import express from 'express';

function createItemRoutes(models) {
  const router = express.Router();
  const { sessions, users, items, lendings, activities } = models;

  function requireAuth(req, res, next) {
    const sid = req.cookies.sid;
    if (!sid || !sessions.isValidSession(sid)) {
      return res.status(401).json({ error: 'auth-missing', message: 'Not logged in' });
    }
    req.username = sessions.getUsername(sid);
    next();
  }

  router.get('/categories', (req, res) => {
    res.json({ categories: items.getCategories() });
  });

  router.get('/conditions', (req, res) => {
    res.json({ conditions: items.getConditions() });
  });

  router.get('/public', requireAuth, (req, res) => {
    const filters = {
      category: req.query.category,
      condition: req.query.condition,
      minValue: req.query.minValue ? parseFloat(req.query.minValue) : undefined,
      maxValue: req.query.maxValue ? parseFloat(req.query.maxValue) : undefined,
      search: req.query.search,
      sortBy: req.query.sortBy
    };

    const publicItems = items.getPublicItems(filters);
    
    const filteredItems = publicItems.filter(item => 
      item.ownerUsername.toLowerCase() !== req.username.toLowerCase()
    );
    
    const enrichedItems = filteredItems.map(item => ({
      ...item,
      owner: users.getPublicProfile(item.ownerUsername)
    }));

    res.json({ items: enrichedItems });
  });

  router.get('/', requireAuth, (req, res) => {
    const userItems = items.getUserItems(req.username);
    res.json({ items: userItems });
  });

  router.get('/available', requireAuth, (req, res) => {
    const availableItems = items.getAvailableItems(req.username);
    res.json({ items: availableItems });
  });

  router.get('/lent', requireAuth, (req, res) => {
    const lentItems = items.getLentItems(req.username);
    res.json({ items: lentItems });
  });

  router.get('/search', requireAuth, (req, res) => {
    const query = req.query.q || '';
    const ownerOnly = req.query.ownerOnly === 'true';
    
    const searchResults = items.searchItems(query, ownerOnly ? req.username : null);
    
    const enrichedResults = searchResults.map(item => ({
      ...item,
      owner: users.getPublicProfile(item.ownerUsername),
      canBorrow: item.ownerUsername.toLowerCase() !== req.username.toLowerCase() && item.status === 'available'
    }));

    res.json({ items: enrichedResults });
  });

  router.get('/:itemId', requireAuth, (req, res) => {
    const { itemId } = req.params;
    const item = items.getItem(itemId);

    if (!item) {
      return res.status(404).json({ error: 'not-found', message: 'Item not found' });
    }

    const canView = item.ownerUsername.toLowerCase() === req.username.toLowerCase() || item.isPublic;
    if (!canView) {
      return res.status(403).json({ error: 'forbidden', message: 'Not authorized to view this item' });
    }

    const enrichedItem = {
      ...item,
      owner: users.getPublicProfile(item.ownerUsername),
      canEdit: item.ownerUsername.toLowerCase() === req.username.toLowerCase(),
      canBorrow: item.ownerUsername.toLowerCase() !== req.username.toLowerCase() && item.status === 'available'
    };

    res.json({ item: enrichedItem });
  });

  router.post('/', requireAuth, (req, res) => {
    const itemData = req.body;

    if (!itemData.name || itemData.name.trim().length < 2) {
      return res.status(400).json({ error: 'invalid-name', message: 'Item name must be at least 2 characters' });
    }

    if (!itemData.category) {
      return res.status(400).json({ error: 'required-category', message: 'Category is required' });
    }

    if (!itemData.condition) {
      return res.status(400).json({ error: 'required-condition', message: 'Condition is required' });
    }

    if (itemData.isPublic && !itemData.estimatedValue) {
      return res.status(400).json({ error: 'required-value', message: 'Estimated value is required for public items' });
    }

    const result = items.createItem(req.username, itemData);

    if (!result.success) {
      return res.status(400).json({ error: 'creation-failed', message: result.reason });
    }

    res.status(201).json({ item: result.item });
  });

  router.put('/:itemId', requireAuth, (req, res) => {
    const { itemId } = req.params;
    const updates = req.body;

    const result = items.updateItem(itemId, req.username, updates);

    if (!result.success) {
      const statusCode = result.reason === 'Item not found' ? 404 : 
                        result.reason === 'Not authorized to update this item' ? 403 : 400;
      return res.status(statusCode).json({ error: 'update-failed', message: result.reason });
    }

    res.json({ item: result.item });
  });

  router.delete('/:itemId', requireAuth, (req, res) => {
    const { itemId } = req.params;

    const result = items.deleteItem(itemId, req.username);

    if (!result.success) {
      const statusCode = result.reason === 'Item not found' ? 404 : 
                        result.reason === 'Not authorized to delete this item' ? 403 : 400;
      return res.status(statusCode).json({ error: 'delete-failed', message: result.reason });
    }

    res.json({ message: 'Item deleted successfully' });
  });

  router.post('/:itemId/borrow-request', requireAuth, (req, res) => {
    const { itemId } = req.params;
    const { message, proposedReturnDate } = req.body;

    const item = items.getItem(itemId);
    if (!item) {
      return res.status(404).json({ error: 'not-found', message: 'Item not found' });
    }

    if (!item.isPublic) {
      return res.status(403).json({ error: 'not-public', message: 'This item is not available for public borrowing' });
    }

    if (item.ownerUsername.toLowerCase() === req.username.toLowerCase()) {
      return res.status(400).json({ error: 'own-item', message: 'You cannot borrow your own item' });
    }

    if (item.status !== 'available') {
      return res.status(400).json({ error: 'not-available', message: 'This item is currently not available' });
    }

    if (!proposedReturnDate) {
      return res.status(400).json({ error: 'required-date', message: 'Proposed return date is required' });
    }

    const borrower = { username: req.username };
    const terms = {
      dateLent: new Date().toISOString().split('T')[0],
      expectedReturnDate: proposedReturnDate,
      notes: message || '',
      conditionAtLending: item.condition,
      requireDeposit: false,
      depositAmount: 0,
      allowExtensions: true,
      isBorrowRequest: true  
    };

    const result = lendings.createLending(item.ownerUsername, borrower, itemId, terms);

    if (!result.success) {
      return res.status(400).json({ error: 'request-failed', message: result.reason });
    }

    const requester = users.getUser(req.username);
    activities.addActivity(
      item.ownerUsername.toLowerCase(),
      'borrow_request',
      requester.displayName + ' wants to borrow "' + item.name + '"',
      result.lending.id
    );

    res.status(201).json({ lending: result.lending, message: 'Borrow request sent successfully' });
  });

  return router;
}

export default createItemRoutes;
