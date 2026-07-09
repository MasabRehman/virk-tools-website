const brandRepository = require('../repositories/brandRepository');
const activityLogRepository = require('../repositories/activityLogRepository');

/**
 * Slugify Helper
 * Converts text to a URL-friendly slug.
 * @param {string} text - The text to slugify.
 * @returns {string} The slugified text.
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove special characters
    .replace(/-+/g, '-')        // Collapse multiple hyphens
    .replace(/^-|-$/g, '');     // Remove leading/trailing hyphens
}

/**
 * Get all non-deleted brands.
 * @returns {Promise<Array>} List of all brands.
 */
async function getAllBrands() {
  try {
    return await brandRepository.findAll();
  } catch (error) {
    throw new Error(`Failed to retrieve brands: ${error.message}`);
  }
}

/**
 * Get active brands only.
 * @returns {Promise<Array>} List of active brands.
 */
async function getActiveBrands() {
  try {
    return await brandRepository.findActive();
  } catch (error) {
    throw new Error(`Failed to retrieve active brands: ${error.message}`);
  }
}

/**
 * Get a brand by its slug.
 * @param {string} slug - The brand slug.
 * @returns {Promise<Object>} The brand object.
 */
async function getBrandBySlug(slug) {
  try {
    const brand = await brandRepository.findBySlug(slug);
    if (!brand) {
      const error = new Error('Brand not found');
      error.statusCode = 404;
      throw error;
    }
    return brand;
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Failed to retrieve brand by slug: ${error.message}`);
  }
}

/**
 * Get a brand by its ID.
 * @param {number} id - The brand ID.
 * @returns {Promise<Object>} The brand object.
 */
async function getBrandById(id) {
  try {
    const brand = await brandRepository.findById(id);
    if (!brand) {
      const error = new Error('Brand not found');
      error.statusCode = 404;
      throw error;
    }
    return brand;
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Failed to retrieve brand: ${error.message}`);
  }
}

/**
 * Create a new brand.
 * Auto-generates slug from the name and logs the activity.
 * @param {Object} data - Brand data.
 * @param {number} adminId - The ID of the admin performing the action.
 * @returns {Promise<Object>} The created brand.
 */
async function createBrand(data, adminId) {
  try {
    // Auto-generate slug from name
    const slug = slugify(data.name);

    const brandId = await brandRepository.create({
      ...data,
      slug,
    });

    // Log admin activity
    await activityLogRepository.create({
      admin_id: adminId,
      action_type: 'CREATE_BRAND',
      description: `Created brand "${data.name}" (ID: ${brandId})`,
    });

    // Return the created brand
    return await brandRepository.findById(brandId);
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Failed to create brand: ${error.message}`);
  }
}

/**
 * Update an existing brand.
 * Regenerates slug if the name changes and logs the activity.
 * @param {number} id - The brand ID.
 * @param {Object} data - Updated brand data.
 * @param {number} adminId - The ID of the admin performing the action.
 * @returns {Promise<Object>} The updated brand.
 */
async function updateBrand(id, data, adminId) {
  try {
    // Verify brand exists
    const existing = await brandRepository.findById(id);
    if (!existing) {
      const error = new Error('Brand not found');
      error.statusCode = 404;
      throw error;
    }

    // Regenerate slug if name changed
    if (data.name && data.name !== existing.name) {
      data.slug = slugify(data.name);
    }

    await brandRepository.update(id, data);

    // Log admin activity
    await activityLogRepository.create({
      admin_id: adminId,
      action_type: 'UPDATE_BRAND',
      description: `Updated brand "${existing.name}" (ID: ${id})`,
    });

    // Return the updated brand
    return await brandRepository.findById(id);
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Failed to update brand: ${error.message}`);
  }
}

/**
 * Soft delete a brand.
 * Marks the brand as deleted and logs the activity.
 * @param {number} id - The brand ID.
 * @param {number} adminId - The ID of the admin performing the action.
 * @returns {Promise<Object>} Result of the soft delete operation.
 */
async function deleteBrand(id, adminId) {
  try {
    // Verify brand exists
    const existing = await brandRepository.findById(id);
    if (!existing) {
      const error = new Error('Brand not found');
      error.statusCode = 404;
      throw error;
    }

    const result = await brandRepository.softDelete(id);

    // Log admin activity
    await activityLogRepository.create({
      admin_id: adminId,
      action_type: 'DELETE_BRAND',
      description: `Soft deleted brand "${existing.name}" (ID: ${id})`,
    });

    return result;
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Failed to delete brand: ${error.message}`);
  }
}

/**
 * Get the total count of non-deleted brands.
 * @returns {Promise<number>} The total number of brands.
 */
async function getBrandCount() {
  try {
    return await brandRepository.count();
  } catch (error) {
    throw new Error(`Failed to get brand count: ${error.message}`);
  }
}

module.exports = {
  getAllBrands,
  getActiveBrands,
  getBrandBySlug,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  getBrandCount,
};
