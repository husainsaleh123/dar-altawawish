// ./config/database.js

import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is missing. Check .env location and dotenv.config()");
  }

  await mongoose.connect(uri);

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
}
