const brandService = require('../services/brandService');
const cache = require('../utils/cache');

// ─── Public Methods ──────────────────────────────────────────────

/**
 * Get all active brands.
 */
const getAll = async (req, res, next) => {
  try {
    const cacheKey = 'brands_active';
    let brands = cache.get(cacheKey);

    if (!brands) {
      brands = await brandService.getActiveBrands();
      cache.set(cacheKey, brands, 300); // cache for 5 minutes
    }

    return res.status(200).json({
      success: true,
      message: 'Brands retrieved successfully',
      data: brands,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single brand by its slug.
 */
const getBySlug = async (req, res, next) => {
  try {
    const brand = await brandService.getBrandBySlug(req.params.slug);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Brand retrieved successfully',
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Admin Methods ───────────────────────────────────────────────

/**
 * Get all brands including inactive ones (admin).
 */
const adminGetAll = async (req, res, next) => {
  try {
    const brands = await brandService.getAllBrands();

    return res.status(200).json({
      success: true,
      message: 'All brands retrieved successfully',
      data: brands,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single brand by ID (admin).
 */
const getById = async (req, res, next) => {
  try {
    const brand = await brandService.getBrandById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Brand retrieved successfully',
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new brand (admin).
 */
const create = async (req, res, next) => {
  try {
    const brand = await brandService.createBrand(req.body, req.user.id);

    return res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing brand (admin).
 */
const update = async (req, res, next) => {
  try {
    const brand = await brandService.updateBrand(
      req.params.id,
      req.body,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: 'Brand updated successfully',
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a brand (admin).
 */
const remove = async (req, res, next) => {
  try {
    await brandService.deleteBrand(req.params.id, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Brand deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getBySlug,
  adminGetAll,
  getById,
  create,
  update,
  remove,
};
