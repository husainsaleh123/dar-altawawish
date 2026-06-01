// ./controllers/api/products.js

import mongoose from 'mongoose';
import Product from '../../models/product.js';
import { syncProductCatalog } from '../../src/shared/productCatalogSync.js';
import { DEFAULT_PRODUCTS } from '../../src/shared/productCatalog.js';

export default {
  index,
  show
};
export {
  index,
  show
}

function buildCatalogFallbackProducts() {
  return DEFAULT_PRODUCTS
    .map((product) => ({
      ...product,
      _id: String(product?._id || '').trim(),
      catalogKey: String(product?._id || '').trim(),
      name: String(product?.name || '').trim(),
      category: String(product?.category || '').trim(),
      subcategory: product?.subcategory ? String(product.subcategory).trim() : null,
      description: String(product?.description || '').trim(),
      price: Math.max(0, Number(product?.price) || 0),
      image: String(product?.image || '').trim(),
      images: Array.isArray(product?.images) ? product.images.filter(Boolean) : [],
      countInStock: Math.max(0, Number(product?.countInStock) || 0),
      unit: product?.unit ? String(product.unit).trim() : '',
      requiresQuantitySelection: product?.requiresQuantitySelection === true,
      isBundleProduct: product?.isBundleProduct === true,
      bundleLabel: product?.bundleLabel ? String(product.bundleLabel).trim() : '',
      bundleDescription: product?.bundleDescription ? String(product.bundleDescription).trim() : '',
      bundleOptions: Array.isArray(product?.bundleOptions) ? product.bundleOptions : [],
      isActive: product?.isActive !== false
    }))
    .filter((product) => product.catalogKey && product.name && product.category)
    .sort((a, b) => a.name.localeCompare(b.name));
}

// GET /api/products
async function index(req, res) {
  let syncError = null;
  const isDatabaseConnected = mongoose.connection.readyState === 1;

  if (isDatabaseConnected) {
    try {
      await syncProductCatalog();
    } catch (error) {
      syncError = error;
      console.error('Product catalog sync failed:', error);
    }
  }

  if (isDatabaseConnected) {
    try {
      const products = await Product.find({}).sort('name').lean();
      if (products.length || !syncError) {
        return res.status(200).json(products);
      }
    } catch (dbError) {
      if (!syncError) {
        return res.status(400).json({ msg: dbError.message });
      }

      console.error('Product database lookup failed after sync error:', dbError);
    }
  }

  return res.status(200).json(buildCatalogFallbackProducts());
}

async function show(req, res) {
  try{
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  }catch(e){
    res.status(400).json({ msg: e.message });
  }  
}
