// ./routes/api/products.js

import express from 'express';
import { dataController, apiController } from '../../controllers/api/products.js';

const router = express.Router();

// GET /api/products - List all products
router.get('/', dataController.index, apiController.index);

// GET /api/products/:id - Get single product
router.get('/:id', dataController.show, apiController.show);

// POST /api/products - Create new product
router.post('/', dataController.create, apiController.create);

// PUT /api/products/:id - Update product
router.put('/:id', dataController.update, apiController.update);

// DELETE /api/products/:id - Delete product
router.delete('/:id', dataController.delete, apiController.delete);

export default router;