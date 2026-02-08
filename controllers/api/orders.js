// ./controllers/api/orders.js

import Order from "../../models/order.js";
import Product from "../../models/product.js";

const dataController = {
  /**
   * CUSTOMER: list own orders
   * GET /api/orders
   */
  async index(req, res, next) {
    try {
      const orders = await Order.find({ user: req.user._id })
        .sort({ createdAt: -1 });

      res.locals.data = res.locals.data || {};
      res.locals.data.orders = orders;
      next();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * CUSTOMER: view one of own orders
   * GET /api/orders/:id
   */
  async show(req, res, next) {
    try {
      const order = await Order.findById(req.params.id).populate("user", "name email");

      if (!order) return res.status(404).json({ error: "Order not found" });

      // owner check (admin bypass optional)
      const isOwner = order.user?._id?.toString() === req.user._id.toString();
      const isAdmin = req.user.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: "Unauthorized to view this order" });
      }

      res.locals.data = res.locals.data || {};
      res.locals.data.order = order;
      next();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * CUSTOMER: create an order (checkout)
   * POST /api/orders
   *
   * Body expects:
   * {
   *   orderItems: [{ product: productId, qty: number }],
   *   fulfillmentMethod: "delivery" | "pickup",
   *   pickupLocation?: string,
   *   shippingAddress?: { fullName, phone, address1, address2?, city, country, postalCode? } (required for delivery),
   *   paymentMethod: "card" | "cash" | "benefitpay",
   *   customerNote?: string
   * }
   */
  async create(req, res, next) {
    try {
      const {
        orderItems,
        fulfillmentMethod,
        pickupLocation,
        shippingAddress,
        paymentMethod,
        customerNote,
      } = req.body;

      if (!Array.isArray(orderItems) || orderItems.length === 0) {
        return res.status(400).json({ error: "Order must contain at least 1 item" });
      }

      if (!["delivery", "pickup"].includes(fulfillmentMethod)) {
        return res.status(400).json({ error: "Invalid Fulfillment Method" });
      }

      if (!["Card", "Cash", "BenefitPay"].includes(paymentMethod)) {
        return res.status(400).json({ error: "Invalid Payment Method" });
      }

      // Validate delivery fields
      if (fulfillmentMethod === "delivery") {
        const requiredFields = ["fullName", "phone", "address1", "city", "country"];
        const missing = requiredFields.filter((f) => !shippingAddress?.[f]);
        if (missing.length) {
          return res.status(400).json({ error: `Missing shipping fields: ${missing.join(", ")}` });
        }
      }

      // Fetch products from DB to calculate totals + take snapshots
      const productIds = orderItems.map((i) => i.product);
      const dbProducts = await Product.find({ _id: { $in: productIds }, isActive: true });

      if (dbProducts.length !== productIds.length) {
        return res.status(400).json({ error: "One or more products are invalid or inactive" });
      }

      // Build order item snapshots + validate stock
      const builtItems = [];
      for (const item of orderItems) {
        const qty = Number(item.qty);
        if (!Number.isFinite(qty) || qty < 1) {
          return res.status(400).json({ error: "Each item must have qty >= 1" });
        }

        const p = dbProducts.find((x) => x._id.toString() === item.product.toString());
        if (!p) return res.status(400).json({ error: "Invalid product in orderItems" });

        if (p.countInStock < qty) {
          return res.status(400).json({
            error: `Not enough stock for "${p.name}". Available: ${p.countInStock}`,
          });
        }

        builtItems.push({
          product: p._id,
          name: p.name,
          image: p.image,
          price: p.price,
          qty,
        });
      }

      // Totals
      const itemsPrice = builtItems.reduce((sum, i) => sum + i.price * i.qty, 0);

      // Shipping: pickup = 0, delivery can be fixed or computed
      const shippingPrice = fulfillmentMethod === "pickup" ? 0 : 0; // change later if you want a fee
      const taxPrice = 0; // add tax logic later if needed
      const totalPrice = itemsPrice + shippingPrice + taxPrice;

      // Create order
      const order = await Order.create({
        user: req.user._id,
        orderItems: builtItems,

        fulfillmentMethod,
        pickupLocation: fulfillmentMethod === "pickup" ? (pickupLocation || "Default Pickup") : null,
        shippingAddress: fulfillmentMethod === "delivery" ? shippingAddress : undefined,

        paymentMethod,
        payment: {
          provider:
            paymentMethod === "card" ? "stripe" : paymentMethod === "benefitpay" ? "benefitpay" : "manual",
          status: paymentMethod === "cash" ? "pending" : "pending",
          transactionId: null,
          paidAt: null,
        },

        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,

        status: "pending",
        isPaid: false,

        customerNote: customerNote || null,
      });

      // Decrement stock AFTER order is created (simple approach)
      // (In high traffic, you’d want transactions; for MVP this is fine.)
      for (const item of builtItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { countInStock: -item.qty } });
      }

      res.locals.data = res.locals.data || {};
      res.locals.data.order = order;
      next();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * CUSTOMER: update limited fields on own order
   * PUT /api/orders/:id
   * Recommendation: don't allow changing items after creation.
   * Allow note / pickupLocation before processing.
   */
  async update(req, res, next) {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ error: "Order not found" });

      const isOwner = order.user.toString() === req.user._id.toString();
      const isAdmin = req.user.role === "admin";
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: "Unauthorized to modify this order" });
      }

      // Restrict what a customer can update
      const updates = {};
      const allowedCustomerFields = ["customerNote", "pickupLocation"];

      if (!isAdmin) {
        for (const key of allowedCustomerFields) {
          if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        // prevent editing after processing
        if (order.status !== "pending") {
          return res.status(400).json({ error: "Order can no longer be edited" });
        }
      } else {
        // Admin can update more if you want
        Object.assign(updates, req.body);
      }

      const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      });

      res.locals.data = res.locals.data || {};
      res.locals.data.order = updatedOrder;
      next();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * CUSTOMER: delete own order ONLY if still pending and unpaid
   * DELETE /api/orders/:id
   */
  async delete(req, res, next) {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ error: "Order not found" });

      const isOwner = order.user.toString() === req.user._id.toString();
      const isAdmin = req.user.role === "admin";
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: "Unauthorized to delete this order" });
      }

      if (!isAdmin) {
        if (order.status !== "pending" || order.isPaid) {
          return res.status(400).json({ error: "You can only cancel pending unpaid orders" });
        }
      }

      // Optional: restock on cancellation
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { countInStock: item.qty } });
      }

      await Order.findByIdAndDelete(req.params.id);

      res.locals.data = res.locals.data || {};
      res.locals.data.order = order;
      next();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * ADMIN: list all orders
   * GET /api/admin/orders
   */
  async adminIndex(req, res, next) {
    try {
      const orders = await Order.find({})
        .populate("user", "name email role")
        .sort({ createdAt: -1 });

      res.locals.data = res.locals.data || {};
      res.locals.data.orders = orders;
      next();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * ADMIN: update order status / mark paid / mark delivered
   * PATCH /api/admin/orders/:id
   * Body examples:
   * { status: "processing" }
   * { isPaid: true, payment: { status:"paid", transactionId:"...", paidAt:"..." } }
   * { isDelivered: true, deliveredAt:"..." }
   */
  async adminUpdate(req, res, next) {
    try {
      const updated = await Order.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!updated) return res.status(404).json({ error: "Order not found" });

      res.locals.data = res.locals.data || {};
      res.locals.data.order = updated;
      next();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};

const apiController = {
  index(req, res) {
    res.json(res.locals.data.orders);
  },

  show(req, res) {
    res.json(res.locals.data.order);
  },

  create(req, res) {
    res.status(201).json(res.locals.data.order);
  },

  update(req, res) {
    res.json(res.locals.data.order);
  },

  delete(req, res) {
    res.json({ message: "Order deleted successfully" });
  },

  adminIndex(req, res) {
    res.json(res.locals.data.orders);
  },

  adminUpdate(req, res) {
    res.json(res.locals.data.order);
  },
};

export { dataController, apiController };
