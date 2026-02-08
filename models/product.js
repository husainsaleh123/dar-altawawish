// ./models/product.js

import mongoose from "mongoose";

const CATEGORY = Object.freeze({
  GEMSTONES: "Gemstones",
  GOLDSMITH_TOOLS: "Goldsmith Tools",
  PLASTIC_BAGS: "Plastic bags",
  WEIGHING_SCALES: "Weighing scales",
  MACHINES: "Machines",
});

const SUBCATEGORY = Object.freeze({
  // Gemstones
  NATURAL: "Natural",
  PLASTIC: "Plastic",

  // Goldsmith tools
  CRUCIBLE: "Crucible",
  FILE: "File",
  SOLDERING: "Soldering",
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    // Keep one "main" image + optional gallery
    image: { type: String, required: true },
    images: [{ type: String }],

    category: {
      type: String,
      required: true,
      enum: Object.values(CATEGORY),
    },

    // Only required for Gemstones + Goldsmith Tools; otherwise can be null
    subcategory: { type: String, default: null },

    price: { type: Number, required: true, min: 0 },

    description: { type: String, required: true },

    countInStock: { type: Number, default: 0, min: 0 },

    // Admin can hide a product without deleting it
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Basic validation to ensure subcategory matches category (optional but helpful)
productSchema.pre("validate", function (next) {
  if (this.category === CATEGORY.GEMSTONES) {
    const allowed = [SUBCATEGORY.NATURAL, SUBCATEGORY.PLASTIC];
    if (this.subcategory && !allowed.includes(this.subcategory)) {
      return next(
        new Error(`Invalid subcategory for Gemstones. Use: ${allowed.join(", ")}`)
      );
    }
  }

  if (this.category === CATEGORY.GOLDSMITH_TOOLS) {
    const allowed = [SUBCATEGORY.CRUCIBLE, SUBCATEGORY.FILE, SUBCATEGORY.SOLDERING];
    if (this.subcategory && !allowed.includes(this.subcategory)) {
      return next(
        new Error(`Invalid subcategory for Goldsmith Tools. Use: ${allowed.join(", ")}`)
      );
    }
  }

  // For categories that don’t need subcategory, normalize to null
  const noSubNeeded = [CATEGORY.PLASTIC_BAGS, CATEGORY.WEIGHING_SCALES, CATEGORY.MACHINES];
  if (noSubNeeded.includes(this.category)) {
    this.subcategory = null;
  }

  next();
});

productSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Product", productSchema);
export { CATEGORY, SUBCATEGORY };
