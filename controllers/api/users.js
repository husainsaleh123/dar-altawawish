// ./controllers/api/users.js

import User from '../../models/user.js';
import Order from '../../models/order.js';
import Notification from '../../models/notification.js';
import PendingRegistration from '../../models/pendingRegistration.js';
import { sendRegistrationCodeEmail } from '../../services/emailService.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const checkToken = (req, res) => {
  console.log('req.user', req.user)
  res.json(req.exp)
}

const dataController = {
  async create (req, res, next) {
    try {
      const email = String(req.body?.email || '').trim().toLowerCase();
      const name = String(req.body?.name || '').trim();
      const password = String(req.body?.password || '');
      const countryCode = String(req.body?.countryCode || '+973').trim() || '+973';
      const phone = String(req.body?.phone || '').trim();

      if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: 'Enter a valid email address.' });
      }

      if (!name) {
        return res.status(400).json({ error: 'Full name is required.' });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }

      const existingUser = await User.findOne({ email }).select('_id').lean();
      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      const existingPending = await PendingRegistration.findOne({ email })
        .select('resendAvailableAt')
        .lean();
      if (existingPending?.resendAvailableAt > new Date()) {
        const retryAfter = Math.ceil((existingPending.resendAvailableAt.getTime() - Date.now()) / 1000);
        return res.status(429).json({ error: `Please wait ${retryAfter} seconds before requesting another code.` });
      }

      const verificationCode = createVerificationCode();
      const passwordHash = await bcrypt.hash(password, 10);
      const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);
      const resendAvailableAt = new Date(Date.now() + RESEND_COOLDOWN_MS);

      await PendingRegistration.findOneAndUpdate(
        { email },
        {
          name,
          email,
          passwordHash,
          authProvider: 'local',
          googleId: null,
          countryCode,
          phone,
          tokenHash: crypto.randomBytes(32).toString('hex'),
          codeHash: hashVerificationCode(email, verificationCode),
          verificationAttempts: 0,
          resendAvailableAt,
          expiresAt,
        },
        { upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );

      try {
        await sendRegistrationCodeEmail({
          to: email,
          name,
          code: verificationCode
        });
      } catch (error) {
        await PendingRegistration.updateOne(
          { email, codeHash: hashVerificationCode(email, verificationCode) },
          { $set: { resendAvailableAt: new Date() } }
        );
        throw error;
      }

      res.locals.data.message = 'We sent a 4-digit verification code to your email.';
      res.locals.data.email = email;
      res.locals.data.expiresAt = expiresAt;
      res.locals.data.resendAvailableAt = resendAvailableAt;
      next()
    } catch (e) {
      const duplicateEmail = e?.code === 11000 && e?.keyPattern?.email;
      const validationMessage = Object.values(e?.errors || {})
        .map((item) => item?.message)
        .find(Boolean);

      res.status(400).json({
        error: duplicateEmail
          ? 'An account with this email already exists.'
          : validationMessage || e?.message || 'Registration failed.'
      })
    }
  },
  async verifyRegistration(req, res, next) {
    try {
      const email = String(req.body?.email || '').trim().toLowerCase();
      const code = String(req.body?.code || '').trim();

      if (!EMAIL_REGEX.test(email) || !/^\d{4}$/.test(code)) {
        return res.status(400).json({ error: 'Enter the email address and 4-digit code.' });
      }

      const pendingRegistration = await PendingRegistration.findOne({ email });
      if (!pendingRegistration) {
        return res.status(400).json({ error: 'This verification request is invalid or has expired.' });
      }
      if (pendingRegistration.expiresAt <= new Date()) {
        await PendingRegistration.deleteOne({ _id: pendingRegistration._id });
        return res.status(400).json({ error: 'This code has expired. Start registration again.' });
      }
      if (pendingRegistration.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
        return res.status(429).json({ error: 'Too many incorrect attempts. Request a new code.' });
      }

      const suppliedHash = hashVerificationCode(email, code);
      if (!safeHashEquals(pendingRegistration.codeHash, suppliedHash)) {
        pendingRegistration.verificationAttempts += 1;
        await pendingRegistration.save();
        const attemptsLeft = MAX_VERIFICATION_ATTEMPTS - pendingRegistration.verificationAttempts;
        return res.status(400).json({
          error: attemptsLeft > 0
            ? `Incorrect code. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.`
            : 'Too many incorrect attempts. Request a new code.'
        });
      }

      const existingUser = await User.findOne({ email }).select('_id').lean();
      if (existingUser) {
        await PendingRegistration.deleteOne({ _id: pendingRegistration._id });
        return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
      }

      const user = await createUserFromPendingRegistration(pendingRegistration);
      await PendingRegistration.deleteOne({ _id: pendingRegistration._id });
      await createRegistrationNotification(user);
      res.locals.data.user = user;
      res.locals.data.token = createJWT(user);
      next();
    } catch (error) {
      res.status(400).json({ error: error?.message || 'Email verification failed.' });
    }
  },
  async resendRegistrationCode(req, res, next) {
    try {
      const email = String(req.body?.email || '').trim().toLowerCase();
      if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: 'Enter a valid email address.' });
      }

      const pendingRegistration = await PendingRegistration.findOne({ email });
      if (!pendingRegistration) {
        return res.status(400).json({ error: 'Start registration again to request a new code.' });
      }
      if (pendingRegistration.resendAvailableAt > new Date()) {
        const retryAfter = Math.ceil((pendingRegistration.resendAvailableAt.getTime() - Date.now()) / 1000);
        return res.status(429).json({ error: `Please wait ${retryAfter} seconds before requesting another code.` });
      }

      const verificationCode = createVerificationCode();
      pendingRegistration.codeHash = hashVerificationCode(email, verificationCode);
      pendingRegistration.verificationAttempts = 0;
      pendingRegistration.expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);
      pendingRegistration.resendAvailableAt = new Date(Date.now() + RESEND_COOLDOWN_MS);
      await pendingRegistration.save();

      try {
        await sendRegistrationCodeEmail({ to: email, name: pendingRegistration.name, code: verificationCode });
      } catch (error) {
        pendingRegistration.resendAvailableAt = new Date();
        await pendingRegistration.save();
        throw error;
      }
      res.locals.data.message = 'A new verification code was sent.';
      res.locals.data.email = email;
      res.locals.data.expiresAt = pendingRegistration.expiresAt;
      res.locals.data.resendAvailableAt = pendingRegistration.resendAvailableAt;
      next();
    } catch (error) {
      res.status(400).json({ error: error?.message || 'Unable to resend the verification code.' });
    }
  },
  async login (req, res, next) {
    try {
      const email = String(req.body?.email || '').trim().toLowerCase();
      const user = await User.findOne({ email })
      if (!user) throw new Error()
      const match = await bcrypt.compare(req.body.password, user.password)
      if (!match) throw new Error()
      res.locals.data.user = user
      res.locals.data.token = createJWT(user)
      next()
    } catch {
      res.status(400).json('Bad Credentials')
    }
  },
  async googleAuth(req, res, next) {
    try {
      const { credential, phone = '', countryCode = '+973' } = req.body || {};
      const googleUser = await verifyGoogleCredential(credential);

      const email = String(googleUser.email || '').trim().toLowerCase();
      const name = String(googleUser.name || googleUser.given_name || '').trim();
      const googleId = String(googleUser.sub || '').trim();
      const sanitizedPhone = String(phone || '').trim();
      const sanitizedCountryCode = String(countryCode || '+973').trim() || '+973';

      if (!email || !googleId || !name) {
        return res.status(400).json({ error: 'Invalid Google profile.' });
      }

      const existingUser = await User.findOne({
        $or: [{ googleId }, { email }]
      }).select('_id').lean();
      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
      }

      const existingPending = await PendingRegistration.findOne({ email })
        .select('resendAvailableAt')
        .lean();
      if (existingPending?.resendAvailableAt > new Date()) {
        const retryAfter = Math.ceil((existingPending.resendAvailableAt.getTime() - Date.now()) / 1000);
        return res.status(429).json({ error: `Please wait ${retryAfter} seconds before requesting another code.` });
      }

      const verificationCode = createVerificationCode();
      const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);
      const resendAvailableAt = new Date(Date.now() + RESEND_COOLDOWN_MS);

      await PendingRegistration.findOneAndUpdate(
        { email },
        {
          name,
          email,
          passwordHash: null,
          authProvider: 'google',
          googleId,
          countryCode: sanitizedCountryCode,
          phone: sanitizedPhone,
          tokenHash: crypto.randomBytes(32).toString('hex'),
          codeHash: hashVerificationCode(email, verificationCode),
          verificationAttempts: 0,
          resendAvailableAt,
          expiresAt,
        },
        { upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );

      try {
        await sendRegistrationCodeEmail({ to: email, name, code: verificationCode });
      } catch (error) {
        await PendingRegistration.updateOne(
          { email, codeHash: hashVerificationCode(email, verificationCode) },
          { $set: { resendAvailableAt: new Date() } }
        );
        throw error;
      }

      res.locals.data.message = 'We sent a 4-digit verification code to your Google email.';
      res.locals.data.email = email;
      res.locals.data.expiresAt = expiresAt;
      res.locals.data.resendAvailableAt = resendAvailableAt;
      next();
    } catch (error) {
      res.status(400).json({ error: error?.message || 'Google sign-in failed.' });
    }
  },
  async googleLogin(req, res, next) {
    try {
      const { credential, phone = '', countryCode = '+973' } = req.body || {};
      const googleUser = await verifyGoogleCredential(credential);

      const email = String(googleUser.email || '').trim().toLowerCase();
      const name = String(googleUser.name || googleUser.given_name || '').trim();
      const googleId = String(googleUser.sub || '').trim();
      const sanitizedPhone = String(phone || '').trim();
      const sanitizedCountryCode = String(countryCode || '+973').trim() || '+973';

      if (!email || !googleId || !name) {
        return res.status(400).json({ error: 'Invalid Google profile.' });
      }

      const user = await User.findOne({
        $or: [{ googleId }, { email }]
      });

      if (!user) {
        return res.status(400).json({ error: 'No account exists for this Google email. Please sign up first.' });
      } else if (user.googleId && user.googleId !== googleId) {
        return res.status(400).json({ error: 'Google account mismatch for this email.' });
      } else {
        user.googleId = googleId;
        if (name && !user.name) user.name = name;
        if (sanitizedPhone) user.phone = sanitizedPhone;
        if (sanitizedPhone || user.countryCode) user.countryCode = sanitizedCountryCode;
        await user.save();
      }

      res.locals.data.user = user;
      res.locals.data.token = createJWT(user);
      next();
    } catch (error) {
      res.status(400).json({ error: error?.message || 'Google sign-in failed.' });
    }
  },
  googleConfig(req, res, next) {
    res.locals.data.googleClientId = process.env.GOOGLE_CLIENT_ID || '';
    next();
  },
  async profile(req, res, next) {
    try {
      const [user, orders] = await Promise.all([
        User.findById(req.user._id).select('-password').lean(),
        Order.find({ user: req.user._id })
          .sort('-createdAt')
          .select('orderNumber status totalPrice createdAt fulfillmentMethod paymentMethod isPaid isDelivered')
          .lean()
      ]);

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      res.locals.data.profile = { user, orders };
      next();
    } catch (error) {
      res.status(400).json({ error: error?.message || 'Unable to load profile.' });
    }
  },
  async updatePassword(req, res, next) {
    try {
      const { currentPassword = '', newPassword = '', confirmPassword = '' } = req.body || {};

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New password and confirmation do not match.' });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      if (user.authProvider !== 'local') {
        return res.status(400).json({ error: 'Password changes are unavailable for Google sign-in accounts.' });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }

      user.password = newPassword;
      await user.save();

      res.locals.data.message = 'Password updated successfully.';
      next();
    } catch (error) {
      res.status(400).json({ error: error?.message || 'Unable to update password.' });
    }
  }
}

const apiController = {
  auth (req, res) {
    res.json({
      token: res.locals.data.token,
      user: res.locals.data.user
    })
  },
  googleConfig(req, res) {
    res.json({
      googleClientId: res.locals.data.googleClientId || ''
    });
  },
  profile(req, res) {
    res.json(res.locals.data.profile);
  },
  registrationPending(req, res) {
    res.json({
      message: res.locals.data.message,
      email: res.locals.data.email,
      expiresAt: res.locals.data.expiresAt,
      resendAvailableAt: res.locals.data.resendAvailableAt
    });
  },
  message(req, res) {
    res.json({
      message: res.locals.data.message || 'Success'
    });
  }
}

export {
  checkToken,
  dataController,
  apiController
}

/* -- Helper Functions -- */

function createJWT (user) {
  return jwt.sign(
    // data payload
    {  user },
    process.env.SECRET,
    { expiresIn: '24h' }
  )
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_VERIFICATION_ATTEMPTS = 5;

function createVerificationCode() {
  return crypto.randomInt(0, 10000).toString().padStart(4, '0');
}

function hashVerificationCode(email, code) {
  if (!process.env.SECRET) throw new Error('Server secret is not configured.');
  return crypto
    .createHmac('sha256', process.env.SECRET)
    .update(`${String(email).trim().toLowerCase()}:${String(code).trim()}`)
    .digest('hex');
}

function safeHashEquals(expected, supplied) {
  const expectedBuffer = Buffer.from(String(expected || ''), 'hex');
  const suppliedBuffer = Buffer.from(String(supplied || ''), 'hex');
  return expectedBuffer.length === suppliedBuffer.length
    && expectedBuffer.length > 0
    && crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);
}

async function createUserFromPendingRegistration(pendingRegistration) {
  if (pendingRegistration.authProvider === 'google') {
    const user = await User.create({
      name: pendingRegistration.name,
      email: pendingRegistration.email,
      password: crypto.randomBytes(24).toString('hex'),
      countryCode: pendingRegistration.countryCode,
      phone: pendingRegistration.phone,
      authProvider: 'google',
      googleId: pendingRegistration.googleId,
    });
    return user;
  }

  if (!pendingRegistration.passwordHash) {
    throw new Error('The pending registration is missing password information.');
  }

  const user = new User({
    name: pendingRegistration.name,
    email: pendingRegistration.email,
    password: pendingRegistration.passwordHash,
    countryCode: pendingRegistration.countryCode,
    phone: pendingRegistration.phone,
    authProvider: 'local',
  });
  user.$locals.passwordAlreadyHashed = true;
  await user.save();
  return user;
}

async function verifyGoogleCredential(credential) {
  if (!credential) throw new Error('Missing Google credential.');
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Google auth is not configured on the server.');
  }

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
  );

  if (!response.ok) {
    throw new Error('Invalid Google token.');
  }

  const payload = await response.json();
  if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Google token audience mismatch.');
  }
  if (payload.email_verified !== 'true') {
    throw new Error('Google email is not verified.');
  }

  return payload;
}

async function createRegistrationNotification(user) {
  if (!user?._id) return;

  try {
    await Notification.create({
      type: "user_registered",
      title: "New user registration",
      message: `${user.name} registered with ${user.email}.`,
      entityType: "user",
      entityId: user._id,
      entityModel: "User",
      metadata: {
        email: user.email,
        role: user.role,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error("Registration notification failed:", error);
  }
}
