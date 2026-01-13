import express from 'express';
import cookieParser from 'cookie-parser';
import authController from './auth-controller.js';
import userController from './user-controller.js';
import itemsController from './items-controller.js';
import subscribeController from './subscribe-controller.js';

import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cookieParser());
app.use(express.static('./dist'));
app.use(express.json());

app.post('/api/v1/signup', authController.signup);

app.get('/api/v1/session', authController.checkSession);
app.post('/api/v1/session', authController.createSession);
app.delete('/api/v1/session', authController.endSession);

app.use('/api/v1/users', userController);

app.use('/api/v1/items', itemsController);


app.post('/api/v1/subscribe', subscribeController.subscribe);

app.use((req, res, next) => {
    if (
        req.method === 'GET' &&
        !req.path.startsWith('/api') &&
        !req.path.includes('.')
    ) {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    } else {
        next();
    }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));