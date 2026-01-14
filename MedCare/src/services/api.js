"use strict";

// ============ HELPER FUNCTION ============
function handleResponse(response) {
  if (!response.ok) {
    return response.json().then(err => Promise.reject(err));
  }
  return response.json();
}

// ============ AUTH ============
function fetchSession() {
  return fetch('/api/auth/session', {
    method: 'GET',
    credentials: 'include'
  }).then(handleResponse);
}

function register(username, displayName, email, phone) {
  return fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, displayName, email, phone })
  }).then(handleResponse);
}

function login(username) {
  return fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username })
  }).then(handleResponse);
}

function logout() {
  return fetch('/api/auth/session', {
    method: 'DELETE',
    credentials: 'include'
  }).then(handleResponse);
}

// ============ APPOINTMENTS ============
function getAppointments() {
  return fetch('/api/appointments', {
    method: 'GET',
    credentials: 'include'
  }).then(handleResponse);
}

function createAppointment(apptData) {
  return fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(apptData)
  }).then(handleResponse);
}

// ============ MEDICAL TESTS ============
function getMedicalTests() {
  return fetch('/api/medical-tests', {
    credentials: 'include'
  }).then(handleResponse);
}

function addMedicalTest(testData) {
  return fetch('/api/medical-tests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(testData)
  }).then(handleResponse);
}

function updateMedicalTest(id, testData) {
  return fetch(`/api/medical-tests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(testData)
  }).then(handleResponse);
}

function deleteMedicalTest(id) {
  return fetch(`/api/medical-tests/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  }).then(handleResponse);
}

function filterMedicalTestsByStatus(status) {
  return fetch(`/api/medical-tests/filter/status/${status}`, {
    credentials: 'include'
  }).then(handleResponse);
}

function filterMedicalTestsByCategory(category) {
  return fetch(`/api/medical-tests/filter/category/${category}`, {
    credentials: 'include'
  }).then(handleResponse);
}

function searchMedicalTests(query) {
  return fetch(`/api/medical-tests/search/${encodeURIComponent(query)}`, {
    credentials: 'include'
  }).then(handleResponse);
}

// ============ PRESCRIPTIONS ============
function getPrescriptions() {
  return fetch('/api/prescriptions', {
    credentials: 'include'
  }).then(handleResponse);
}

function createPrescription(data) {
  return fetch('/api/prescriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  }).then(handleResponse);
}

function updatePrescription(id, data) {
  return fetch(`/api/prescriptions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  }).then(handleResponse);
}

function deletePrescription(id) {
  return fetch(`/api/prescriptions/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  }).then(handleResponse);
}

// ============ SYMPTOMS ============
function getSymptoms() {
  return fetch('/api/symptoms', {
    credentials: 'include'
  }).then(handleResponse);
}

function createSymptom(data) {
  return fetch('/api/symptoms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  }).then(handleResponse);
}

function deleteSymptom(id) {
  return fetch(`/api/symptoms/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  }).then(handleResponse);
}

// ============ EXPORTS ============
export {
  // Auth
  fetchSession,
  register,
  login,
  logout,
  // Appointments
  getAppointments,
  createAppointment,
  // Medical Tests
  getMedicalTests,
  addMedicalTest,
  updateMedicalTest,
  deleteMedicalTest,
  filterMedicalTestsByStatus,
  filterMedicalTestsByCategory,
  searchMedicalTests,
  // Prescriptions
  getPrescriptions,
  createPrescription,
  updatePrescription,
  deletePrescription,
  // Symptoms
  getSymptoms,
  createSymptom,
  deleteSymptom
};