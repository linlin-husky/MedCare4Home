"use strict";

import crypto from 'crypto';

const lendings = {};

const LENDING_STATUSES = [
  'pending',
  'negotiating',
  'accepted',
  'active',
  'return-initiated',
  'completed',
  'declined',
  'cancelled',
  'disputed'
];

const MAX_NEGOTIATION_ROUNDS = 3;

function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  return input.trim().replace(/[<>]/g, '');
}

function generateLendingId() {
  return crypto.randomUUID();
}

function createLending(lenderUsername, borrowerInfo, itemId, terms) {
  const id = generateLendingId();
  
  const sanitizedBorrowerName = sanitizeInput(borrowerInfo.name || borrowerInfo.username);
  const sanitizedBorrowerEmail = sanitizeInput(borrowerInfo.email || '');
  const sanitizedBorrowerPhone = sanitizeInput(borrowerInfo.phone || '');
  const sanitizedNotes = sanitizeInput(terms.notes || '');
  const sanitizedConditionExpectation = sanitizeInput(terms.conditionExpectation || '');
  
  if (!terms.dateLent) {
    return { success: false, reason: 'Date lent is required' };
  }
  
  if (!terms.expectedReturnDate) {
    return { success: false, reason: 'Expected return date is required' };
  }
  
  const dateLent = new Date(terms.dateLent).getTime();
  const expectedReturn = new Date(terms.expectedReturnDate).getTime();
  
  if (expectedReturn <= dateLent) {
    return { success: false, reason: 'Return date must be after lending date' };
  }
  
  let securityDeposit = 0;
  if (terms.requireDeposit) {
    securityDeposit = parseFloat(terms.depositAmount) || 0;
    if (securityDeposit <= 0) {
      return { success: false, reason: 'Deposit amount must be greater than zero' };
    }
  }
  
  const isBorrowRequest = terms.isBorrowRequest || false;
  
  lendings[id] = {
    id,
    itemId,
    lenderUsername: lenderUsername.toLowerCase(),
    borrowerUsername: borrowerInfo.username ? borrowerInfo.username.toLowerCase() : null,
    borrowerInfo: {
      name: sanitizedBorrowerName,
      email: sanitizedBorrowerEmail,
      phone: sanitizedBorrowerPhone,
      isPlatformUser: Boolean(borrowerInfo.username)
    },
    terms: {
      dateLent,
      expectedReturnDate: expectedReturn,
      conditionExpectation: sanitizedConditionExpectation,
      notes: sanitizedNotes,
      requireDeposit: Boolean(terms.requireDeposit),
      depositAmount: securityDeposit,
      allowExtensions: Boolean(terms.allowExtensions)
    },

    status: borrowerInfo.username ? 'pending' : 'active',
    isBorrowRequest: isBorrowRequest,
    negotiationRounds: 0,
    negotiationHistory: [],
    conditionAtLending: terms.conditionAtLending || 'good',
    conditionAtReturn: null,
    actualReturnDate: null,
    returnInitiatedAt: null,
    lenderRating: null,
    borrowerRating: null,
    reminders: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  return { success: true, lending: lendings[id] };
}

function getLending(lendingId) {
  return lendings[lendingId] || null;
}

function updateLendingStatus(lendingId, newStatus, username) {
  const lending = lendings[lendingId];
  if (!lending) {
    return { success: false, reason: 'Lending not found' };
  }
  
  const isLender = lending.lenderUsername === username.toLowerCase();
  const isBorrower = lending.borrowerUsername === username.toLowerCase();
  
  if (!isLender && !isBorrower) {
    return { success: false, reason: 'Not authorized' };
  }
  
  if (!LENDING_STATUSES.includes(newStatus)) {
    return { success: false, reason: 'Invalid status' };
  }
  
  lending.status = newStatus;
  lending.updatedAt = Date.now();
  
  return { success: true, lending };
}

function acceptLending(lendingId, username) {
  const lending = lendings[lendingId];
  if (!lending) {
    return { success: false, reason: 'Lending not found' };
  }
  
  const isLender = lending.lenderUsername === username.toLowerCase();
  const isBorrower = lending.borrowerUsername === username.toLowerCase();
  

  if (lending.isBorrowRequest) {
    if (!isLender) {
      return { success: false, reason: 'Only the item owner can accept borrow requests' };
    }
  } else {
    if (!isBorrower) {
      return { success: false, reason: 'Only the borrower can accept lending offers' };
    }
  }
  
  if (lending.status !== 'pending' && lending.status !== 'negotiating') {
    return { success: false, reason: 'Cannot accept lending in current state' };
  }
  
  lending.status = 'active';
  lending.updatedAt = Date.now();
  
  return { success: true, lending };
}

function declineLending(lendingId, username, reason) {
  const lending = lendings[lendingId];
  if (!lending) {
    return { success: false, reason: 'Lending not found' };
  }
  
  const isLender = lending.lenderUsername === username.toLowerCase();
  const isBorrower = lending.borrowerUsername === username.toLowerCase();
  
  if (!isLender && !isBorrower) {
    return { success: false, reason: 'Not authorized' };
  }
  
  if (lending.status !== 'pending' && lending.status !== 'negotiating') {
    return { success: false, reason: 'Cannot decline lending in current state' };
  }
  
  lending.status = 'declined';
  lending.declineReason = sanitizeInput(reason || '');
  lending.declinedBy = username.toLowerCase();
  lending.updatedAt = Date.now();
  
  return { success: true, lending };
}

function proposeDifferentTerms(lendingId, username, newTerms, message) {
  const lending = lendings[lendingId];
  if (!lending) {
    return { success: false, reason: 'Lending not found' };
  }
  
  const isLender = lending.lenderUsername === username.toLowerCase();
  const isBorrower = lending.borrowerUsername === username.toLowerCase();
  
  if (!isLender && !isBorrower) {
    return { success: false, reason: 'Not authorized' };
  }
  
  if (lending.status !== 'pending' && lending.status !== 'negotiating') {
    return { success: false, reason: 'Cannot negotiate in current state' };
  }
  
  if (lending.negotiationRounds >= MAX_NEGOTIATION_ROUNDS) {
    lending.status = 'declined';
    lending.declineReason = 'Maximum negotiation rounds exceeded';
    lending.updatedAt = Date.now();
    return { success: false, reason: 'Maximum negotiation rounds exceeded. Lending declined.' };
  }
  
  lending.negotiationRounds += 1;
  lending.negotiationHistory.push({
    round: lending.negotiationRounds,
    proposedBy: username.toLowerCase(),
    terms: newTerms,
    message: sanitizeInput(message || ''),
    timestamp: Date.now()
  });
  
  if (newTerms.expectedReturnDate) {
    lending.terms.expectedReturnDate = new Date(newTerms.expectedReturnDate).getTime();
  }
  if (newTerms.depositAmount !== undefined) {
    lending.terms.depositAmount = parseFloat(newTerms.depositAmount) || 0;
  }
  if (newTerms.conditionExpectation) {
    lending.terms.conditionExpectation = sanitizeInput(newTerms.conditionExpectation);
  }
  
  lending.status = 'negotiating';
  lending.updatedAt = Date.now();
  
  return { success: true, lending };
}

function requestExtension(lendingId, borrowerUsername, newReturnDate, reason) {
  const lending = lendings[lendingId];
  if (!lending) {
    return { success: false, reason: 'Lending not found' };
  }
  
  if (lending.borrowerUsername !== borrowerUsername.toLowerCase()) {
    return { success: false, reason: 'Not authorized' };
  }
  
  if (lending.status !== 'active') {
    return { success: false, reason: 'Can only request extension for active lendings' };
  }
  
  if (!lending.terms.allowExtensions) {
    return { success: false, reason: 'Extensions are not allowed for this lending' };
  }
  
  const newDate = new Date(newReturnDate).getTime();
  if (newDate <= lending.terms.expectedReturnDate) {
    return { success: false, reason: 'New date must be after current return date' };
  }
  
  lending.extensionRequest = {
    newReturnDate: newDate,
    reason: sanitizeInput(reason || ''),
    requestedAt: Date.now(),
    status: 'pending'
  };
  lending.updatedAt = Date.now();
  
  return { success: true, lending };
}

function respondToExtension(lendingId, lenderUsername, approved) {
  const lending = lendings[lendingId];
  if (!lending) {
    return { success: false, reason: 'Lending not found' };
  }
  
  if (lending.lenderUsername !== lenderUsername.toLowerCase()) {
    return { success: false, reason: 'Not authorized' };
  }
  
  if (!lending.extensionRequest || lending.extensionRequest.status !== 'pending') {
    return { success: false, reason: 'No pending extension request' };
  }
  
  if (approved) {
    lending.terms.expectedReturnDate = lending.extensionRequest.newReturnDate;
    lending.extensionRequest.status = 'approved';
  } else {
    lending.extensionRequest.status = 'denied';
  }
  lending.updatedAt = Date.now();
  
  return { success: true, lending };
}

function initiateReturn(lendingId, borrowerUsername) {
  const lending = lendings[lendingId];
  if (!lending) {
    return { success: false, reason: 'Lending not found' };
  }
  
  if (lending.borrowerUsername !== borrowerUsername.toLowerCase()) {
    return { success: false, reason: 'Not authorized' };
  }
  
  if (lending.status !== 'active') {
    return { success: false, reason: 'Can only initiate return for active lendings' };
  }
  
  lending.status = 'return-initiated';
  lending.returnInitiatedAt = Date.now();
  lending.updatedAt = Date.now();
  
  return { success: true, lending };
}

function confirmReturn(lendingId, lenderUsername, returnDetails) {
  const lending = lendings[lendingId];
  if (!lending) {
    return { success: false, reason: 'Lending not found' };
  }
  
  if (lending.lenderUsername !== lenderUsername.toLowerCase()) {
    return { success: false, reason: 'Not authorized' };
  }
  
  if (lending.status !== 'return-initiated' && lending.status !== 'active') {
    return { success: false, reason: 'Cannot confirm return in current state' };
  }
  
  lending.conditionAtReturn = returnDetails.condition || lending.conditionAtLending;
  lending.actualReturnDate = Date.now();
  lending.status = 'completed';
  lending.returnNotes = sanitizeInput(returnDetails.notes || '');
  lending.updatedAt = Date.now();
  
  return { success: true, lending };
}

function addRating(lendingId, username, rating, isLenderRating) {
  const lending = lendings[lendingId];
  if (!lending) {
    return { success: false, reason: 'Lending not found' };
  }
  
  if (lending.status !== 'completed') {
    return { success: false, reason: 'Can only rate completed lendings' };
  }
  
  const numRating = parseInt(rating, 10);
  if (numRating < 1 || numRating > 5) {
    return { success: false, reason: 'Rating must be between 1 and 5' };
  }
  
  if (isLenderRating) {
    if (lending.borrowerUsername !== username.toLowerCase()) {
      return { success: false, reason: 'Not authorized' };
    }
    lending.lenderRating = numRating;
  } else {
    if (lending.lenderUsername !== username.toLowerCase()) {
      return { success: false, reason: 'Not authorized' };
    }
    lending.borrowerRating = numRating;
  }
  
  lending.updatedAt = Date.now();
  return { success: true, lending };
}

function getUserLendings(username) {
  return Object.values(lendings).filter(
    lending => lending.lenderUsername === username.toLowerCase()
  );
}

function getUserBorrowings(username) {
  return Object.values(lendings).filter(
    lending => lending.borrowerUsername === username.toLowerCase()
  );
}

function getActiveLendings(username) {
  return getUserLendings(username).filter(
    lending => lending.status === 'active' || lending.status === 'return-initiated'
  );
}

function getActiveBorrowings(username) {
  return getUserBorrowings(username).filter(
    lending => lending.status === 'active' || lending.status === 'return-initiated'
  );
}


function getPendingRequests(username) {
  const lowerUsername = username.toLowerCase();
  return Object.values(lendings).filter(lending => {
    if (lending.status !== 'pending' && lending.status !== 'negotiating') {
      return false;
    }
    if (lending.isBorrowRequest && lending.lenderUsername === lowerUsername) {
      return true;
    }
    if (!lending.isBorrowRequest && lending.borrowerUsername === lowerUsername) {
      return true;
    }
    return false;
  });
}

function getOutgoingRequests(username) {
  const lowerUsername = username.toLowerCase();
  return Object.values(lendings).filter(lending => {
    if (lending.status !== 'pending' && lending.status !== 'negotiating') {
      return false;
    }
    if (lending.isBorrowRequest && lending.borrowerUsername === lowerUsername) {
      return true;
    }
    if (!lending.isBorrowRequest && lending.lenderUsername === lowerUsername) {
      return true;
    }
    return false;
  });
}

function getOverdueLendings(username) {
  const now = Date.now();
  return getActiveLendings(username).filter(
    lending => lending.terms.expectedReturnDate < now
  );
}

function getOverdueBorrowings(username) {
  const now = Date.now();
  return getActiveBorrowings(username).filter(
    lending => lending.terms.expectedReturnDate < now
  );
}

function getDueSoonLendings(username, daysAhead = 3) {
  const now = Date.now();
  const threshold = now + (daysAhead * 24 * 60 * 60 * 1000);
  return getActiveLendings(username).filter(
    lending => 
      lending.terms.expectedReturnDate > now && 
      lending.terms.expectedReturnDate <= threshold
  );
}

function getLendingHistory(itemId) {
  return Object.values(lendings)
    .filter(lending => lending.itemId === itemId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

function addReminder(lendingId, reminderType) {
  const lending = lendings[lendingId];
  if (lending) {
    lending.reminders.push({
      type: reminderType,
      sentAt: Date.now()
    });
  }
}

function getAllActiveLendings() {
  return Object.values(lendings).filter(
    lending => lending.status === 'active'
  );
}

export default {
  createLending,
  getLending,
  updateLendingStatus,
  acceptLending,
  declineLending,
  proposeDifferentTerms,
  requestExtension,
  respondToExtension,
  initiateReturn,
  confirmReturn,
  addRating,
  getUserLendings,
  getUserBorrowings,
  getActiveLendings,
  getActiveBorrowings,
  getPendingRequests,
  getOutgoingRequests,
  getOverdueLendings,
  getOverdueBorrowings,
  getDueSoonLendings,
  getLendingHistory,
  addReminder,
  getAllActiveLendings
};
