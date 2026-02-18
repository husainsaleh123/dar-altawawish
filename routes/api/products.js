// ./routes/api/products.js

import express from 'express';
import productsCtrl from '../../controllers/api/products.js';

const router = express.Router();

// GET /api/products
router.get('/', productsCtrl.index);
// GET /api/products/:id
router.get('/:id', productsCtrl.show);

export default router;