// ./controllers/api/orders.js

import Order from '../../models/order.js';
import User from '../../models/user.js';
import { buildApsHostedCheckoutPayload, checkApsPaymentStatus, getApsHostedCheckoutUrl, getAppBaseUrl, isApsConfigured, verifyApsResponseSignature } from '../../config/aps.js';

export {
  createOrder,
  handleApsReturn,
  cart,
  addToCart,
  setProductQtyInCart,
  checkout,
  show,
  history,
  adminIndex,
  adminUpdate,
  adminDelete
};

function buildOrderNumber() {
  const stamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DAT-${stamp}-${random}`;
}

function roundCurrency(value) {
  return Math.round((Number(value) || 0) * 1000) / 1000;
}

const DELIVERY_FEE = 1.5;
const FREE_DELIVERY_THRESHOLD = 20;

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
    const qualifiesForFreeDelivery = itemsPrice > FREE_DELIVERY_THRESHOLD;
    const shippingPrice =
      req.body.fulfillmentMethod === "delivery" && !qualifiesForFreeDelivery ? DELIVERY_FEE : 0;
    const user = req.user?._id ? await User.findById(req.user._id) : null;
    const canRedeemDiscount = Boolean(user && user.points >= 100);
    const loyaltyDiscountRate = canRedeemDiscount ? 0.1 : 0;
    const loyaltyDiscountAmount = canRedeemDiscount ? roundCurrency(itemsPrice * loyaltyDiscountRate) : 0;
    const totalPrice = roundCurrency(itemsPrice + shippingPrice - loyaltyDiscountAmount);
    const pointsRedeemed = canRedeemDiscount ? 100 : 0;
    const pointsEarned = user ? Math.floor(Math.max(itemsPrice - loyaltyDiscountAmount, 0)) : 0;
    const isApsCardPayment = req.body.paymentMethod === "debit-card";

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
        isApsCardPayment
          ? "card"
          : req.body.paymentMethod === "benefitpay"
            ? "benefitpay"
            : "cash",
      payment: {
        provider: isApsCardPayment ? "aps" : null,
        status: "pending",
      },
      loyalty: {
        discountRate: loyaltyDiscountRate,
        discountAmount: loyaltyDiscountAmount,
        pointsRedeemed,
        pointsEarned,
      },
      itemsPrice,
      shippingPrice,
      taxPrice: 0,
      totalPrice,
      isPaid: false,
      customerNote: String(req.body.notes || "").trim() || null,
    });

    if (user && !isApsCardPayment) {
      user.points = Math.max(0, (Number(user.points) || 0) - pointsRedeemed) + pointsEarned;
      await user.save();
    }

    if (isApsCardPayment) {
      if (!isApsConfigured()) {
        await Order.findByIdAndDelete(order._id);
        return res.status(400).json({ msg: "Amazon Payment Services is not configured yet." });
      }

      const baseUrl = getAppBaseUrl(req);
      const returnUrl = `${baseUrl}/api/orders/aps/return`;
      let apsPayload;

      try {
        apsPayload = buildApsHostedCheckoutPayload({
          merchantReference: order.orderNumber,
          amount: convertToMinorUnits(order.totalPrice, 'BHD'),
          currency: 'BHD',
          customerEmail: String(req.body.email || '').trim().toLowerCase(),
          customerName: `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim(),
          phoneNumber: String(req.body.phone || '').trim(),
          returnUrl,
          orderDescription: `Order ${order.orderNumber}`,
          orderId: String(order._id),
          orderNumber: String(order.orderNumber)
        });
      } catch (error) {
        await Order.findByIdAndDelete(order._id);
        throw error;
      }

      await order.save();

      return res.status(201).json({
        order,
        requiresRedirect: true,
        paymentRedirectUrl: getApsHostedCheckoutUrl(),
        paymentRedirectMethod: 'POST',
        paymentRedirectFields: apsPayload
      });
    }

    res.status(201).json({
      order,
      requiresRedirect: false
    });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}

async function handleApsReturn(req, res) {
  try {
    const apsParams = {
      ...(req.query || {}),
      ...(req.body || {})
    };
    const merchantReference = String(apsParams.merchant_reference || '').trim();

    if (!merchantReference) {
      return redirectToCheckoutResult(res, { success: false, message: 'Missing APS merchant reference.' });
    }

    const order = await Order.findOne({ orderNumber: merchantReference });
    if (!order) {
      return redirectToCheckoutResult(res, { success: false, message: 'Order not found.' });
    }

    if (order.payment?.provider !== 'aps') {
      return redirectToCheckoutResult(res, { success: false, message: 'This order is not using Amazon Payment Services.', order });
    }

    const hasValidSignature = verifyApsResponseSignature(apsParams);

    if (order.isPaid) {
      return redirectToCheckoutResult(res, { success: true, order });
    }

    const statusResponse = await checkApsPaymentStatus({
      merchantReference,
      fortId: String(apsParams.fort_id || '').trim()
    });
    const isPaid = isApsPaymentSuccessful(apsParams) || isApsPaymentSuccessful(statusResponse);

    order.payment.transactionId = String(statusResponse?.fort_id || apsParams.fort_id || '');
    order.payment.status = isPaid
      ? hasValidSignature ? 'paid' : 'paid_signature_unverified'
      : String(statusResponse?.response_message || 'failed').toLowerCase();
    order.payment.paidAt = isPaid ? new Date() : null;
    order.isPaid = isPaid;

    if (!isPaid) {
      await order.save();
      return redirectToCheckoutResult(res, {
        success: false,
        message: statusResponse?.response_message || 'Payment was not completed.',
        order
      });
    }

    const user = order.user ? await User.findById(order.user) : null;
    if (user) {
      applyLoyaltyToUser(user, order);
      await user.save();
    }

    await order.save();
    return redirectToCheckoutResult(res, {
      success: true,
      order,
      message: hasValidSignature ? '' : 'Payment confirmed by APS status check.'
    });
  } catch (e) {
    return redirectToCheckoutResult(res, { success: false, message: e.message || 'APS payment verification failed.' });
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

async function show(req, res) {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).lean();

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (e) {
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

async function adminDelete(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    if (order.user) {
      const user = await User.findById(order.user);
      if (user) {
        rollbackLoyaltyForDeletedOrder(user, order);
        await user.save();
      }
    }

    await order.deleteOne();

    res.status(200).json({
      message: 'Order deleted successfully.'
    });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}

function applyLoyaltyToUser(user, order) {
  if (!user || !order || order.isPaid !== true) return;

  const currentPoints = Number(user.points) || 0;
  const pointsRedeemed = Number(order.loyalty?.pointsRedeemed) || 0;
  const pointsEarned = Number(order.loyalty?.pointsEarned) || 0;

  user.points = Math.max(0, currentPoints - pointsRedeemed) + pointsEarned;
}

function rollbackLoyaltyForDeletedOrder(user, order) {
  if (!user || !order) return;

  const currentPoints = Number(user.points) || 0;
  const pointsRedeemed = Number(order.loyalty?.pointsRedeemed) || 0;
  const pointsEarned = Number(order.loyalty?.pointsEarned) || 0;
  const shouldRollbackEarned = order.isPaid || order.paymentMethod === 'cash';

  user.points = currentPoints + pointsRedeemed - (shouldRollbackEarned ? pointsEarned : 0);
  user.points = Math.max(0, user.points);
}

function convertToMinorUnits(amount, currency) {
  const numericAmount = Number(amount) || 0;
  const multiplier = currency === 'BHD' ? 1000 : 100;
  return Math.round(numericAmount * multiplier);
}

function redirectToCheckoutResult(res, { success, message = '', order = null }) {
  const params = new URLSearchParams({
    success: success ? '1' : '0'
  });

  if (message) params.set('message', message);
  if (order?._id) params.set('orderId', String(order._id));
  if (order?.orderNumber) params.set('orderNumber', String(order.orderNumber));
  if (order?.totalPrice !== undefined) params.set('total', String(order.totalPrice));

  return res.redirect(`/checkout/aps-return?${params.toString()}`);
}

function isApsPaymentSuccessful(payload) {
  const responseCode = String(payload?.response_code || '').trim();
  const status = String(payload?.status || '').trim();
  const responseMessage = String(payload?.response_message || payload?.status_message || '').trim().toLowerCase();

  return responseCode.startsWith('14')
    || status === '14'
    || status === '20'
    || responseMessage === 'success'
    || responseMessage.includes('successfully')
    || responseMessage.includes('successful');
}
