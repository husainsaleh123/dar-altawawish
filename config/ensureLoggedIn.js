// config/ensureLoggedIn.js

import User from "../models/user.js";

export default async function ensureLoggedIn(req, res, next) {
    if (!req.user?._id) {
        return res.status(401).json({ error: "Your session is no longer valid. Please log in again." });
    }

    try {
        const user = await User.findById(req.user._id).select("-password").lean();
        if (!user) {
            req.user = null;
            return res.status(401).json({ error: "This account no longer exists." });
        }

        // Always use current database data, never the potentially stale JWT snapshot.
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
}
