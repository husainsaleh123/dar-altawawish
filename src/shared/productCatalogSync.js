import Product from "../../models/product.js";
import { DEFAULT_PRODUCTS } from "./productCatalog.js";

function normalizeCatalogProduct(product) {
  return {
    catalogKey: String(product?._id || "").trim(),
    name: String(product?.name || "").trim(),
    category: String(product?.category || "").trim(),
    subcategory: product?.subcategory ? String(product.subcategory).trim() : null,
    description: String(product?.description || "").trim(),
    price: Math.max(0, Number(product?.price) || 0),
    image: String(product?.image || "").trim(),
    images: Array.isArray(product?.images) ? product.images.filter(Boolean) : [],
    countInStock: Math.max(0, Number(product?.countInStock) || 0),
    isActive: product?.isActive !== false,
  };
}

export async function syncProductCatalog() {
  const operations = DEFAULT_PRODUCTS
    .map(normalizeCatalogProduct)
    .filter((product) => product.catalogKey && product.name && product.category)
    .map((product) => ({
      updateOne: {
        filter: { catalogKey: product.catalogKey },
        update: {
          $set: {
            name: product.name,
            category: product.category,
            subcategory: product.subcategory,
            description: product.description,
            price: product.price,
            image: product.image,
            images: product.images,
          },
          $setOnInsert: {
            catalogKey: product.catalogKey,
            countInStock: product.countInStock,
            isActive: product.isActive,
          },
        },
        upsert: true,
      },
    }));

  if (!operations.length) return;
  await Product.bulkWrite(operations, { ordered: false });
}
