// ./routes/api/orders.js

import express from "express";
import { dataController, apiController } from "../../controllers/api/orders.js";

import checkToken from "../../config/checkToken.js";
import ensureLoggedIn from "../../config/ensureLoggedIn.js";

const router = express.Router();

// All order routes require login
router.use(checkToken, ensureLoggedIn);

// Customer Orders
router.get("/", dataController.index, apiController.index);
router.get("/:id", dataController.show, apiController.show);
router.post("/", dataController.create, apiController.create);
router.put("/:id", dataController.update, apiController.update);
router.delete("/:id", dataController.delete, apiController.delete);

export default router;
