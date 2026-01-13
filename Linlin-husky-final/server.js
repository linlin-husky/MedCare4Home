"use strict";

import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import sessionsModel from './models/sessions.js';
import usersModel from './models/users.js';
import itemsModel from './models/items.js';
import lendingsModel from './models/lendings.js';
import activitiesModel from './models/activities.js';

import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import lendingRoutes from './routes/lendings.js';
import activityRoutes from './routes/activities.js';
import userRoutes from './routes/users.js';
import analyticsRoutes from './routes/analytics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const models = {
  sessions: sessionsModel,
  users: usersModel,
  items: itemsModel,
  lendings: lendingsModel,
  activities: activitiesModel
};

app.use('/api/auth', authRoutes(models));
app.use('/api/items', itemRoutes(models));
app.use('/api/lendings', lendingRoutes(models));
app.use('/api/activities', activityRoutes(models));
app.use('/api/users', userRoutes(models));
app.use('/api/analytics', analyticsRoutes(models));

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
