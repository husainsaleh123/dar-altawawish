// ./models/product.js

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    catalogKey: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    name: { type: String, required: true, trim: true },

    image: { type: String, default: "" },
    images: [{ type: String }],

    category: {
      type: String,
      required: true,
      trim: true,
    },

    subcategory: { type: String, default: null, trim: true },

    price: { type: Number, required: true, min: 0 },

    description: { type: String, required: true, trim: true },

    countInStock: { type: Number, default: 0, min: 0 },

    unit: { type: String, default: "" },

    requiresQuantitySelection: { type: Boolean, default: false },

    isBundleProduct: { type: Boolean, default: false },

    bundleLabel: { type: String, default: "" },

    bundleDescription: { type: String, default: "" },

    bundleOptions: [{ type: mongoose.Schema.Types.Mixed }],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Product", productSchema);
