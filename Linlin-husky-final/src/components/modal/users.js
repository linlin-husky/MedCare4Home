"use strict";

const users = {};

const BANNED_USERS = ['dog'];

const ADMIN_USERS = ['admin'];

const DEFAULT_TRUST_SCORE = 50;

function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  return input.trim().replace(/[<>]/g, '');
}

function isValidUsername(username) {
  const sanitized = sanitizeInput(username);
  if (!sanitized || sanitized.length < 2 || sanitized.length > 30) {
    return { valid: false, reason: 'Username must be between 2 and 30 characters' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(sanitized)) {
    return { valid: false, reason: 'Username can only contain letters, numbers, and underscores' };
  }
  return { valid: true };
}

function isBannedUser(username) {
  return BANNED_USERS.includes(username.toLowerCase());
}

function isAdmin(username) {
  return ADMIN_USERS.includes(username.toLowerCase());
}

function userExists(username) {
  return Boolean(users[username.toLowerCase()]);
}

function createUser(username, displayName, email, phone) {
  const sanitizedUsername = sanitizeInput(username).toLowerCase();
  const sanitizedDisplayName = sanitizeInput(displayName) || sanitizedUsername;
  const sanitizedEmail = sanitizeInput(email);
  const sanitizedPhone = sanitizeInput(phone);
  
  if (users[sanitizedUsername]) {
    return { success: false, reason: 'Username already exists' };
  }
  
  users[sanitizedUsername] = {
    username: sanitizedUsername,
    displayName: sanitizedDisplayName,
    email: sanitizedEmail,
    phone: sanitizedPhone,
    trustScore: DEFAULT_TRUST_SCORE,
    totalLendings: 0,
    totalBorrowings: 0,
    onTimeReturns: 0,
    lateReturns: 0,
    disputesAgainst: 0,
    totalRatings: 0,
    ratingSum: 0,
    createdAt: Date.now(),
    lastActive: Date.now()
  };
  
  return { success: true, user: users[sanitizedUsername] };
}

function getUser(username) {
  return users[username.toLowerCase()] || null;
}

function updateUser(username, updates) {
  const user = users[username.toLowerCase()];
  if (!user) {
    return null;
  }
  
  const allowedUpdates = ['displayName', 'email', 'phone'];
  for (const key of allowedUpdates) {
    if (updates[key] !== undefined) {
      user[key] = sanitizeInput(updates[key]);
    }
  }
  user.lastActive = Date.now();
  return user;
}

function updateTrustScore(username) {
  const user = users[username.toLowerCase()];
  if (!user) {
    return;
  }
  
  let score = DEFAULT_TRUST_SCORE;
  
  const totalTransactions = user.onTimeReturns + user.lateReturns;
  if (totalTransactions > 0) {
    const onTimeRate = user.onTimeReturns / totalTransactions;
    score += Math.round(onTimeRate * 30);
  }
  
  if (user.totalRatings > 0) {
    const avgRating = user.ratingSum / user.totalRatings;
    score += Math.round((avgRating / 5) * 15);
  }
  
  const transactionBonus = Math.min(10, Math.floor(totalTransactions / 5));
  score += transactionBonus;
  
  score -= user.disputesAgainst * 5;
  
  score = Math.max(0, Math.min(100, score));
  user.trustScore = score;
  
  return score;
}

function addRating(username, rating) {
  const user = users[username.toLowerCase()];
  if (!user) {
    return;
  }
  user.totalRatings += 1;
  user.ratingSum += rating;
  updateTrustScore(username);
}

function recordReturn(username, isOnTime) {
  const user = users[username.toLowerCase()];
  if (!user) {
    return;
  }
  if (isOnTime) {
    user.onTimeReturns += 1;
  } else {
    user.lateReturns += 1;
  }
  updateTrustScore(username);
}

function recordDispute(username) {
  const user = users[username.toLowerCase()];
  if (!user) {
    return;
  }
  user.disputesAgainst += 1;
  updateTrustScore(username);
}

function incrementLendings(username) {
  const user = users[username.toLowerCase()];
  if (user) {
    user.totalLendings += 1;
  }
}

function incrementBorrowings(username) {
  const user = users[username.toLowerCase()];
  if (user) {
    user.totalBorrowings += 1;
  }
}

function getTrustBadge(score) {
  if (score >= 95) {
    return { badge: 'Elite', color: 'gold' };
  }
  if (score >= 85) {
    return { badge: 'Trusted', color: 'green' };
  }
  if (score >= 70) {
    return { badge: 'Reliable', color: 'blue' };
  }
  if (score >= 50) {
    return { badge: 'New User', color: 'gray' };
  }
  return { badge: 'Caution', color: 'red' };
}

function getPublicProfile(username) {
  const user = users[username.toLowerCase()];
  if (!user) {
    return null;
  }
  return {
    username: user.username,
    displayName: user.displayName,
    trustScore: user.trustScore,
    badge: getTrustBadge(user.trustScore),
    totalLendings: user.totalLendings,
    totalBorrowings: user.totalBorrowings,
    onTimeRate: user.onTimeReturns + user.lateReturns > 0 
      ? Math.round((user.onTimeReturns / (user.onTimeReturns + user.lateReturns)) * 100) 
      : 100,
    memberSince: user.createdAt
  };
}

function getAllUsers() {
  return Object.values(users).map(user => getPublicProfile(user.username));
}

function searchUsers(query) {
  const searchTerm = sanitizeInput(query).toLowerCase();
  return Object.values(users)
    .filter(user => 
      user.username.includes(searchTerm) || 
      user.displayName.toLowerCase().includes(searchTerm)
    )
    .map(user => getPublicProfile(user.username));
}

export default {
  sanitizeInput,
  isValidUsername,
  isBannedUser,
  isAdmin,
  userExists,
  createUser,
  getUser,
  updateUser,
  updateTrustScore,
  addRating,
  recordReturn,
  recordDispute,
  incrementLendings,
  incrementBorrowings,
  getTrustBadge,
  getPublicProfile,
  getAllUsers,
  searchUsers
};

