const productRepository = require('../repositories/productRepository');
const productVariantRepository = require('../repositories/productVariantRepository');
const productSpecRepository = require('../repositories/productSpecRepository');
const productImageRepository = require('../repositories/productImageRepository');
const productTagRepository = require('../repositories/productTagRepository');
const supplierRepository = require('../repositories/supplierRepository');
const activityLogRepository = require('../repositories/activityLogRepository');
const { getConnection } = require('../config/database');

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
 * Generate a random alphanumeric suffix for slug collision handling.
 * @param {number} length - Length of the suffix.
 * @returns {string} Random suffix string.
 */
function generateRandomSuffix(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Assemble full product details by fetching all related data.
 * PRIVATE helper — strips supplier data for public use.
 * @param {Object} product - The base product object.
 * @param {boolean} includeSupplier - Whether to include supplier information (admin only).
 * @returns {Promise<Object>} The product with all related data assembled.
 */
async function assembleProductDetails(product, includeSupplier = false) {
  const [variants, specifications, images, tags, relatedProducts] = await Promise.all([
    productVariantRepository.findByProductId(product.id),
    productSpecRepository.findByProductId(product.id),
    productImageRepository.findByProductId(product.id),
    productTagRepository.findByProductId(product.id),
    productRepository.findRelatedProducts(product.id),
  ]);

  const assembled = {
    ...product,
    variants,
    specifications,
    images,
    tags,
    relatedProducts,
    subcategory_ids: product.subcategory_id ? [product.subcategory_id] : [],
  };

  if (includeSupplier) {
    const supplierInfo = await supplierRepository.findByProductId(product.id);
    assembled.supplierInfo = supplierInfo || null;
  }

  return assembled;
}

/**
 * Get a paginated list of published products with optional filters and sorting.
 * Public method — NO supplier data.
 * @param {Object} filters - Filter criteria (brand_id, category_id, availability_status, etc.).
 * @param {string} sort - Sort option (e.g., 'price_asc', 'price_desc', 'newest', 'featured').
 * @param {number} page - Current page number (1-indexed).
 * @param {number} limit - Number of products per page.
 * @returns {Promise<Object>} Products array and pagination metadata.
 */
async function getProducts(filters = {}, sort = 'newest', page = 1, limit = 20) {
  try {
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, Math.min(1000, parseInt(limit, 10) || 20));
    const offset = (page - 1) * limit;

    const finalFilters = {
      ...filters,
      is_published: true,
      is_disabled: false,
    };

    const products = await productRepository.findAll(finalFilters, sort, page, limit);
    const total = await productRepository.countByFilters(finalFilters, false);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Failed to retrieve products: ${error.message}`);
  }
}

/**
 * Get a product by its slug with all related data.
 * Public method — NO supplier data.
 * @param {string} slug - The product slug.
 * @returns {Promise<Object>} The full product details.
 */
async function getProductBySlug(slug) {
  try {
    const product = await productRepository.findBySlug(slug);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    return await assembleProductDetails(product, false);
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Failed to retrieve product by slug: ${error.message}`);
  }
}

/**
 * Get a product by its ID with all related data.
 * Public method — NO supplier data.
 * @param {number} id - The product ID.
 * @returns {Promise<Object>} The full product details.
 */
async function getProductById(id) {
  try {
    const product = await productRepository.findById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    return await assembleProductDetails(product, false);
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Failed to retrieve product: ${error.message}`);
  }
}

/**
 * Get a product by its ID with all related data INCLUDING supplier information.
 * Admin-only method — includes supplier data.
 * @param {number} id - The product ID.
 * @returns {Promise<Object>} The full product details with supplier info.
 */
async function getProductByIdAdmin(id) {
  try {
    const product = await productRepository.findById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    return await assembleProductDetails(product, true);
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Failed to retrieve product for admin: ${error.message}`);
  }
}

/**
 * Get featured products.
 * @param {number} limit - Maximum number of featured products to return.
 * @returns {Promise<Array>} List of featured products.
 */
async function getFeaturedProducts(limit = 8) {
  try {
    return await productRepository.findFeatured(limit);
  } catch (error) {
    throw new Error(`Failed to retrieve featured products: ${error.message}`);
  }
}

/**
 * Search products by name, SKU, or description (live autocomplete search).
 * @param {string} searchQuery - The search query string.
 * @param {number} limit - Maximum number of results.
 * @returns {Promise<Array>} List of matching products.
 */
async function searchProducts(searchQuery, limit = 10) {
  try {
    return await productRepository.search(searchQuery, limit);
  } catch (error) {
    throw new Error(`Product search failed: ${error.message}`);
  }
}

/**
 * Create a new product with all related data in a single transaction.
 * Handles slug generation with collision avoidance, variants, specs, images, tags, and supplier info.
 * @param {Object} productData - The product data including nested arrays.
 * @param {number} adminId - The ID of the admin performing the action.
 * @returns {Promise<Object>} The created product with all related data.
 */
async function createProduct(productData, adminId) {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    // 1. Auto-generate slug from name
    let slug = slugify(productData.name);

    // Check for slug collision and append random suffix if needed
    const existingProduct = await productRepository.findBySlug(slug);
    if (existingProduct) {
      slug = `${slug}-${generateRandomSuffix()}`;
    }

    // 2. Insert the product
    const productInsertData = {
      sku: productData.sku,
      name: productData.name,
      slug,
      brand_id: productData.brand_id || null,
      category_id: productData.category_id,
      selling_price: productData.selling_price,
      availability_status: productData.availability_status || 'available',
      description: productData.description || null,
      main_image_url: productData.main_image_url || null,
      is_featured: productData.is_featured || false,
      is_published: productData.is_published !== undefined ? productData.is_published : true,
      is_disabled: false,
    };

    const [productResult] = await connection.execute(
      `INSERT INTO products (sku, name, slug, brand_id, category_id, selling_price, availability_status, description, main_image_url, is_featured, is_published, is_disabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productInsertData.sku,
        productInsertData.name,
        productInsertData.slug,
        productInsertData.brand_id,
        productInsertData.category_id,
        productInsertData.selling_price,
        productInsertData.availability_status,
        productInsertData.description,
        productInsertData.main_image_url,
        productInsertData.is_featured,
        productInsertData.is_published,
        productInsertData.is_disabled,
      ]
    );

    const productId = productResult.insertId;

    // Subcategory logic is handled directly in products table using subcategory_id

    // 3. Insert variants if provided
    if (productData.variants && productData.variants.length > 0) {
      for (const variant of productData.variants) {
        await connection.execute(
          `INSERT INTO product_variants (product_id, variant_name, sku_modifier, price_modifier, is_active)
           VALUES (?, ?, ?, ?, ?)`,
          [
            productId,
            variant.variant_name,
            variant.sku_modifier || null,
            variant.price_modifier || 0,
            variant.is_active !== undefined ? variant.is_active : true,
          ]
        );
      }
    }

    // 4. Bulk insert specifications if provided
    if (productData.specifications && productData.specifications.length > 0) {
      const specValues = productData.specifications.map((spec, index) => [
        productId,
        spec.spec_key,
        spec.spec_value,
        spec.display_order !== undefined ? spec.display_order : index,
      ]);

      for (const specRow of specValues) {
        await connection.execute(
          `INSERT INTO product_specifications (product_id, spec_key, spec_value, display_order)
           VALUES (?, ?, ?, ?)`,
          specRow
        );
      }
    }

    // 5. Insert images if provided
    if (productData.images && productData.images.length > 0) {
      for (const [index, image] of productData.images.entries()) {
        await connection.execute(
          `INSERT INTO product_images (product_id, image_url, display_order)
           VALUES (?, ?, ?)`,
          [
            productId,
            image.image_url,
            image.display_order !== undefined ? image.display_order : index,
          ]
        );
      }
    }

    // 6. Bulk insert tags if provided
    if (productData.tags && productData.tags.length > 0) {
      for (const tag of productData.tags) {
        const tagName = typeof tag === 'string' ? tag : tag.tag_name;
        await connection.execute(
          `INSERT INTO product_tags (product_id, tag_name)
           VALUES (?, ?)`,
          [productId, tagName]
        );
      }
    }

    // 7. Insert supplier information if provided (admin-only data)
    if (productData.supplierInfo) {
      await connection.execute(
        `INSERT INTO supplier_information (product_id, supplier_name, supplier_contact, supplier_code, purchase_price, internal_notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          productId,
          productData.supplierInfo.supplier_name || null,
          productData.supplierInfo.supplier_contact || null,
          productData.supplierInfo.supplier_code || null,
          productData.supplierInfo.purchase_price || null,
          productData.supplierInfo.internal_notes || null,
        ]
      );
    }

    // 8. Log admin activity
    await activityLogRepository.create({
      admin_id: adminId,
      action_type: 'CREATE_PRODUCT',
      description: `Created product "${productData.name}" (ID: ${productId}, SKU: ${productData.sku})`,
    });

    // 9. Commit transaction
    await connection.commit();

    // 10. Return the created product with all related data (admin view)
    return await getProductByIdAdmin(productId);
  } catch (error) {
    // Rollback on any error
    await connection.rollback();
    throw new Error(`Failed to create product: ${error.message}`);
  } finally {
    // Always release the connection back to the pool
    connection.release();
  }
}

/**
 * Update a product and its related data in a single transaction.
 * Deletes and re-inserts specs, tags, and images if new arrays are provided.
 * @param {number} id - The product ID.
 * @param {Object} productData - The updated product data.
 * @param {number} adminId - The ID of the admin performing the action.
 * @returns {Promise<Object>} The updated product with all related data.
 */
async function updateProduct(id, productData, adminId) {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    // Verify product exists
    const existing = await productRepository.findById(id);
    if (!existing) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    // 1. Build update fields for the product table
    const allowedFields = [
      'sku', 'name', 'brand_id', 'category_id', 'subcategory_id',
      'selling_price', 'availability_status', 'description',
      'main_image_url', 'is_featured', 'is_published', 'is_disabled',
    ];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(productData)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    // Regenerate slug if name changed
    if (productData.name && productData.name !== existing.name) {
      let newSlug = slugify(productData.name);
      const slugConflict = await productRepository.findBySlug(newSlug);
      if (slugConflict && slugConflict.id !== id) {
        newSlug = `${newSlug}-${generateRandomSuffix()}`;
      }
      updates.push('slug = ?');
      values.push(newSlug);
    }

    if (updates.length > 0) {
      values.push(id);
      await connection.execute(
        `UPDATE products SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
        values
      );
    }

    // Subcategory logic is handled directly in products table using subcategory_id

    // 2. Update variants if provided
    if (productData.variants !== undefined) {
      // Delete existing variants
      await connection.execute(
        'DELETE FROM product_variants WHERE product_id = ?',
        [id]
      );

      // Re-insert new variants
      if (productData.variants && productData.variants.length > 0) {
        for (const variant of productData.variants) {
          await connection.execute(
            `INSERT INTO product_variants (product_id, variant_name, sku_modifier, price_modifier, is_active)
             VALUES (?, ?, ?, ?, ?)`,
            [
              id,
              variant.variant_name,
              variant.sku_modifier || null,
              variant.price_modifier || 0,
              variant.is_active !== undefined ? variant.is_active : true,
            ]
          );
        }
      }
    }

    // 3. Update specifications if provided
    if (productData.specifications !== undefined) {
      // Delete existing specs
      await connection.execute(
        'DELETE FROM product_specifications WHERE product_id = ?',
        [id]
      );

      // Re-insert new specs
      if (productData.specifications && productData.specifications.length > 0) {
        for (const [index, spec] of productData.specifications.entries()) {
          await connection.execute(
            `INSERT INTO product_specifications (product_id, spec_key, spec_value, display_order)
             VALUES (?, ?, ?, ?)`,
            [
              id,
              spec.spec_key,
              spec.spec_value,
              spec.display_order !== undefined ? spec.display_order : index,
            ]
          );
        }
      }
    }

    // 4. Update images if provided
    if (productData.images !== undefined) {
      // Delete existing images
      await connection.execute(
        'DELETE FROM product_images WHERE product_id = ?',
        [id]
      );

      // Re-insert new images
      if (productData.images && productData.images.length > 0) {
        for (const [index, image] of productData.images.entries()) {
          await connection.execute(
            `INSERT INTO product_images (product_id, image_url, display_order)
             VALUES (?, ?, ?)`,
            [
              id,
              image.image_url,
              image.display_order !== undefined ? image.display_order : index,
            ]
          );
        }
      }
    }

    // 5. Update tags if provided
    if (productData.tags !== undefined) {
      // Delete existing tags
      await connection.execute(
        'DELETE FROM product_tags WHERE product_id = ?',
        [id]
      );

      // Re-insert new tags
      if (productData.tags && productData.tags.length > 0) {
        for (const tag of productData.tags) {
          const tagName = typeof tag === 'string' ? tag : tag.tag_name;
          await connection.execute(
            `INSERT INTO product_tags (product_id, tag_name)
             VALUES (?, ?)`,
            [id, tagName]
          );
        }
      }
    }

    // 6. Update supplier info if provided
    if (productData.supplierInfo !== undefined) {
      // Delete existing supplier info
      await connection.execute(
        'DELETE FROM supplier_information WHERE product_id = ?',
        [id]
      );

      // Re-insert if new supplier info is provided
      if (productData.supplierInfo) {
        await connection.execute(
          `INSERT INTO supplier_information (product_id, supplier_name, supplier_contact, supplier_code, purchase_price, internal_notes)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            id,
            productData.supplierInfo.supplier_name || null,
            productData.supplierInfo.supplier_contact || null,
            productData.supplierInfo.supplier_code || null,
            productData.supplierInfo.purchase_price || null,
            productData.supplierInfo.internal_notes || null,
          ]
        );
      }
    }

    // 7. Log admin activity
    await activityLogRepository.create({
      admin_id: adminId,
      action_type: 'UPDATE_PRODUCT',
      description: `Updated product "${existing.name}" (ID: ${id})`,
    });

    // 8. Commit transaction
    await connection.commit();

    // 9. Return the updated product with all related data (admin view)
    return await getProductByIdAdmin(id);
  } catch (error) {
    // Rollback on any error
    await connection.rollback();
    if (error.statusCode) throw error;
    throw new Error(`Failed to update product: ${error.message}`);
  } finally {
    // Always release the connection back to the pool
    connection.release();
  }
}

/**
 * Soft delete a product.
 * Marks the product as deleted and logs the activity.
 * @param {number} id - The product ID.
 * @param {number} adminId - The ID of the admin performing the action.
 * @returns {Promise<Object>} Result of the soft delete operation.
 */
async function deleteProduct(id, adminId) {
  try {
    // Verify product exists
    const existing = await productRepository.findById(id);
    if (!existing) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    const result = await productRepository.softDelete(id);

    // Log admin activity
    await activityLogRepository.create({
      admin_id: adminId,
      action_type: 'DELETE_PRODUCT',
      description: `Soft deleted product "${existing.name}" (ID: ${id}, SKU: ${existing.sku})`,
    });

    return result;
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Failed to delete product: ${error.message}`);
  }
}

/**
 * Get the total count of non-deleted products.
 * @returns {Promise<number>} The total number of products.
 */
async function getProductCount() {
  try {
    return await productRepository.count();
  } catch (error) {
    throw new Error(`Failed to get product count: ${error.message}`);
  }
}

/**
 * Get a paginated list of products for admin (includes disabled/unpublished products).
 * Admin method — may include all product states but still no supplier data in listing.
 * @param {Object} filters - Filter criteria.
 * @param {string} sort - Sort option.
 * @param {number} page - Current page number (1-indexed).
 * @param {number} limit - Number of products per page.
 * @returns {Promise<Object>} Products array and pagination metadata.
 */
async function getProductsAdmin(filters = {}, sort = 'newest', page = 1, limit = 20) {
  try {
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, Math.min(1000, parseInt(limit, 10) || 20));

    const [products, total] = await Promise.all([
      productRepository.findAllAdmin(filters, sort, page, limit),
      productRepository.countByFilters(filters, true)
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Failed to retrieve admin products: ${error.message}`);
  }
}

module.exports = {
  getProducts,
  getProductBySlug,
  getProductById,
  getProductByIdAdmin,
  getFeaturedProducts,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCount,
  getProductsAdmin,
};
