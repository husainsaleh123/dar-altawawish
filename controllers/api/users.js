// ./controllers/api/users.js

import User from '../../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const dataController = {
    async signup(req, res, next) {
        try {
            const user = await User.create(req.body);
            const token = createJWT(user);
            res.locals.data.user = user;
            res.locals.data.token = token;
            next();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async login(req, res, next) {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) throw new Error('User not found');
            
            const match = await bcrypt.compare(req.body.password, user.password);
            if (!match) throw new Error('Password mismatch');
            
            const token = createJWT(user);
            res.locals.data.user = user;
            res.locals.data.token = token;
            next();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

const apiController = {
    auth(req, res) {
        res.json({
            token: res.locals.data.token,
            user: res.locals.data.user
        });
    }
};

function createJWT(user) {
    return jwt.sign(
        { user },
        process.env.SECRET,
        { expiresIn: '24h' }
    );
}

export { dataController, apiController };