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
    unit: product?.unit ? String(product.unit).trim() : "",
    requiresQuantitySelection: product?.requiresQuantitySelection === true,
    isBundleProduct: product?.isBundleProduct === true,
    bundleLabel: product?.bundleLabel ? String(product.bundleLabel).trim() : "",
    bundleDescription: product?.bundleDescription ? String(product.bundleDescription).trim() : "",
    bundleOptions: Array.isArray(product?.bundleOptions) ? product.bundleOptions : [],
    isActive: product?.isActive !== false,
  };
}

export async function syncProductCatalog() {
  const normalizedProducts = DEFAULT_PRODUCTS
    .map(normalizeCatalogProduct)
    .filter((product) => product.catalogKey && product.name && product.category);

  const operations = normalizedProducts
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
            unit: product.unit,
            requiresQuantitySelection: product.requiresQuantitySelection,
            isBundleProduct: product.isBundleProduct,
            bundleLabel: product.bundleLabel,
            bundleDescription: product.bundleDescription,
            bundleOptions: product.bundleOptions,
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

  const activeCatalogKeys = normalizedProducts.map((product) => product.catalogKey);

  if (!operations.length) return;
  await Product.bulkWrite(operations, { ordered: false });
  await Product.updateMany(
    {
      catalogKey: { $in: activeCatalogKeys },
      countInStock: 0,
    },
    { $set: { countInStock: 20 } }
  );
  await Product.deleteMany({
    catalogKey: { $exists: true, $nin: activeCatalogKeys },
  });
}
