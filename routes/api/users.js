// routes/api/users.js

import express from 'express';
import { checkToken, dataController, apiController } from '../../controllers/api/users.js';

const router = express.Router();

// POST /api/users/signup
router.post('/signup', dataController.create, apiController.auth);

// POST /api/users/login
router.post('/login', dataController.login, apiController.auth);

export default router;
