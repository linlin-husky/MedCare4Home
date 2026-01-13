"use strict";

import express from 'express';

function createLendingRoutes(models) {
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

  router.get('/', requireAuth, (req, res) => {
    const userLendings = lendings.getUserLendings(req.username);
    
    const enrichedLendings = userLendings.map(lending => ({
      ...lending,
      item: items.getItem(lending.itemId),
      borrower: lending.borrowerUsername ? users.getPublicProfile(lending.borrowerUsername) : null
    }));

    res.json({ lendings: enrichedLendings });
  });

  router.get('/active', requireAuth, (req, res) => {
    const activeLendings = lendings.getActiveLendings(req.username);
    
    const enrichedLendings = activeLendings.map(lending => {
      const now = Date.now();
      const daysUntilDue = Math.ceil((lending.terms.expectedReturnDate - now) / (24 * 60 * 60 * 1000));
      
      return {
        ...lending,
        item: items.getItem(lending.itemId),
        borrower: lending.borrowerUsername ? users.getPublicProfile(lending.borrowerUsername) : null,
        daysUntilDue,
        isOverdue: daysUntilDue < 0
      };
    });

    res.json({ lendings: enrichedLendings });
  });

  router.get('/borrowings', requireAuth, (req, res) => {
    const userBorrowings = lendings.getUserBorrowings(req.username);
    
    const enrichedBorrowings = userBorrowings.map(lending => {
      const now = Date.now();
      const daysUntilDue = Math.ceil((lending.terms.expectedReturnDate - now) / (24 * 60 * 60 * 1000));
      
      return {
        ...lending,
        item: items.getItem(lending.itemId),
        lender: users.getPublicProfile(lending.lenderUsername),
        daysUntilDue,
        isOverdue: daysUntilDue < 0
      };
    });

    res.json({ borrowings: enrichedBorrowings });
  });

  router.get('/borrowings/active', requireAuth, (req, res) => {
    const activeBorrowings = lendings.getActiveBorrowings(req.username);
    
    const enrichedBorrowings = activeBorrowings.map(lending => {
      const now = Date.now();
      const daysUntilDue = Math.ceil((lending.terms.expectedReturnDate - now) / (24 * 60 * 60 * 1000));
      
      return {
        ...lending,
        item: items.getItem(lending.itemId),
        lender: users.getPublicProfile(lending.lenderUsername),
        daysUntilDue,
        isOverdue: daysUntilDue < 0
      };
    });

    res.json({ borrowings: enrichedBorrowings });
  });

  router.get('/pending', requireAuth, (req, res) => {
    const pendingRequests = lendings.getPendingRequests(req.username);
    
    const enrichedRequests = pendingRequests.map(lending => ({
      ...lending,
      item: items.getItem(lending.itemId),
      lender: users.getPublicProfile(lending.lenderUsername),
      borrower: lending.borrowerUsername ? users.getPublicProfile(lending.borrowerUsername) : null
    }));

    res.json({ requests: enrichedRequests });
  });

  router.get('/overdue', requireAuth, (req, res) => {
    const overdueLendings = lendings.getOverdueLendings(req.username);
    
    const enrichedLendings = overdueLendings.map(lending => {
      const now = Date.now();
      const daysOverdue = Math.ceil((now - lending.terms.expectedReturnDate) / (24 * 60 * 60 * 1000));
      
      return {
        ...lending,
        item: items.getItem(lending.itemId),
        borrower: lending.borrowerUsername ? users.getPublicProfile(lending.borrowerUsername) : null,
        daysOverdue
      };
    });

    res.json({ lendings: enrichedLendings });
  });

  router.get('/due-soon', requireAuth, (req, res) => {
    const days = parseInt(req.query.days, 10) || 3;
    const dueSoonLendings = lendings.getDueSoonLendings(req.username, days);
    
    const enrichedLendings = dueSoonLendings.map(lending => {
      const now = Date.now();
      const daysUntilDue = Math.ceil((lending.terms.expectedReturnDate - now) / (24 * 60 * 60 * 1000));
      
      return {
        ...lending,
        item: items.getItem(lending.itemId),
        borrower: lending.borrowerUsername ? users.getPublicProfile(lending.borrowerUsername) : null,
        daysUntilDue
      };
    });

    res.json({ lendings: enrichedLendings });
  });

  router.get('/item/:itemId/history', requireAuth, (req, res) => {
    const { itemId } = req.params;
    const item = items.getItem(itemId);

    if (!item) {
      return res.status(404).json({ error: 'not-found', message: 'Item not found' });
    }

    if (item.ownerUsername !== req.username) {
      return res.status(403).json({ error: 'forbidden', message: 'Not authorized' });
    }

    const history = lendings.getLendingHistory(itemId);
    
    const enrichedHistory = history.map(lending => ({
      ...lending,
      borrower: lending.borrowerUsername ? users.getPublicProfile(lending.borrowerUsername) : lending.borrowerInfo
    }));

    res.json({ history: enrichedHistory });
  });

  router.get('/:lendingId', requireAuth, (req, res) => {
    const { lendingId } = req.params;
    const lending = lendings.getLending(lendingId);

    if (!lending) {
      return res.status(404).json({ error: 'not-found', message: 'Lending not found' });
    }

    const isLender = lending.lenderUsername === req.username;
    const isBorrower = lending.borrowerUsername === req.username;

    if (!isLender && !isBorrower) {
      return res.status(403).json({ error: 'forbidden', message: 'Not authorized' });
    }

    const now = Date.now();
    const daysUntilDue = Math.ceil((lending.terms.expectedReturnDate - now) / (24 * 60 * 60 * 1000));

    const enrichedLending = {
      ...lending,
      item: items.getItem(lending.itemId),
      lender: users.getPublicProfile(lending.lenderUsername),
      borrower: lending.borrowerUsername ? users.getPublicProfile(lending.borrowerUsername) : null,
      daysUntilDue,
      isOverdue: daysUntilDue < 0,
      isLender,
      isBorrower
    };

    res.json({ lending: enrichedLending });
  });

  router.post('/', requireAuth, (req, res) => {
    const { itemId, borrower, terms } = req.body;

    if (!itemId) {
      return res.status(400).json({ error: 'required-item', message: 'Item is required' });
    }

    const item = items.getItem(itemId);
    if (!item) {
      return res.status(404).json({ error: 'not-found', message: 'Item not found' });
    }

    if (item.ownerUsername !== req.username) {
      return res.status(403).json({ error: 'forbidden', message: 'You can only lend items you own' });
    }

    if (item.status !== 'available') {
      return res.status(400).json({ error: 'item-unavailable', message: 'Item is currently not available for lending' });
    }

    if (!borrower || (!borrower.username && !borrower.name)) {
      return res.status(400).json({ error: 'required-borrower', message: 'Borrower information is required' });
    }

    if (!borrower.username && (!borrower.email && !borrower.phone)) {
      return res.status(400).json({ error: 'required-contact', message: 'Contact information is required for non-platform borrowers' });
    }

    if (borrower.username) {
      if (!users.userExists(borrower.username)) {
        return res.status(400).json({ error: 'borrower-not-found', message: 'Borrower not found on platform' });
      }
      if (borrower.username.toLowerCase() === req.username) {
        return res.status(400).json({ error: 'self-lending', message: 'Cannot lend items to yourself' });
      }
    }

    if (!terms.dateLent || !terms.expectedReturnDate) {
      return res.status(400).json({ error: 'required-dates', message: 'Lending dates are required' });
    }

    if (terms.requireDeposit && (!terms.depositAmount || parseFloat(terms.depositAmount) <= 0)) {
      return res.status(400).json({ error: 'required-deposit', message: 'Deposit amount must be greater than zero' });
    }

    const result = lendings.createLending(req.username, borrower, itemId, {
      ...terms,
      conditionAtLending: item.condition
    });

    if (!result.success) {
      return res.status(400).json({ error: 'creation-failed', message: result.reason });
    }

    if (!borrower.username) {
      items.setItemLent(itemId, result.lending.id);
      users.incrementLendings(req.username);
    }

    if (borrower.username) {
      const lender = users.getUser(req.username);
      activities.notifyLendingRequest(
        borrower.username,
        lender.displayName,
        item.name,
        result.lending.id
      );
    }

    res.status(201).json({ lending: result.lending });
  });

  router.post('/:lendingId/accept', requireAuth, (req, res) => {
    const { lendingId } = req.params;

    const lending = lendings.getLending(lendingId);
    if (!lending) {
      return res.status(404).json({ error: 'not-found', message: 'Lending not found' });
    }

    const result = lendings.acceptLending(lendingId, req.username);

    if (!result.success) {
      const statusCode = result.reason.includes('not found') ? 404 : 
                        result.reason.includes('authorized') || result.reason.includes('Only') ? 403 : 400;
      return res.status(statusCode).json({ error: 'accept-failed', message: result.reason });
    }

    items.setItemLent(result.lending.itemId, lendingId);
    users.incrementLendings(result.lending.lenderUsername);
    if (result.lending.borrowerUsername) {
      users.incrementBorrowings(result.lending.borrowerUsername);
    }

    const item = items.getItem(result.lending.itemId);
    const accepter = users.getUser(req.username);
    
    if (lending.isBorrowRequest) {
      activities.addActivity(
        result.lending.borrowerUsername,
        'lending_accepted',
        accepter.displayName + ' approved your request to borrow "' + item.name + '"',
        lendingId
      );
    } else {
      activities.notifyLendingAccepted(
        result.lending.lenderUsername,
        accepter.displayName,
        item.name,
        lendingId
      );
    }

    res.json({ lending: result.lending });
  });

  router.post('/:lendingId/decline', requireAuth, (req, res) => {
    const { lendingId } = req.params;
    const { reason } = req.body;

    const lending = lendings.getLending(lendingId);
    if (!lending) {
      return res.status(404).json({ error: 'not-found', message: 'Lending not found' });
    }

    const result = lendings.declineLending(lendingId, req.username, reason);

    if (!result.success) {
      return res.status(400).json({ error: 'decline-failed', message: result.reason });
    }

    const item = items.getItem(lending.itemId);
    const decliner = users.getUser(req.username);
    
    if (lending.isBorrowRequest) {
      if (lending.borrowerUsername) {
        activities.addActivity(
          lending.borrowerUsername,
          'lending_declined',
          decliner.displayName + ' declined your request to borrow "' + item.name + '"',
          lendingId
        );
      }
    } else {
      if (lending.lenderUsername !== req.username) {
        activities.notifyLendingDeclined(
          lending.lenderUsername,
          decliner.displayName,
          item.name,
          lendingId
        );
      }
    }

    res.json({ lending: result.lending });
  });

  router.post('/:lendingId/negotiate', requireAuth, (req, res) => {
    const { lendingId } = req.params;
    const { newTerms, message } = req.body;

    if (!newTerms || Object.keys(newTerms).length === 0) {
      return res.status(400).json({ error: 'required-terms', message: 'New terms are required' });
    }

    const lending = lendings.getLending(lendingId);
    if (!lending) {
      return res.status(404).json({ error: 'not-found', message: 'Lending not found' });
    }

    const result = lendings.proposeDifferentTerms(lendingId, req.username, newTerms, message);

    if (!result.success) {
      return res.status(400).json({ error: 'negotiate-failed', message: result.reason });
    }

    res.json({ lending: result.lending });
  });

  router.post('/:lendingId/extension', requireAuth, (req, res) => {
    const { lendingId } = req.params;
    const { newReturnDate, reason } = req.body;

    if (!newReturnDate) {
      return res.status(400).json({ error: 'required-date', message: 'New return date is required' });
    }

    const result = lendings.requestExtension(lendingId, req.username, newReturnDate, reason);

    if (!result.success) {
      const statusCode = result.reason === 'Lending not found' ? 404 : 
                        result.reason === 'Not authorized' ? 403 : 400;
      return res.status(statusCode).json({ error: 'extension-failed', message: result.reason });
    }

    const item = items.getItem(result.lending.itemId);
    const borrower = users.getUser(req.username);
    activities.notifyExtensionRequested(
      result.lending.lenderUsername,
      borrower.displayName,
      item.name,
      lendingId
    );

    res.json({ lending: result.lending });
  });

  router.post('/:lendingId/extension/respond', requireAuth, (req, res) => {
    const { lendingId } = req.params;
    const { approved } = req.body;

    if (approved === undefined) {
      return res.status(400).json({ error: 'required-response', message: 'Approval response is required' });
    }

    const result = lendings.respondToExtension(lendingId, req.username, approved);

    if (!result.success) {
      const statusCode = result.reason === 'Lending not found' ? 404 : 
                        result.reason === 'Not authorized' ? 403 : 400;
      return res.status(statusCode).json({ error: 'response-failed', message: result.reason });
    }

    const item = items.getItem(result.lending.itemId);
    const lender = users.getUser(req.username);
    
    if (approved) {
      activities.notifyExtensionApproved(
        result.lending.borrowerUsername,
        lender.displayName,
        item.name,
        lendingId
      );
    } else {
      activities.notifyExtensionDenied(
        result.lending.borrowerUsername,
        lender.displayName,
        item.name,
        lendingId
      );
    }

    res.json({ lending: result.lending });
  });

  router.post('/:lendingId/return/initiate', requireAuth, (req, res) => {
    const { lendingId } = req.params;

    const result = lendings.initiateReturn(lendingId, req.username);

    if (!result.success) {
      const statusCode = result.reason === 'Lending not found' ? 404 : 
                        result.reason === 'Not authorized' ? 403 : 400;
      return res.status(statusCode).json({ error: 'return-failed', message: result.reason });
    }

    const item = items.getItem(result.lending.itemId);
    const borrower = users.getUser(req.username);
    activities.notifyReturnInitiated(
      result.lending.lenderUsername,
      borrower.displayName,
      item.name,
      lendingId
    );

    res.json({ lending: result.lending });
  });

  router.post('/:lendingId/return/confirm', requireAuth, (req, res) => {
    const { lendingId } = req.params;
    const { condition, notes } = req.body;

    const lending = lendings.getLending(lendingId);
    if (!lending) {
      return res.status(404).json({ error: 'not-found', message: 'Lending not found' });
    }

    if (condition && condition !== lending.conditionAtLending && !notes) {
      return res.status(400).json({ 
        error: 'required-explanation', 
        message: 'Please explain the condition change' 
      });
    }

    const result = lendings.confirmReturn(lendingId, req.username, { condition, notes });

    if (!result.success) {
      const statusCode = result.reason === 'Lending not found' ? 404 : 
                        result.reason === 'Not authorized' ? 403 : 400;
      return res.status(statusCode).json({ error: 'confirm-failed', message: result.reason });
    }

    items.setItemAvailable(result.lending.itemId);
    
    const isOnTime = result.lending.actualReturnDate <= result.lending.terms.expectedReturnDate;
    if (result.lending.borrowerUsername) {
      users.recordReturn(result.lending.borrowerUsername, isOnTime);
    }

    const item = items.getItem(result.lending.itemId);
    items.addToLendingHistory(result.lending.itemId, {
      lendingId,
      borrower: result.lending.borrowerInfo.name,
      dateLent: result.lending.terms.dateLent,
      dateReturned: result.lending.actualReturnDate,
      conditionAtLending: result.lending.conditionAtLending,
      conditionAtReturn: result.lending.conditionAtReturn
    });

    if (result.lending.borrowerUsername) {
      const lender = users.getUser(req.username);
      activities.notifyItemReturned(
        result.lending.borrowerUsername,
        lender.displayName,
        item.name,
        lendingId
      );
    }

    res.json({ lending: result.lending });
  });

  router.post('/:lendingId/rate', requireAuth, (req, res) => {
    const { lendingId } = req.params;
    const { rating, isLenderRating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'invalid-rating', message: 'Rating must be between 1 and 5' });
    }

    const result = lendings.addRating(lendingId, req.username, rating, isLenderRating);

    if (!result.success) {
      const statusCode = result.reason === 'Lending not found' ? 404 : 
                        result.reason === 'Not authorized' ? 403 : 400;
      return res.status(statusCode).json({ error: 'rating-failed', message: result.reason });
    }

    const rater = users.getUser(req.username);
    
    if (isLenderRating) {
      users.addRating(result.lending.lenderUsername, rating);
      activities.notifyRatingReceived(
        result.lending.lenderUsername,
        rater.displayName,
        rating,
        lendingId
      );
    } else {
      if (result.lending.borrowerUsername) {
        users.addRating(result.lending.borrowerUsername, rating);
        activities.notifyRatingReceived(
          result.lending.borrowerUsername,
          rater.displayName,
          rating,
          lendingId
        );
      }
    }

    res.json({ lending: result.lending });
  });

  return router;
}

export default createLendingRoutes;
