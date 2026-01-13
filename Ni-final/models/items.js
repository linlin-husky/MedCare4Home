"use strict";

import crypto from 'crypto';

const items = {};

const CATEGORIES = [
  'books',
  'electronics',
  'tools',
  'sports',
  'kitchen',
  'clothing',
  'games',
  'music',
  'outdoor',
  'other'
];

const CONDITIONS = ['excellent', 'good', 'fair', 'poor'];

function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  return input.trim().replace(/[<>]/g, '');
}

function generateItemId() {
  return crypto.randomUUID();
}

function createItem(ownerUsername, itemData) {
  const id = generateItemId();
  const sanitizedName = sanitizeInput(itemData.name);
  const sanitizedDescription = sanitizeInput(itemData.description || '');
  const sanitizedNotes = sanitizeInput(itemData.notes || '');
  
  if (!sanitizedName || sanitizedName.length < 2) {
    return { success: false, reason: 'Item name must be at least 2 characters' };
  }
  
  if (!CATEGORIES.includes(itemData.category)) {
    return { success: false, reason: 'Invalid category' };
  }
  
  if (!CONDITIONS.includes(itemData.condition)) {
    return { success: false, reason: 'Invalid condition' };
  }
  
  const estimatedValue = parseFloat(itemData.estimatedValue) || 0;
  if (estimatedValue < 0) {
    return { success: false, reason: 'Value cannot be negative' };
  }
  
  items[id] = {
    id,
    ownerUsername: ownerUsername.toLowerCase(),
    name: sanitizedName,
    description: sanitizedDescription,
    category: itemData.category,
    condition: itemData.condition,
    estimatedValue,
    notes: sanitizedNotes,
    isPublic: Boolean(itemData.isPublic),
    status: 'available',
    currentLendingId: null,
    lendingHistory: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  return { success: true, item: items[id] };
}

function getItem(itemId) {
  return items[itemId] || null;
}

function updateItem(itemId, ownerUsername, updates) {
  const item = items[itemId];
  if (!item) {
    return { success: false, reason: 'Item not found' };
  }
  
  if (item.ownerUsername !== ownerUsername.toLowerCase()) {
    return { success: false, reason: 'Not authorized to update this item' };
  }
  
  if (item.status !== 'available') {
    return { success: false, reason: 'Cannot update item while it is lent out' };
  }
  
  if (updates.name !== undefined) {
    const sanitizedName = sanitizeInput(updates.name);
    if (sanitizedName.length < 2) {
      return { success: false, reason: 'Item name must be at least 2 characters' };
    }
    item.name = sanitizedName;
  }
  
  if (updates.description !== undefined) {
    item.description = sanitizeInput(updates.description);
  }
  
  if (updates.category !== undefined) {
    if (!CATEGORIES.includes(updates.category)) {
      return { success: false, reason: 'Invalid category' };
    }
    item.category = updates.category;
  }
  
  if (updates.condition !== undefined) {
    if (!CONDITIONS.includes(updates.condition)) {
      return { success: false, reason: 'Invalid condition' };
    }
    item.condition = updates.condition;
  }
  
  if (updates.estimatedValue !== undefined) {
    const value = parseFloat(updates.estimatedValue);
    if (value < 0) {
      return { success: false, reason: 'Value cannot be negative' };
    }
    item.estimatedValue = value;
  }
  
  if (updates.notes !== undefined) {
    item.notes = sanitizeInput(updates.notes);
  }
  
  if (updates.isPublic !== undefined) {
    item.isPublic = Boolean(updates.isPublic);
  }
  
  item.updatedAt = Date.now();
  return { success: true, item };
}

function deleteItem(itemId, ownerUsername) {
  const item = items[itemId];
  if (!item) {
    return { success: false, reason: 'Item not found' };
  }
  
  if (item.ownerUsername !== ownerUsername.toLowerCase()) {
    return { success: false, reason: 'Not authorized to delete this item' };
  }
  
  if (item.status !== 'available') {
    return { success: false, reason: 'Cannot delete item while it is lent out' };
  }
  
  delete items[itemId];
  return { success: true };
}

function getUserItems(username) {
  return Object.values(items).filter(item => item.ownerUsername === username.toLowerCase());
}

function getAvailableItems(username) {
  return getUserItems(username).filter(item => item.status === 'available');
}

function getLentItems(username) {
  return getUserItems(username).filter(item => item.status === 'lent');
}

function setItemLent(itemId, lendingId) {
  const item = items[itemId];
  if (item) {
    item.status = 'lent';
    item.currentLendingId = lendingId;
    item.updatedAt = Date.now();
  }
}

function setItemAvailable(itemId) {
  const item = items[itemId];
  if (item) {
    item.status = 'available';
    item.currentLendingId = null;
    item.updatedAt = Date.now();
  }
}

function addToLendingHistory(itemId, lendingRecord) {
  const item = items[itemId];
  if (item) {
    item.lendingHistory.push(lendingRecord);
  }
}

function getPublicItems(filters = {}) {
  let result = Object.values(items).filter(item => item.isPublic && item.status === 'available');
  
  if (filters.category) {
    result = result.filter(item => item.category === filters.category);
  }
  
  if (filters.condition) {
    result = result.filter(item => item.condition === filters.condition);
  }
  
  if (filters.minValue !== undefined) {
    result = result.filter(item => item.estimatedValue >= filters.minValue);
  }
  
  if (filters.maxValue !== undefined) {
    result = result.filter(item => item.estimatedValue <= filters.maxValue);
  }
  
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    result = result.filter(item => 
      item.name.toLowerCase().includes(searchTerm) || 
      item.description.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'oldest':
        result.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'value-high':
        result.sort((a, b) => b.estimatedValue - a.estimatedValue);
        break;
      case 'value-low':
        result.sort((a, b) => a.estimatedValue - b.estimatedValue);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
  }
  
  return result;
}

function searchItems(query, ownerUsername = null) {
  const searchTerm = query.toLowerCase();
  let result = Object.values(items).filter(item =>
    item.name.toLowerCase().includes(searchTerm) ||
    item.description.toLowerCase().includes(searchTerm) ||
    item.category.toLowerCase().includes(searchTerm)
  );
  
  if (ownerUsername) {
    result = result.filter(item => item.ownerUsername === ownerUsername.toLowerCase());
  }
  
  return result;
}

function getCategories() {
  return CATEGORIES;
}

function getConditions() {
  return CONDITIONS;
}

export default {
  createItem,
  getItem,
  updateItem,
  deleteItem,
  getUserItems,
  getAvailableItems,
  getLentItems,
  setItemLent,
  setItemAvailable,
  addToLendingHistory,
  getPublicItems,
  searchItems,
  getCategories,
  getConditions
};

