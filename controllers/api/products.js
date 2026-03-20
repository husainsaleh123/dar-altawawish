// ./controllers/api/products.js

import Product from '../../models/product.js';
import { syncProductCatalog } from '../../src/shared/productCatalogSync.js';

export default {
  index,
  show
};
export {
  index,
  show
}

// GET /api/products
async function index(req, res) {
  try{
    await syncProductCatalog();
    const products = await Product.find({}).sort('name').lean();
    res.status(200).json(products);
  }catch(e){
    res.status(400).json({ msg: e.message });
  }
}

async function show(req, res) {
  try{
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  }catch(e){
    res.status(400).json({ msg: e.message });
  }  
}
