// ./controllers/api/products.js

import Product from "../../models/product.js";

/**
 * Helpers
 */
function parseIntSafe(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

const dataController = {
  /**
   * PUBLIC
   * GET /api/products
   * Query:
   * - category=Gemstones
   * - subcategory=Natural
   * - q=searchTerm
   * - sort=price|createdAt|name
   * - order=asc|desc
   * - page=1
   * - limit=12
   *
   * Admin could optionally pass ?includeInactive=true if you want
   * (still should be behind admin middleware if you expose it)
   */
  async index(req, res, next) {
    try {
      const {
        category,
        subcategory,
        q,
        sort = "createdAt",
        order = "desc",
        includeInactive,
      } = req.query;

      const page = Math.max(1, parseIntSafe(req.query.page, 1));
      const limit = Math.min(100, Math.max(1, parseIntSafe(req.query.limit, 12)));
      const skip = (page - 1) * limit;

      // Public listing: only active products
      const filter = {};
      const shouldIncludeInactive = includeInactive === "true";
      if (!shouldIncludeInactive) filter.isActive = true;

      if (category) filter.category = category;
      if (subcategory) filter.subcategory = subcategory;

      if (q) {
        // Simple text search using regex
        filter.$or = [
          { name: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
        ];
      }

      // Sorting
      const sortFieldAllowlist = new Set(["price", "createdAt", "name"]);
      const sortField = sortFieldAllowlist.has(sort) ? sort : "createdAt";
      const sortDir = order === "asc" ? 1 : -1;

      const [products, total] = await Promise.all([
        Product.find(filter)
          .sort({ [sortField]: sortDir })
          .skip(skip)
          .limit(limit),
        Product.countDocuments(filter),
      ]);

      res.locals.data = res.locals.data || {};
      res.locals.data.products = products;
      res.locals.data.pagination = {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
      next();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * PUBLIC
   * GET /api/products/:id
   */
  async show(req, res, next) {
    try {
      const found = await Product.findById(req.params.id);

      if (!found) return res.status(404).json({ error: "Product not found" });

      // If product is inactive, customers shouldn't see it.
      // (Admin can still view via admin routes if you want.)
      if (!found.isActive) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.locals.data = res.locals.data || {};
      res.locals.data.product = found;
      next();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * ADMIN ONLY
   * POST /api/admin/products  (or /api/products if you gate it)
   */
  async create(req, res, next) {
    try {
      const created = await Product.create(req.body);

      res.locals.data = res.locals.data || {};
      res.locals.data.product = created;
      next();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * ADMIN ONLY
   * PUT /api/admin/products/:id
   */
  async update(req, res, next) {
    try {
      const updated = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!updated) return res.status(404).json({ error: "Product not found" });

      res.locals.data = res.locals.data || {};
      res.locals.data.product = updated;
      next();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * ADMIN ONLY
   * DELETE /api/admin/products/:id
   * Prefer "soft delete" by setting isActive=false
   */
  async delete(req, res, next) {
    try {
      const deleted = await Product.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Product not found" });

      res.locals.data = res.locals.data || {};
      res.locals.data.product = deleted;
      next();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * ADMIN ONLY (recommended instead of delete)
   * PATCH /api/admin/products/:id/deactivate
   */
  async deactivate(req, res, next) {
    try {
      const updated = await Product.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true, runValidators: true }
      );

      if (!updated) return res.status(404).json({ error: "Product not found" });

      res.locals.data = res.locals.data || {};
      res.locals.data.product = updated;
      next();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * ADMIN ONLY
   * PATCH /api/admin/products/:id/activate
   */
  async activate(req, res, next) {
    try {
      const updated = await Product.findByIdAndUpdate(
        req.params.id,
        { isActive: true },
        { new: true, runValidators: true }
      );

      if (!updated) return res.status(404).json({ error: "Product not found" });

      res.locals.data = res.locals.data || {};
      res.locals.data.product = updated;
      next();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};

const apiController = {
  index(req, res) {
    // include pagination meta so frontend can render pages
    res.json({
      products: res.locals.data.products,
      pagination: res.locals.data.pagination,
    });
  },

  show(req, res) {
    res.json(res.locals.data.product);
  },

  create(req, res) {
    res.status(201).json(res.locals.data.product);
  },

  update(req, res) {
    res.json(res.locals.data.product);
  },

  delete(req, res) {
    res.json({ message: "Product deleted successfully" });
  },

  activate(req, res) {
    res.json(res.locals.data.product);
  },

  deactivate(req, res) {
    res.json(res.locals.data.product);
  },
};

export { dataController, apiController };
