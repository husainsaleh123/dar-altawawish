// ./controllers/api/users.js

import User from '../../models/user.js';
import Order from '../../models/order.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dns from 'dns/promises';

const checkToken = (req, res) => {
  console.log('req.user', req.user)
  res.json(req.exp)
}

const dataController = {
  async create (req, res, next) {
    try {
      const email = String(req.body?.email || '').trim().toLowerCase();

      if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: 'Enter a valid email address.' });
      }

      const hasValidEmailDomain = await hasResolvableEmailDomain(email);
      if (!hasValidEmailDomain) {
        return res.status(400).json({ error: 'Email domain could not be verified. Please use a real email address.' });
      }

      req.body.email = email;
      const user = await User.create(req.body)
      console.log(req.body)
      // token will be a string
      const token = createJWT(user)
      // send back the token as a string
      // which we need to account for
      // in the client
      res.locals.data.user = user
      res.locals.data.token = token
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

      let user = await User.findOne({
        $or: [{ googleId }, { email }]
      });

      if (!user) {
        user = await User.create({
          name,
          email,
          password: crypto.randomBytes(24).toString('hex'),
          authProvider: 'google',
          googleId,
          countryCode: sanitizedCountryCode,
          phone: sanitizedPhone
        });
      } else {
        if (user.googleId && user.googleId !== googleId) {
          return res.status(400).json({ error: 'Google account mismatch for this email.' });
        }

        user.googleId = googleId;
        if (name) user.name = name;
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

async function hasResolvableEmailDomain(email) {
  const domain = String(email || '').split('@')[1];
  if (!domain) return false;

  try {
    const mxRecords = await dns.resolveMx(domain);
    if (Array.isArray(mxRecords) && mxRecords.length > 0) return true;
  } catch {
    // fall through to A/AAAA lookup
  }

  try {
    const addresses = await dns.resolve4(domain);
    if (Array.isArray(addresses) && addresses.length > 0) return true;
  } catch {
    // ignore
  }

  try {
    const addresses = await dns.resolve6(domain);
    return Array.isArray(addresses) && addresses.length > 0;
  } catch {
    return false;
  }
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
