// ./routes/api/adminOrders.js

import express from "express";
import { dataController, apiController } from "../../controllers/api/orders.js";

import checkToken from "../../config/checkToken.js";
import ensureLoggedIn from "../../config/ensureLoggedIn.js";
import requireAdmin from "../../config/requireAdmin.js";

const router = express.Router();

// Admin only
router.use(checkToken, ensureLoggedIn, requireAdmin);

router.get("/", dataController.adminIndex, apiController.adminIndex);
router.patch("/:id", dataController.adminUpdate, apiController.adminUpdate);

export default router;
