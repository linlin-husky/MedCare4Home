"use strict";

function fetchSession() {
  return fetch('/api/auth/session', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function register(username, displayName, email, phone) {
  return fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, displayName, email, phone })
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function login(username) {
  return fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username })
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function logout() {
  return fetch('/api/auth/session', {
    method: 'DELETE',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function getItems() {
  return fetch('/api/items', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function getItem(itemId) {
  return fetch('/api/items/' + itemId, {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function createItem(itemData) {
  return fetch('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(itemData)
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function updateItem(itemId, updates) {
  return fetch('/api/items/' + itemId, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates)
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function deleteItem(itemId) {
  return fetch('/api/items/' + itemId, {
    method: 'DELETE',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function getPublicItems(filters) {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.condition) params.append('condition', filters.condition);
  if (filters.minValue) params.append('minValue', filters.minValue);
  if (filters.maxValue) params.append('maxValue', filters.maxValue);
  if (filters.search) params.append('search', filters.search);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);

  return fetch('/api/items/public?' + params.toString(), {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function searchItems(query, ownerOnly) {
  const params = new URLSearchParams({ q: query });
  if (ownerOnly) params.append('ownerOnly', 'true');

  return fetch('/api/items/search?' + params.toString(), {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function getCategories() {
  return fetch('/api/items/categories', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function getConditions() {
  return fetch('/api/items/conditions', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function getLendings() {
  return fetch('/api/lendings', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function getActiveLendings() {
  return fetch('/api/lendings/active', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function getBorrowings() {
  return fetch('/api/lendings/borrowings', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function getActiveBorrowings() {
  return fetch('/api/lendings/borrowings/active', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function getPendingRequests() {
  return fetch('/api/lendings/pending', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function getOverdueLendings() {
  return fetch('/api/lendings/overdue', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function getLending(lendingId) {
  return fetch('/api/lendings/' + lendingId, {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function createLending(lendingData) {
  return fetch('/api/lendings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(lendingData)
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function acceptLending(lendingId) {
  return fetch('/api/lendings/' + lendingId + '/accept', {
    method: 'POST',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function declineLending(lendingId, reason) {
  return fetch('/api/lendings/' + lendingId + '/decline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ reason })
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function negotiateLending(lendingId, newTerms, message) {
  return fetch('/api/lendings/' + lendingId + '/negotiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ newTerms, message })
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function requestExtension(lendingId, newReturnDate, reason) {
  return fetch('/api/lendings/' + lendingId + '/extension', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ newReturnDate, reason })
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function respondToExtension(lendingId, approved) {
  return fetch('/api/lendings/' + lendingId + '/extension/respond', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ approved })
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function initiateReturn(lendingId) {
  return fetch('/api/lendings/' + lendingId + '/return/initiate', {
    method: 'POST',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function confirmReturn(lendingId, condition, notes) {
  return fetch('/api/lendings/' + lendingId + '/return/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ condition, notes })
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function rateLending(lendingId, rating, isLenderRating) {
  return fetch('/api/lendings/' + lendingId + '/rate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ rating, isLenderRating })
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function getItemHistory(itemId) {
  return fetch('/api/lendings/item/' + itemId + '/history', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function getActivities() {
  return fetch('/api/activities', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function getUnreadActivityCount() {
  return fetch('/api/activities/unread', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function markActivityAsRead(activityId) {
  return fetch('/api/activities/' + activityId + '/read', {
    method: 'PATCH',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function searchUsers(query) {
  return fetch('/api/users/search?q=' + encodeURIComponent(query), {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function getUserProfile() {
  return fetch('/api/users/profile', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function updateUserProfile(updates) {
  return fetch('/api/users/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates)
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function getPublicUserProfile(username) {
  return fetch('/api/users/' + username, {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function getDashboardAnalytics() {
  return fetch('/api/analytics/dashboard', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function getAdminOverview() {
  return fetch('/api/analytics/admin/overview', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function requestToBorrow(itemId, requestData) {
  return fetch('/api/items/' + itemId + '/borrow-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(requestData)
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}


function getAppointments() {
  return fetch('/api/appointments', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

function createAppointment(apptData) {
  return fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(apptData)
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    });
}

export {
  fetchSession,
  register,
  login,
  logout,
  getAppointments,
  createAppointment, // Export new functions
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getPublicItems,
  searchItems,
  getCategories,
  getConditions,
  getLendings,
  getActiveLendings,
  getBorrowings,
  getActiveBorrowings,
  getPendingRequests,
  getOverdueLendings,
  getLending,
  createLending,
  acceptLending,
  declineLending,
  negotiateLending,
  requestExtension,
  respondToExtension,
  initiateReturn,
  confirmReturn,
  rateLending,
  getItemHistory,
  getActivities,
  getUnreadActivityCount,
  markActivityAsRead,
  searchUsers,
  getUserProfile,
  updateUserProfile,
  getPublicUserProfile,
  getDashboardAnalytics,
  getAdminOverview,
  requestToBorrow,

  // Medical Tests
  getMedicalTests: () => fetch('/api/medical-tests', { credentials: 'include' })
    .then(response => response.ok ? response.json() : Promise.reject(response.json())),

    addMedicalTest: (testData) => fetch('/api/medical-tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(testData)
    })
      .then(response => response.ok ? response.json() : Promise.reject(response.json())),

      updateMedicalTest: (id, testData) => fetch(`/api/medical-tests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(testData)
      })
        .then(response => response.ok ? response.json() : Promise.reject(response.json())),

        deleteMedicalTest: (id) => fetch(`/api/medical-tests/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        })
          .then(response => response.ok ? response.json() : Promise.reject(response.json())),

          filterMedicalTestsByStatus: (status) => fetch(`/api/medical-tests/filter/status/${status}`, { credentials: 'include' })
            .then(response => response.ok ? response.json() : Promise.reject(response.json())),

            filterMedicalTestsByCategory: (category) => fetch(`/api/medical-tests/filter/category/${category}`, { credentials: 'include' })
              .then(response => response.ok ? response.json() : Promise.reject(response.json())),

              searchMedicalTests: (query) => fetch(`/api/medical-tests/search/${encodeURIComponent(query)}`, { credentials: 'include' })
                .then(response => response.ok ? response.json() : Promise.reject(response.json()))
};
