"use strict";

import crypto from 'crypto';

const sessions = {};

function generateSessionId() {
  return crypto.randomUUID();
}

function createSession(username) {
  const sid = generateSessionId();
  sessions[sid] = {
    username,
    createdAt: Date.now()
  };
  return sid;
}

function getSession(sid) {
  return sessions[sid] || null;
}

function deleteSession(sid) {
  delete sessions[sid];
}

function isValidSession(sid) {
  return Boolean(sessions[sid]);
}

function getUsername(sid) {
  const session = sessions[sid];
  return session ? session.username : null;
}

export default {
  createSession,
  getSession,
  deleteSession,
  isValidSession,
  getUsername
};

