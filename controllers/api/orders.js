// ./controllers/api/orders.js

import Order from '../../models/order.js';

export {
  createOrder,
  cart,
  addToCart,
  setProductQtyInCart,
  checkout,
  history,
  adminIndex,
  adminUpdate
};

function buildOrderNumber() {
  const stamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DAT-${stamp}-${random}`;
}

async function createOrder(req, res) {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (!items.length) {
      return res.status(400).json({ msg: "Order must include at least one item" });
    }

    const orderItems = items.map((item) => {
      const qty = Math.max(1, Number(item.qty) || 0);
      const price = Math.max(0, Number(item.price) || 0);

      return {
        product: String(item._id || item.product || ""),
        name: String(item.name || "").trim(),
        image: String(item.image || ""),
        price,
        qty,
      };
    });

    const hasInvalidItem = orderItems.some((item) => !item.product || !item.name);
    if (hasInvalidItem) {
      return res.status(400).json({ msg: "Each order item must include a product and name" });
    }

    const itemsPrice = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shippingPrice = req.body.fulfillmentMethod === "delivery" ? 1.5 : 0;
    const totalPrice = itemsPrice + shippingPrice;

    const order = await Order.create({
      orderNumber: buildOrderNumber(),
      user: req.user?._id || null,
      customer: {
        fullName: `${req.body.firstName || ""} ${req.body.lastName || ""}`.trim(),
        email: String(req.body.email || "").trim().toLowerCase(),
        phone: String(req.body.phone || "").trim(),
        company: String(req.body.company || "").trim() || null,
      },
      orderItems,
      fulfillmentMethod: req.body.fulfillmentMethod === "delivery" ? "delivery" : "pickup",
      shippingAddress:
        req.body.fulfillmentMethod === "delivery"
          ? {
              fullName: `${req.body.firstName || ""} ${req.body.lastName || ""}`.trim(),
              phone: String(req.body.phone || "").trim(),
              address1: String(req.body.address || "").trim(),
              city: String(req.body.city || "").trim(),
              country: String(req.body.country || "").trim(),
            }
          : undefined,
      paymentMethod:
        req.body.paymentMethod === "debit-card"
          ? "card"
          : req.body.paymentMethod === "benefitpay"
            ? "benefitpay"
            : "cash",
      payment: {
        provider: req.body.paymentMethod === "debit-card" ? "manual" : null,
        status: "pending",
      },
      itemsPrice,
      shippingPrice,
      taxPrice: 0,
      totalPrice,
      isPaid: false,
      customerNote: String(req.body.notes || "").trim() || null,
    });

    res.status(201).json(order);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}

// A cart is the unpaid order for a user
async function cart(req, res) {
  try{
    const cart = await Order.getCart(req.user._id);
    res.status(200).json(cart);
  }catch(e){
    res.status(400).json({ msg: e.message });
  }
}

// Add an product to the cart
async function addToCart(req, res) {
  try{
    const cart = await Order.getCart(req.user._id);
    await cart.addProductToCart(req.params.id);
    res.status(200).json(cart);
  }catch(e){
    res.status(400).json({ msg: e.message });
  }  
}

// Updates an product's qty in the cart
async function setProductQtyInCart(req, res) {
  try{
    const cart = await Order.getCart(req.user._id);
    await cart.setProductQty(req.body.productId, req.body.newQty);
    res.status(200).json(cart);
  }catch(e){
    res.status(400).json({ msg: e.message });
  }
}

// Update the cart's isPaid property to true
async function checkout(req, res) {
  try{
    const cart = await Order.getCart(req.user._id);
    cart.isPaid = true;
    await cart.save();
    res.status(200).json(cart);
  }catch(e){
    res.status(400).json({ msg: e.message });
  }  
}

// Return the logged in user's paid order history
async function history(req, res) {
  // Sort most recent orders first
  try{
    const orders = await Order
      .find({ user: req.user._id, isPaid: true })
      .sort('-updatedAt').exec();
    res.status(200).json(orders);
  }catch(e){
    res.status(400).json({ msg: e.message });
  }
}

// Admin: list all orders
async function adminIndex(req, res) {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email role')
      .sort('-createdAt')
      .exec();
    res.status(200).json(orders);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}

// Admin: update allowed order fields
async function adminUpdate(req, res) {
  try {
    const allowedFields = [
      'status',
      'isPaid',
      'isDelivered',
      'payment.status',
      'payment.transactionId',
      'deliveredAt'
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email role')
      .exec();

    if (!order) return res.status(404).json({ msg: 'Order not found' });
    res.status(200).json(order);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}
