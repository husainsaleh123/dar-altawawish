import Product from "../../models/product.js";
import { syncProductCatalog } from "../../src/shared/productCatalogSync.js";

export {
  index,
  update,
};

async function index(req, res) {
  try {
    await syncProductCatalog();
    const products = await Product.find({}).sort("name").lean();
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
}

async function update(req, res) {
  try {
    const allowedFields = [
      "name",
      "image",
      "images",
      "category",
      "subcategory",
      "price",
      "description",
      "countInStock",
      "isActive",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    if (!Object.keys(updates).length) {
      return res.status(400).json({ msg: "No valid fields provided." });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
}
