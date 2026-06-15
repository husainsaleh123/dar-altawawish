// ./config/database.js

import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config()
mongoose.connect(process.env.MONGO_URI, {
  dbName: process.env.MONGO_DB_NAME || "dar_altawawish",
  serverSelectionTimeoutMS: 30000,
}).catch((err) => {
  console.error("Initial MongoDB connection failed:", err);
});

const db = mongoose.connection;

  db.on("connected", () => {
    console.log(`✅ Connected to MongoDB at ${db.host}:${db.port}`);
  });

  db.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });

  db.on("disconnected", () => {
    console.log("MongoDB disconnected");
  });
