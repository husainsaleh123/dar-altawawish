// ./models/order.js

import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: String, required: true },

    // Snapshot values at time of checkout
    name: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },

    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, trim: true },

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: null },

    customer: {
      fullName: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
      company: { type: String, default: null, trim: true },
    },

    orderItems: { type: [orderItemSchema], required: true },

    // Delivery or pickup
    fulfillmentMethod: {
      type: String,
      enum: ["delivery", "pickup"],
      required: true,
      default: "pickup",
    },

    pickupLocation: { type: String, default: null }, // e.g. "Manama Branch"

    // Only required for delivery
    shippingAddress: {
      fullName: {
        type: String,
        required: function () {
          return this.fulfillmentMethod === "delivery";
        },
      },
      phone: {
        type: String,
        required: function () {
          return this.fulfillmentMethod === "delivery";
        },
      },
      address1: {
        type: String,
        required: function () {
          return this.fulfillmentMethod === "delivery";
        },
      },
      address2: { type: String, default: null },
      city: {
        type: String,
        required: function () {
          return this.fulfillmentMethod === "delivery";
        },
      },
      country: {
        type: String,
        required: function () {
          return this.fulfillmentMethod === "delivery";
        },
      },
      postalCode: { type: String, default: null },
    },

    // Payment options you requested
    paymentMethod: {
      type: String,
      enum: ["card", "cash", "benefitpay"],
      required: true,
    },

    // Payment metadata (card/benefitpay will usually fill these)
    payment: {
      provider: { type: String, default: null }, // "stripe", "benefitpay", "manual"
      status: { type: String, default: "pending" }, // "pending", "paid", "failed"
      transactionId: { type: String, default: null },
      paidAt: { type: Date, default: null },
    },

    loyalty: {
      discountRate: { type: Number, default: 0, min: 0 },
      discountAmount: { type: Number, default: 0, min: 0 },
      pointsRedeemed: { type: Number, default: 0, min: 0 },
      pointsEarned: { type: Number, default: 0, min: 0 },
    },

    // Totals (store real totals, do NOT rely on virtuals)
    itemsPrice: { type: Number, required: true, min: 0, default: 0 },
    shippingPrice: { type: Number, required: true, min: 0, default: 0 },
    taxPrice: { type: Number, required: true, min: 0, default: 0 },
    totalPrice: { type: Number, required: true, min: 0, default: 0 },

    // Order status (useful for admin)
    status: {
      type: String,
      enum: ["pending", "processing", "ready", "completed", "cancelled"],
      default: "pending",
    },

    isPaid: { type: Boolean, default: false },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date, default: null },

    customerNote: { type: String, default: null },
  },
  { timestamps: true }
);

// Optional normalization so pickup doesn’t keep address
orderSchema.pre("validate", function (next) {
  if (this.fulfillmentMethod === "pickup") {
    this.shippingAddress = undefined;
    this.shippingPrice = 0;
  }
  next();
});

export default mongoose.model("Order", orderSchema);
