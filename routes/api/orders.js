// ./routes/api/orders.js

import express from 'express';
import { cart, addToCart, setProductQtyInCart, checkout, history } from '../../controllers/api/orders.js';

const router = express.Router();

// GET /api/orders/cart
router.get('/cart', cart);
// GET /api/orders/history
router.get('/history', history);
// POST /api/orders/cart/products/:id
router.post('/cart/products/:id', addToCart);
// POST /api/orders/cart/checkout
router.post('/cart/checkout', checkout);
// POST /api/orders/cart/qty
router.put('/cart/qty', setProductQtyInCart);

export default router;