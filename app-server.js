// ./app-server.js

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

import checkToken from "./config/checkToken.js";
import ensureLoggedIn from "./config/ensureLoggedIn.js";
import requireAdmin from "./config/requireAdmin.js";

// Routes
import userRoutes from "./routes/api/users.js";
import productRoutes from "./routes/api/products.js";
import orderRoutes from "./routes/api/orders.js";
import adminOrdersRoutes from "./routes/api/adminOrders.js";
import contactRoutes from "./routes/api/contact.js";
// (optional later) import adminProductsRoutes from "./routes/api/adminProducts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Always attach res.locals.data
app.use((req, res, next) => {
  res.locals.data = {};
  next();
});

// Token parsing (adds req.user if token exists)
app.use(checkToken);

/**
 * API ROUTES (must be before static serving)
 */

// Public
app.use("/api/products", productRoutes);
app.use("/api/contact", contactRoutes);

// Auth / Users
app.use("/api/users", userRoutes);

// Logged-in only
app.use("/api/orders", ensureLoggedIn, orderRoutes);

// Admin only
app.use("/api/admin/orders", ensureLoggedIn, requireAdmin, adminOrdersRoutes);

// Determine which directory to serve static files from
const staticDir = process.env.NODE_ENV === "production" ? "dist" : "public";
const indexPath = process.env.NODE_ENV === "production" ? "dist/index.html" : "index.html";

// Serve static files from the appropriate directory
app.use(express.static(staticDir));

/**
 * React Router fallback:
 * Serve index.html for all non-API routes
 */
app.get("/", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.resolve(path.join(__dirname, indexPath)));
});

export default app;
