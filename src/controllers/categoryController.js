const categoryService = require('../services/categoryService');
const cache = require('../utils/cache');

// ─── Public Methods ──────────────────────────────────────────────

/**
 * Get all active categories.
 */
const getAll = async (req, res, next) => {
  try {
    const cacheKey = 'categories_active';
    let categories = cache.get(cacheKey);

    if (!categories) {
      categories = await categoryService.getActiveCategories();
      cache.set(cacheKey, categories, 300); // cache for 5 minutes
    }

    return res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured categories.
 */
const getFeatured = async (req, res, next) => {
  try {
    const cacheKey = 'categories_featured';
    let categories = cache.get(cacheKey);

    if (!categories) {
      categories = await categoryService.getFeaturedCategories();
      cache.set(cacheKey, categories, 300); // cache for 5 minutes
    }

    return res.status(200).json({
      success: true,
      message: 'Featured categories retrieved successfully',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single category by its slug.
 */
const getBySlug = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Admin Methods ───────────────────────────────────────────────

/**
 * Get all categories including inactive ones (admin).
 */
const adminGetAll = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();

    return res.status(200).json({
      success: true,
      message: 'All categories retrieved successfully',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single category by ID (admin).
 */
const getById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new category (admin).
 */
const create = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(
      req.body,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing category (admin).
 */
const update = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(
      req.params.id,
      req.body,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a category (admin).
 */
const remove = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new subcategory (admin).
 */
const createSubcategory = async (req, res, next) => {
  try {
    const subcategory = await categoryService.createSubcategory(
      req.params.id,
      req.body,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: 'Subcategory created successfully',
      data: subcategory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get subcategories for a category (admin).
 */
const getSubcategories = async (req, res, next) => {
  try {
    const subcategories = await require('../repositories/subcategoryRepository').findByCategoryId(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Subcategories retrieved successfully',
      data: subcategories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a subcategory (admin).
 */
const deleteSubcategory = async (req, res, next) => {
  try {
    await categoryService.deleteSubcategory(req.params.subId, req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Subcategory deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getFeatured,
  getBySlug,
  adminGetAll,
  getById,
  create,
  update,
  remove,
  createSubcategory,
  getSubcategories,
  deleteSubcategory,
};
