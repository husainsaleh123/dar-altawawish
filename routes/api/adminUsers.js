import express from "express";
import { index, update } from "../../controllers/api/adminUsers.js";

const router = express.Router();

router.get("/", index);
router.patch("/:id", update);

export default router;
