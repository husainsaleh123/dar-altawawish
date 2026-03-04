// routes/api/users.js

import express from 'express';
import { checkToken, dataController, apiController } from '../../controllers/api/users.js';

const router = express.Router();

// POST /api/users/signup
router.post('/signup', dataController.create, apiController.auth);

// POST /api/users/login
router.post('/login', dataController.login, apiController.auth);

// POST /api/users/google
router.post('/google', dataController.googleAuth, apiController.auth);

// GET /api/users/google/config
router.get('/google/config', dataController.googleConfig, apiController.googleConfig);

export default router;
