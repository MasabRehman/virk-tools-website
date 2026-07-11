const categoryRepository = require('../repositories/categoryRepository');
const subcategoryRepository = require('../repositories/subcategoryRepository');
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
 * Get all non-deleted categories.
 * @returns {Promise<Array>} List of all categories.
 */
async function getAllCategories() {
  try {
    return await categoryRepository.findAll();
  } catch (error) {
    throw new Error(`Failed to retrieve categories: ${error.message}`);
  }
}

/**
 * Get active categories with their active subcategories.
 * @returns {Promise<Array>} List of active categories, each with a subcategories array.
 */
async function getActiveCategories() {
  try {
    const [categories, allSubcategories] = await Promise.all([
      categoryRepository.findActive(),
      subcategoryRepository.findActive()
    ]);

    // Group subcategories by category_id
    const subcategoriesByCatId = {};
    for (const sub of allSubcategories) {
      if (!subcategoriesByCatId[sub.category_id]) {
        subcategoriesByCatId[sub.category_id] = [];
      }
      subcategoriesByCatId[sub.category_id].push(sub);
    }

    // Map subcategories to their respective categories
    const categoriesWithSubcategories = categories.map((category) => {
      return {
        ...category,
        subcategories: subcategoriesByCatId[category.id] || [],
      };
    });

    return categoriesWithSubcategories;
  } catch (error) {
    throw new Error(`Failed to retrieve active categories: ${error.message}`);
  }
}

/**
 * Get featured categories.
 * @returns {Promise<Array>} List of featured categories.
 */
async function getFeaturedCategories() {
  try {
    return await categoryRepository.findFeatured();
  } catch (error) {
    throw new Error(`Failed to retrieve featured categories: ${error.message}`);
  }
}

/**
 * Get a category by its slug, including its subcategories.
 * @param {string} slug - The category slug.
 * @returns {Promise<Object|null>} The category with subcategories, or null if not found.
 */
async function getCategoryBySlug(slug) {
  try {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    // Fetch subcategories for this category
    const subcategories = await subcategoryRepository.findByCategoryId(category.id);

    return {
      ...category,
      subcategories,
    };
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Failed to retrieve category by slug: ${error.message}`);
  }
}

/**
 * Get a category by its ID.
 * @param {number} id - The category ID.
 * @returns {Promise<Object|null>} The category object, or null if not found.
 */
async function getCategoryById(id) {
  try {
    const category = await categoryRepository.findById(id);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
    return category;
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Failed to retrieve category: ${error.message}`);
  }
}

/**
 * Create a new category.
 * Auto-generates a slug from the name and logs the activity.
 * @param {Object} data - Category data.
 * @param {number} adminId - The ID of the admin performing the action.
 * @returns {Promise<Object>} The created category.
 */
async function createCategory(data, adminId) {
  try {
    // Auto-generate slug from name
    const slug = slugify(data.name);

    const categoryId = await categoryRepository.create({
      ...data,
      slug,
    });

    // Log admin activity
    await activityLogRepository.create({
      admin_id: adminId,
      action_type: 'CREATE_CATEGORY',
      description: `Created category "${data.name}" (ID: ${categoryId})`,
    });

    // Return the created category
    return await categoryRepository.findById(categoryId);
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Failed to create category: ${error.message}`);
  }
}

/**
 * Update an existing category.
 * Regenerates slug if the name changes and logs the activity.
 * @param {number} id - The category ID.
 * @param {Object} data - Updated category data.
 * @param {number} adminId - The ID of the admin performing the action.
 * @returns {Promise<Object>} The updated category.
 */
async function updateCategory(id, data, adminId) {
  try {
    // Verify category exists
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    // Regenerate slug if name changed
    if (data.name && data.name !== existing.name) {
      data.slug = slugify(data.name);
    }

    await categoryRepository.update(id, data);

    // Log admin activity
    await activityLogRepository.create({
      admin_id: adminId,
      action_type: 'UPDATE_CATEGORY',
      description: `Updated category "${existing.name}" (ID: ${id})`,
    });

    // Return the updated category
    return await categoryRepository.findById(id);
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Failed to update category: ${error.message}`);
  }
}

/**
 * Soft delete a category.
 * Marks the category as deleted and logs the activity.
 * @param {number} id - The category ID.
 * @param {number} adminId - The ID of the admin performing the action.
 * @returns {Promise<Object>} Result of the soft delete operation.
 */
async function deleteCategory(id, adminId) {
  try {
    // Verify category exists
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    const result = await categoryRepository.softDelete(id);

    // Log admin activity
    await activityLogRepository.create({
      admin_id: adminId,
      action_type: 'DELETE_CATEGORY',
      description: `Soft deleted category "${existing.name}" (ID: ${id})`,
    });

    return result;
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Failed to delete category: ${error.message}`);
  }
}

/**
 * Get the total count of non-deleted categories.
 * @returns {Promise<number>} The total number of categories.
 */
async function getCategoryCount() {
  try {
    return await categoryRepository.count();
  } catch (error) {
    throw new Error(`Failed to get category count: ${error.message}`);
  }
}

/**
 * Create a new subcategory.
 * @param {number} categoryId - The category ID.
 * @param {Object} data - Subcategory data.
 * @param {number} adminId - The ID of the admin.
 * @returns {Promise<Object>} The created subcategory.
 */
async function createSubcategory(categoryId, data, adminId) {
  try {
    // Make slug unique: combine name + categoryId + short timestamp
    const baseSlug = slugify(data.name);
    const slug = `${baseSlug}-c${categoryId}-${Date.now().toString(36)}`;

    const subcategoryId = await subcategoryRepository.create({
      ...data,
      category_id: categoryId,
      slug,
    });

    await activityLogRepository.create({
      admin_id: adminId,
      action_type: 'CREATE_SUBCATEGORY',
      description: `Created subcategory "${data.name}" (ID: ${subcategoryId}) under category ID ${categoryId}`,
    });

    return await subcategoryRepository.findById(subcategoryId);
  } catch (error) {
    throw new Error(`Failed to create subcategory: ${error.message}`);
  }
}

/**
 * Delete a subcategory (soft delete).
 */
async function deleteSubcategory(subcategoryId, adminId) {
  try {
    await subcategoryRepository.softDelete(subcategoryId);

    await activityLogRepository.create({
      admin_id: adminId,
      action_type: 'DELETE_SUBCATEGORY',
      description: `Deleted subcategory ID ${subcategoryId}`,
    });

    return true;
  } catch (error) {
    throw new Error(`Failed to delete subcategory: ${error.message}`);
  }
}

module.exports = {
  getAllCategories,
  getActiveCategories,
  getFeaturedCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryCount,
  createSubcategory,
  deleteSubcategory,
};
