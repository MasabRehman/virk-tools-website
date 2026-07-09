const productService = require('../services/productService');

/**
 * Extract common filter parameters from query string.
 */
const extractFilters = (query) => {
  const filters = {};

  if (query.brand_id) filters.brand_id = query.brand_id;
  if (query.category_id) filters.category_id = query.category_id;
  if (query.subcategory_id) filters.subcategory_id = query.subcategory_id;
  if (query.availability_status)
    filters.availability_status = query.availability_status;
  if (query.price_min) filters.price_min = query.price_min;
  if (query.price_max) filters.price_max = query.price_max;
  if (query.search) filters.search = query.search;

  return filters;
};

// ─── Public Methods ──────────────────────────────────────────────

/**
 * Get all products with filtering, sorting, and pagination.
 */
const getAll = async (req, res, next) => {
  try {
    const filters = extractFilters(req.query);
    const sort = req.query.sort || 'featured';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const result = await productService.getProducts(
      filters,
      sort,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single product by its slug.
 */
const getBySlug = async (req, res, next) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured products.
 */
const getFeatured = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 8;
    const products = await productService.getFeaturedProducts(limit);

    return res.status(200).json({
      success: true,
      message: 'Featured products retrieved successfully',
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search products by query string.
 */
const search = async (req, res, next) => {
  try {
    const products = await productService.searchProducts(
      req.query.q,
      req.query.limit
    );

    return res.status(200).json({
      success: true,
      message: 'Search results retrieved successfully',
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Admin Methods ───────────────────────────────────────────────

/**
 * Get all products for admin with filtering, sorting, and pagination.
 */
const adminGetAll = async (req, res, next) => {
  try {
    const filters = extractFilters(req.query);
    const sort = req.query.sort || 'featured';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const result = await productService.getProductsAdmin(
      filters,
      sort,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single product by ID (admin).
 */
const getById = async (req, res, next) => {
  try {
    const product = await productService.getProductByIdAdmin(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new product (admin).
 */
const create = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body, req.user.id);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing product (admin).
 */
const update = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(
      req.params.id,
      req.body,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a product (admin).
 */
const remove = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getBySlug,
  getFeatured,
  search,
  adminGetAll,
  getById,
  create,
  update,
  remove,
};
