// ./controllers/api/users.js

import User from '../../models/user.js';
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
      console.log('you got a database problem')
      res.status(400).json(e)
    }
  },
  async login (req, res, next) {
    try {
      const user = await User.findOne({ email: req.body.email })
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
