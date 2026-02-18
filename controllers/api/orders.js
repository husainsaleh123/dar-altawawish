// ./controllers/api/orders.js

import Order from '../../models/order.js';

export {
  cart,
  addToCart,
  setProductQtyInCart,
  checkout,
  history,
  adminIndex,
  adminUpdate
};

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
