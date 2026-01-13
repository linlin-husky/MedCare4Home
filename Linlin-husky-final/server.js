"use strict";

import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import usersModel from './models/users.js';
import itemsModel from './models/items.js';
import lendingsModel from './models/lendings.js';
import activitiesModel from './models/activities.js';
import sessionsModel from './models/sessions.js';

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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medcare4home';

app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Models object to pass to routes (now wrappers around Mongoose)
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

console.log('Attempting to connect to MongoDB at', MONGODB_URI);
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.error('Make sure MongoDB is running!');
    process.exit(1);
  });
