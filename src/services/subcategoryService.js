const subcategoryRepository = require('../repositories/subcategoryRepository');
const categoryRepository = require('../repositories/categoryRepository');
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
 * Get all non-deleted subcategories.
 * @returns {Promise<Array>} List of all subcategories.
 */
async function getAllSubcategories() {
  try {
    return await subcategoryRepository.findAll();
  } catch (error) {
    throw new Error(`Failed to retrieve subcategories: ${error.message}`);
  }
}

/**
 * Get subcategories by parent category ID.
 * @param {number} categoryId - The parent category ID.
 * @returns {Promise<Array>} List of subcategories for the given category.
 */
async function getSubcategoriesByCategoryId(categoryId) {
  try {
    return await subcategoryRepository.findByCategoryId(categoryId);
  } catch (error) {
    throw new Error(`Failed to retrieve subcategories for category ${categoryId}: ${error.message}`);
  }
}

/**
 * Get a subcategory by its ID.
 * @param {number} id - The subcategory ID.
 * @returns {Promise<Object>} The subcategory object.
 */
async function getSubcategoryById(id) {
  try {
    const subcategory = await subcategoryRepository.findById(id);
    if (!subcategory) {
      const error = new Error('Subcategory not found');
      error.statusCode = 404;
      throw error;
    }
    return subcategory;
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Failed to retrieve subcategory: ${error.message}`);
  }
}

/**
 * Create a new subcategory.
 * Verifies the parent category exists, auto-generates slug, and logs the activity.
 * @param {Object} data - Subcategory data (must include category_id and name).
 * @param {number} adminId - The ID of the admin performing the action.
 * @returns {Promise<Object>} The created subcategory.
 */
async function createSubcategory(data, adminId) {
  try {
    // Verify parent category exists
    const parentCategory = await categoryRepository.findById(data.category_id);
    if (!parentCategory) {
      const error = new Error('Parent category not found');
      error.statusCode = 404;
      throw error;
    }

    // Auto-generate slug from name
    const slug = slugify(data.name);

    const subcategoryId = await subcategoryRepository.create({
      ...data,
      slug,
    });

    // Log admin activity
    await activityLogRepository.create({
      admin_id: adminId,
      action_type: 'CREATE_SUBCATEGORY',
      description: `Created subcategory "${data.name}" (ID: ${subcategoryId}) under category "${parentCategory.name}"`,
    });

    // Return the created subcategory
    return await subcategoryRepository.findById(subcategoryId);
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Failed to create subcategory: ${error.message}`);
  }
}

/**
 * Update an existing subcategory.
 * Regenerates slug if the name changes and logs the activity.
 * @param {number} id - The subcategory ID.
 * @param {Object} data - Updated subcategory data.
 * @param {number} adminId - The ID of the admin performing the action.
 * @returns {Promise<Object>} The updated subcategory.
 */
async function updateSubcategory(id, data, adminId) {
  try {
    // Verify subcategory exists
    const existing = await subcategoryRepository.findById(id);
    if (!existing) {
      const error = new Error('Subcategory not found');
      error.statusCode = 404;
      throw error;
    }

    // Regenerate slug if name changed
    if (data.name && data.name !== existing.name) {
      data.slug = slugify(data.name);
    }

    await subcategoryRepository.update(id, data);

    // Log admin activity
    await activityLogRepository.create({
      admin_id: adminId,
      action_type: 'UPDATE_SUBCATEGORY',
      description: `Updated subcategory "${existing.name}" (ID: ${id})`,
    });

    // Return the updated subcategory
    return await subcategoryRepository.findById(id);
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Failed to update subcategory: ${error.message}`);
  }
}

/**
 * Soft delete a subcategory.
 * Marks the subcategory as deleted and logs the activity.
 * @param {number} id - The subcategory ID.
 * @param {number} adminId - The ID of the admin performing the action.
 * @returns {Promise<Object>} Result of the soft delete operation.
 */
async function deleteSubcategory(id, adminId) {
  try {
    // Verify subcategory exists
    const existing = await subcategoryRepository.findById(id);
    if (!existing) {
      const error = new Error('Subcategory not found');
      error.statusCode = 404;
      throw error;
    }

    const result = await subcategoryRepository.softDelete(id);

    // Log admin activity
    await activityLogRepository.create({
      admin_id: adminId,
      action_type: 'DELETE_SUBCATEGORY',
      description: `Soft deleted subcategory "${existing.name}" (ID: ${id})`,
    });

    return result;
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Failed to delete subcategory: ${error.message}`);
  }
}

module.exports = {
  getAllSubcategories,
  getSubcategoriesByCategoryId,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
};
