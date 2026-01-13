"use strict";

import express from 'express';

function createAnalyticsRoutes(models) {
  const router = express.Router();
  const { sessions, users, items, lendings } = models;

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

  const requireAdmin = async (req, res, next) => {
    if (!users.isAdmin(req.username)) {
      return res.status(403).json({ error: 'admin-required', message: 'Admin access required' });
    }
    next();
  };

  router.get('/dashboard', requireAuth, async (req, res) => {
    const userItems = await items.getUserItems(req.username);
    const userLendings = await lendings.getUserLendings(req.username);
    const userBorrowings = await lendings.getUserBorrowings(req.username);
    const activeLendings = await lendings.getActiveLendings(req.username);
    const activeBorrowings = await lendings.getActiveBorrowings(req.username);
    const overdueLendings = await lendings.getOverdueLendings(req.username);
    const overdueBorrowings = await lendings.getOverdueBorrowings(req.username);
    const user = await users.getUser(req.username);

    const availableItems = userItems.filter(item => item.status === 'available');
    const lentItems = userItems.filter(item => item.status === 'lent');

    // Need to get items for active lendings to calculate value
    let totalValueOnLoan = 0;
    for (const lending of activeLendings) {
      const item = await items.getItem(lending.itemId);
      totalValueOnLoan += (item ? item.estimatedValue : 0);
    }

    const completedBorrowings = userBorrowings.filter(b => b.status === 'completed');
    const onTimeReturns = completedBorrowings.filter(
      b => b.actualReturnDate && b.actualReturnDate <= b.terms.expectedReturnDate
    ).length;

    res.json({
      lending: {
        totalItems: userItems.length,
        availableItems: availableItems.length,
        lentItems: lentItems.length,
        totalLendings: userLendings.length,
        activeLendings: activeLendings.length,
        overdueLendings: overdueLendings.length,
        totalValueOnLoan
      },
      borrowing: {
        totalBorrowings: userBorrowings.length,
        activeBorrowings: activeBorrowings.length,
        overdueBorrowings: overdueBorrowings.length,
        completedBorrowings: completedBorrowings.length,
        onTimeRate: completedBorrowings.length > 0
          ? Math.round((onTimeReturns / completedBorrowings.length) * 100)
          : 100
      },
      trust: {
        score: user.trustScore,
        badge: users.getTrustBadge(user.trustScore),
        totalRatings: user.totalRatings,
        onTimeReturns: user.onTimeReturns,
        lateReturns: user.lateReturns
      }
    });
  });

  router.get('/admin/overview', requireAuth, requireAdmin, async (req, res) => {
    const allUsers = await users.getAllUsers();

    // getAllActiveLendings is already async in our model
    const allActiveLendings = await lendings.getAllActiveLendings();

    const trustDistribution = {
      elite: 0,
      trusted: 0,
      reliable: 0,
      newUser: 0,
      caution: 0
    };

    for (const user of allUsers) {
      const badge = users.getTrustBadge(user.trustScore);
      switch (badge.badge) {
        case 'Elite':
          trustDistribution.elite += 1;
          break;
        case 'Trusted':
          trustDistribution.trusted += 1;
          break;
        case 'Reliable':
          trustDistribution.reliable += 1;
          break;
        case 'New User':
          trustDistribution.newUser += 1;
          break;
        case 'Caution':
          trustDistribution.caution += 1;
          break;
      }
    }

    const now = Date.now();
    const overdueLendings = allActiveLendings.filter(
      lending => lending.terms.expectedReturnDate < now
    );

    res.json({
      users: {
        total: allUsers.length,
        trustDistribution
      },
      lendings: {
        active: allActiveLendings.length,
        overdue: overdueLendings.length
      }
    });
  });

  return router;
}

export default createAnalyticsRoutes;
