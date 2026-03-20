import express from "express";
import { index, markRead } from "../../controllers/api/adminNotifications.js";

const router = express.Router();

router.get("/", index);
router.patch("/:id/read", markRead);

export default router;
