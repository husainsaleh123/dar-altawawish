// config/ensureLoggedIn.js

export default function ensureLoggedIn(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ msg: "Unauthorized You Shall Not Pass" });
    }
    next();
}