// ./models/user.js

import mongoose from "mongoose";
import bcrypt from "bcrypt";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator(value) {
          return EMAIL_REGEX.test(String(value || "").trim());
        },
        message: "Enter a valid email address.",
      },
    },

    password: { type: String, required: true, minlength: 6 },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    countryCode: {
      type: String,
      trim: true,
      default: "+973",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    points: {
      type: Number,
      default: 0,
      min: 0,
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  { timestamps: true }
);

// Hash password on create/update
userSchema.pre("save", async function () {
  if (!this.isModified("password") || this.$locals.passwordAlreadyHashed) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password (login)
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Hide password in JSON responses
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
