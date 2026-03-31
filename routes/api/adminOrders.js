// ./routes/api/adminOrders.js

import express from "express";
import { adminDelete, adminIndex, adminUpdate } from "../../controllers/api/orders.js";

import checkToken from "../../config/checkToken.js";
import ensureLoggedIn from "../../config/ensureLoggedIn.js";
import requireAdmin from "../../config/requireAdmin.js";

const router = express.Router();

// Admin only
router.use(checkToken, ensureLoggedIn, requireAdmin);

router.get("/", adminIndex);
router.patch("/:id", adminUpdate);
router.delete("/:id", adminDelete);

export default router;
