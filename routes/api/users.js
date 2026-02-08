// routes/api/users.js

import express from 'express';
import { dataController, apiController } from '../../controllers/api/users.js';

const router = express.Router();

// POST /api/users/signup
router.post('/signup', dataController.signup, apiController.auth);

// POST /api/users/login
router.post('/login', dataController.login, apiController.auth);

export default router;