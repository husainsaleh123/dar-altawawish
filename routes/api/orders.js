// ./routes/api/orders.js

import express from 'express';
import ensureLoggedIn from '../../config/ensureLoggedIn.js';
import { createOrder, handleApsReturn, cart, addToCart, setProductQtyInCart, checkout, show, history } from '../../controllers/api/orders.js';

const router = express.Router();

// POST /api/orders
router.post('/', createOrder);
// GET/POST /api/orders/aps/return
router.all('/aps/return', handleApsReturn);
// GET /api/orders/cart
router.get('/cart', ensureLoggedIn, cart);
// GET /api/orders/history
router.get('/history', ensureLoggedIn, history);
// GET /api/orders/:id
router.get('/:id', ensureLoggedIn, show);
// POST /api/orders/cart/products/:id
router.post('/cart/products/:id', ensureLoggedIn, addToCart);
// POST /api/orders/cart/checkout
router.post('/cart/checkout', ensureLoggedIn, checkout);
// POST /api/orders/cart/qty
router.put('/cart/qty', ensureLoggedIn, setProductQtyInCart);

export default router;
