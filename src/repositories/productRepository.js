const { query } = require('../config/database');

/**
 * Product Repository
 * Handles all database operations for the products table.
 * Includes complex filtering, sorting, pagination, and JOINs.
 */

/**
 * Build WHERE clauses and params from a filters object.
 * @param {object} filters - Filter criteria
 * @param {boolean} isAdmin - If true, skip is_disabled/is_published guards
 * @returns {{ whereClauses: string[], params: any[] }}
 */
function buildFilterClauses(filters = {}, isAdmin = false) {
  const whereClauses = ['p.deleted_at IS NULL'];
  const params = [];

  if (!isAdmin) {
    whereClauses.push('p.is_disabled = FALSE');
    whereClauses.push('p.is_published = TRUE');
  }

  if (filters.brand_id) {
    whereClauses.push('p.brand_id = ?');
    params.push(filters.brand_id);
  }
  if (filters.category_id) {
    whereClauses.push('p.category_id = ?');
    params.push(filters.category_id);
  }
  if (filters.subcategory_id) {
    whereClauses.push('p.subcategory_id = ?');
    params.push(filters.subcategory_id);
  }
  if (filters.availability_status) {
    whereClauses.push('p.availability_status = ?');
    params.push(filters.availability_status);
  }
  if (filters.is_featured !== undefined) {
    whereClauses.push('p.is_featured = ?');
    params.push(filters.is_featured);
  }
  if (filters.is_published !== undefined && isAdmin) {
    whereClauses.push('p.is_published = ?');
    params.push(filters.is_published);
  }
  if (filters.price_min !== undefined) {
    whereClauses.push('p.selling_price >= ?');
    params.push(filters.price_min);
  }
  if (filters.price_max !== undefined) {
    whereClauses.push('p.selling_price <= ?');
    params.push(filters.price_max);
  }
  if (filters.search) {
    whereClauses.push('(p.name LIKE ? OR p.sku LIKE ?)');
    const term = `%${filters.search}%`;
    params.push(term, term);
  }

  return { whereClauses, params };
}

/**
 * Map a sort key to an ORDER BY clause.
 */
function buildOrderClause(sort) {
  switch (sort) {
    case 'price_asc':
      return 'p.selling_price ASC';
    case 'price_desc':
      return 'p.selling_price DESC';
    case 'name_asc':
      return 'p.name ASC';
    case 'featured':
      return 'p.is_featured DESC, p.created_at DESC';
    case 'newest':
    default:
      return 'p.created_at DESC';
  }
}

async function findAll(filters = {}, sort = 'newest', page = 1, limit = 20) {
  const { whereClauses, params } = buildFilterClauses(filters, false);
  const orderBy = buildOrderClause(sort);
  const offset = (page - 1) * limit;

  const sql = `
    SELECT
      p.*,
      b.name AS brand_name,
      b.logo_url AS brand_logo,
      c.name AS category_name,
      sc.name AS subcategory_name
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
    WHERE ${whereClauses.join(' AND ')}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;
  params.push(limit, offset);

  const [rows] = await query(sql, params);
  return rows;
}

async function findAllAdmin(filters = {}, sort = 'newest', page = 1, limit = 20) {
  const { whereClauses, params } = buildFilterClauses(filters, true);
  const orderBy = buildOrderClause(sort);
  const offset = (page - 1) * limit;

  const sql = `
    SELECT
      p.id, p.name, p.sku, p.slug, p.selling_price, p.main_image_url,
      p.is_published, p.is_disabled, p.is_featured, p.category_id, p.brand_id, p.availability_status,
      p.created_at, p.updated_at,
      b.name AS brand_name,
      b.logo_url AS brand_logo,
      c.name AS category_name,
      sc.name AS subcategory_name
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
    WHERE ${whereClauses.join(' AND ')}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;
  params.push(limit, offset);

  const [rows] = await query(sql, params);
  return rows;
}

async function findById(id) {
  const sql = `
    SELECT
      p.*,
      b.name AS brand_name,
      b.logo_url AS brand_logo,
      c.name AS category_name,
      sc.name AS subcategory_name
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
    WHERE p.id = ? AND p.deleted_at IS NULL
  `;
  const [rows] = await query(sql, [id]);
  return rows[0] || null;
}

async function findByIdAdmin(id) {
  const sql = `
    SELECT
      p.*,
      b.name AS brand_name,
      b.logo_url AS brand_logo,
      c.name AS category_name,
      sc.name AS subcategory_name
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
    WHERE p.id = ? AND p.deleted_at IS NULL
  `;
  const [rows] = await query(sql, [id]);
  return rows[0] || null;
}

async function findBySlug(slug) {
  const sql = `
    SELECT
      p.*,
      b.name AS brand_name,
      b.logo_url AS brand_logo,
      c.name AS category_name
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = ? AND p.is_published = TRUE AND p.is_disabled = FALSE AND p.deleted_at IS NULL
  `;
  const [rows] = await query(sql, [slug]);
  return rows[0] || null;
}

async function findBySku(sku) {
  const sql = `
    SELECT * FROM products
    WHERE sku = ? AND deleted_at IS NULL
  `;
  const [rows] = await query(sql, [sku]);
  return rows[0] || null;
}

async function findFeatured(limit = 12) {
  const sql = `
    SELECT
      p.*,
      b.name AS brand_name,
      b.logo_url AS brand_logo,
      c.name AS category_name
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_featured = TRUE
      AND p.is_published = TRUE
      AND p.is_disabled = FALSE
      AND p.deleted_at IS NULL
    ORDER BY p.created_at DESC
    LIMIT ?
  `;
  const [rows] = await query(sql, [limit]);
  return rows;
}

async function search(searchQuery, limit = 10) {
  const term = `%${searchQuery}%`;
  const sql = `
    SELECT
      p.id,
      p.name,
      p.sku,
      p.slug,
      p.selling_price,
      p.main_image_url,
      b.name AS brand_name
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE (p.name LIKE ? OR p.sku LIKE ? OR EXISTS (
      SELECT 1 FROM product_tags pt WHERE pt.product_id = p.id AND pt.tag_name LIKE ?
    ))
      AND p.is_published = TRUE
      AND p.is_disabled = FALSE
      AND p.deleted_at IS NULL
    ORDER BY p.name ASC
    LIMIT ?
  `;
  const [rows] = await query(sql, [term, term, term, limit]);
  return rows;
}

async function create(data) {
  const sql = `
    INSERT INTO products (
      brand_id, category_id, name, slug, sku,
      short_description, long_description, selling_price, original_price,
      main_image_url, availability_status, is_featured, is_published, is_disabled,
      meta_title, meta_description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    data.brand_id || null,
    data.category_id,
    data.name,
    data.slug,
    data.sku,
    data.short_description || null,
    data.long_description || null,
    data.selling_price,
    data.original_price || null,
    data.main_image_url || null,
    data.availability_status || 'in_stock',
    data.is_featured || false,
    data.is_published || false,
    data.is_disabled || false,
    data.meta_title || null,
    data.meta_description || null,
  ];
  const [result] = await query(sql, params);
  return result.insertId;
}

async function update(id, data) {
  const fields = [
    'brand_id', 'category_id', 'name', 'slug', 'sku',
    'short_description', 'long_description', 'selling_price', 'original_price',
    'main_image_url', 'availability_status', 'is_featured', 'is_published', 'is_disabled',
    'meta_title', 'meta_description'
  ];

  const updates = [];
  const params = [];

  fields.forEach(field => {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(data[field]);
    }
  });

  if (updates.length === 0) return null;

  params.push(id);
  const sql = `UPDATE products SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
  const [result] = await query(sql, params);
  return result;
}

async function clearImages(productId) {
  const sql = `DELETE FROM product_images WHERE product_id = ?`;
  await query(sql, [productId]);
}

async function addImages(productId, imageUrls) {
  if (!imageUrls || imageUrls.length === 0) return;
  const values = imageUrls.map((url, idx) => [productId, url, idx + 1]);
  const sql = `INSERT INTO product_images (product_id, image_url, display_order) VALUES ?`;
  await query(sql, [values]);
}

async function softDelete(id) {
  // Append a suffix to the SKU so it doesn't violate unique constraints if a new product with the same SKU is created
  const sql = `UPDATE products SET deleted_at = NOW(), sku = CONCAT(sku, '-del-', UNIX_TIMESTAMP()) WHERE id = ? AND deleted_at IS NULL`;
  const [result] = await query(sql, [id]);
  return result;
}

async function countByFilters(filters = {}, isAdmin = false) {
  const { whereClauses, params } = buildFilterClauses(filters, isAdmin);

  const sql = `
    SELECT COUNT(*) AS total
    FROM products p
    WHERE ${whereClauses.join(' AND ')}
  `;
  const [rows] = await query(sql, params);
  return rows[0].total;
}

async function findRelatedProducts(productId) {
  const sql = `
    SELECT
      p.id, p.name, p.slug, p.selling_price, p.main_image_url,
      b.name AS brand_name
    FROM related_products rp
    JOIN products p ON rp.related_product_id = p.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE rp.product_id = ? AND p.is_published = TRUE AND p.is_disabled = FALSE AND p.deleted_at IS NULL
  `;
  const [rows] = await query(sql, [productId]);
  return rows;
}

module.exports = {
  findAll,
  findAllAdmin,
  findById,
  findByIdAdmin,
  findBySlug,
  findBySku,
  findFeatured,
  search,
  create,
  update,
  clearImages,
  addImages,
  softDelete,
  countByFilters,
  findRelatedProducts,
};
