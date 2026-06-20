// routes/api/users.js

import express from 'express';
import ensureLoggedIn from '../../config/ensureLoggedIn.js';
import { checkToken, dataController, apiController } from '../../controllers/api/users.js';

const router = express.Router();

// POST /api/users/signup
router.post('/signup', dataController.create, apiController.registrationPending);

// POST /api/users/signup/verify
router.post('/signup/verify', dataController.verifyRegistration, apiController.auth);

// POST /api/users/signup/resend
router.post('/signup/resend', dataController.resendRegistrationCode, apiController.registrationPending);

// POST /api/users/login
router.post('/login', dataController.login, apiController.auth);

// POST /api/users/google
router.post('/google', dataController.googleAuth, apiController.registrationPending);

// POST /api/users/google/login
router.post('/google/login', dataController.googleLogin, apiController.auth);

// GET /api/users/google/config
router.get('/google/config', dataController.googleConfig, apiController.googleConfig);

// GET /api/users/profile
router.get('/profile', ensureLoggedIn, dataController.profile, apiController.profile);

// PUT /api/users/password
router.put('/password', ensureLoggedIn, dataController.updatePassword, apiController.message);

export default router;
