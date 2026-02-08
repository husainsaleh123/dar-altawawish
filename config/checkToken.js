// config/checkToken.js

import jwt from 'jsonwebtoken';

export default (req, res, next) => {
    let token = req.get('Authorization');
    
    if (token) {
        token = token.split(' ')[1];
        
        try {
            const decoded = jwt.verify(token, process.env.SECRET);
            req.user = decoded.user;
            req.exp = new Date(decoded.exp * 1000);
        } catch (err) {
            req.user = null;
            req.exp = null;
        }
        next();
    } else {
        req.user = null;
        req.exp = null;
        next();
    }
};