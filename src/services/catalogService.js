const PDFDocument = require('pdfkit');
const { query } = require('../config/database');
const https = require('https');
const http = require('http');

/**
 * Fetch an image from a URL and return it as a Buffer.
 */
function fetchImageBuffer(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', () => resolve(null));
    }).on('error', () => resolve(null));
  });
}

/**
 * Generates a full product catalog PDF grouped by category.
 * Returns a Buffer of the PDF.
 */
async function generateCatalogPDF(baseUrl) {
  // Fetch categories
  const [categories] = await query(
    'SELECT id, name FROM categories WHERE deleted_at IS NULL ORDER BY name ASC'
  );

  // Fetch all published products with their details
  const [products] = await query(`
    SELECT 
      p.id, p.sku, p.name, p.selling_price, p.description,
      p.availability_status, p.main_image_url, p.is_featured,
      p.category_id,
      b.name AS brand_name,
      c.name AS category_name
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_published = true AND p.is_disabled = false AND p.deleted_at IS NULL
    ORDER BY c.name ASC, p.name ASC
  `);

  // Group products by category
  const byCategory = {};
  for (const cat of categories) {
    byCategory[cat.id] = { name: cat.name, products: [] };
  }
  // Also bucket products with unknown/null category
  const uncategorized = { name: 'Uncategorized', products: [] };
  
  // Pre-fetch all images in batches of 20 to avoid timeouts and rate limits
  const chunkArray = (arr, size) => arr.length ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)] : [];
  const productChunks = chunkArray(products, 20);
  for (const chunk of productChunks) {
    await Promise.all(chunk.map(async p => {
      if (p.main_image_url) {
        try {
          const imageUrl = p.main_image_url.startsWith('http')
            ? p.main_image_url
            : `${baseUrl}${p.main_image_url}`;
          const imgBuffer = await fetchImageBuffer(imageUrl);
          if (imgBuffer && imgBuffer.length > 0) {
            p.imgBuffer = imgBuffer;
          }
        } catch (_) {}
      }
    }));
  }

  for (const p of products) {
    if (p.category_id && byCategory[p.category_id]) {
      byCategory[p.category_id].products.push(p);
    } else {
      uncategorized.products.push(p);
    }
  }

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const buffers = [];
  doc.on('data', (chunk) => buffers.push(chunk));

  const W = doc.page.width - 100; // usable width
  const BRAND_COLOR = '#1a1a2e';
  const ACCENT = '#f5a623';
  const LIGHT_GRAY = '#f7f7f7';
  const TEXT_GRAY = '#555555';

  // ── Cover Page ──────────────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(BRAND_COLOR);

  // Company name
  doc.fillColor('#ffffff')
     .font('Helvetica-Bold')
     .fontSize(42)
     .text('VIRK TOOLS', 50, 180, { align: 'center', width: W + 0 });

  doc.fillColor(ACCENT)
     .font('Helvetica')
     .fontSize(18)
     .text('& EQUIPMENT', 50, 232, { align: 'center', width: W + 0 });

  doc.moveTo(150, 280).lineTo(doc.page.width - 150, 280)
     .strokeColor(ACCENT).lineWidth(2).stroke();

  doc.fillColor('#cccccc')
     .font('Helvetica')
     .fontSize(14)
     .text('PRODUCT CATALOG', 50, 300, { align: 'center', width: W + 0 });

  const year = new Date().getFullYear();
  doc.fillColor('#aaaaaa')
     .fontSize(11)
     .text(`${year} Edition`, 50, 330, { align: 'center', width: W + 0 });

  // Total count
  doc.fillColor('#ffffff')
     .fontSize(12)
     .text(`${products.length} Products across ${categories.length} Categories`, 50, 680, { align: 'center', width: W + 0 });

  // ── Category Sections ────────────────────────────────────────────
  const allGroups = [
    ...Object.values(byCategory).filter(g => g.products.length > 0),
    ...(uncategorized.products.length > 0 ? [uncategorized] : [])
  ];

  for (const group of allGroups) {
    doc.addPage();

    // Category header bar
    doc.rect(50, 50, W, 40).fill(BRAND_COLOR);
    doc.fillColor('#ffffff')
       .font('Helvetica-Bold')
       .fontSize(16)
       .text(group.name.toUpperCase(), 65, 62, { width: W - 30 });

    doc.fillColor(TEXT_GRAY)
       .font('Helvetica')
       .fontSize(10)
       .text(`${group.products.length} product${group.products.length !== 1 ? 's' : ''}`, W - 30, 65, { align: 'right' });

    let y = 105;

    for (const product of group.products) {
      const CARD_H = 130;

      // Check page break
      if (y + CARD_H > doc.page.height - 60) {
        doc.addPage();
        y = 50;
      }

      // Card background (alternating)
      const isEven = group.products.indexOf(product) % 2 === 0;
      doc.rect(50, y, W, CARD_H).fill(isEven ? LIGHT_GRAY : '#ffffff');
      doc.rect(50, y, W, CARD_H).stroke('#e0e0e0');

      // Accent left bar
      doc.rect(50, y, 4, CARD_H).fill(ACCENT);

      // Image column
      const IMG_X = 60;
      const IMG_Y = y + 10;
      const IMG_W = 90;
      const IMG_H = 110;

      let imageDrawn = false;
      if (product.imgBuffer) {
        try {
          doc.image(product.imgBuffer, IMG_X, IMG_Y, { width: IMG_W, height: IMG_H, fit: [IMG_W, IMG_H], align: 'center', valign: 'center' });
          imageDrawn = true;
        } catch (_) {}
      }
      if (!imageDrawn) {
        doc.rect(IMG_X, IMG_Y, IMG_W, IMG_H).fill('#dddddd');
        doc.fillColor('#999999').fontSize(8).text('No Image', IMG_X, IMG_Y + IMG_H / 2 - 5, { width: IMG_W, align: 'center' });
      }

      // Text content area
      const TX = 160;
      const TW = W - 115;

      // Product name
      doc.fillColor(BRAND_COLOR)
         .font('Helvetica-Bold')
         .fontSize(11)
         .text(product.name, TX, y + 12, { width: TW, ellipsis: true });

      // Brand + SKU row
      const brand = product.brand_name || '—';
      const sku = product.sku || '—';
      doc.fillColor(TEXT_GRAY)
         .font('Helvetica')
         .fontSize(9)
         .text(`Brand: ${brand}   |   SKU: ${sku}`, TX, y + 30, { width: TW });

      // Price row
      const price = product.selling_price
        ? `Rs. ${Number(product.selling_price).toLocaleString()}`
        : 'Price on Request';
      doc.fillColor(ACCENT)
         .font('Helvetica-Bold')
         .fontSize(13)
         .text(price, TX, y + 46, { width: 200 });

      // Availability badge
      const statusLabels = {
        available: 'In Stock',
        on_request: 'On Request',
        coming_soon: 'Coming Soon',
        temporarily_unavailable: 'Unavailable',
        discontinued: 'Discontinued',
      };
      const statusColors = {
        available: '#27ae60',
        on_request: '#e67e22',
        coming_soon: '#2980b9',
        temporarily_unavailable: '#e74c3c',
        discontinued: '#7f8c8d',
      };
      const status = product.availability_status || 'available';
      const statusLabel = statusLabels[status] || status;
      const statusColor = statusColors[status] || '#888888';

      doc.fillColor(statusColor)
         .font('Helvetica-Bold')
         .fontSize(8)
         .text(`● ${statusLabel}`, TX + 210, y + 50, { width: 120 });

      // Description
      if (product.description) {
        const desc = product.description.replace(/<[^>]*>/g, '').substring(0, 200);
        doc.fillColor(TEXT_GRAY)
           .font('Helvetica')
           .fontSize(8.5)
           .text(desc + (product.description.length > 200 ? '...' : ''), TX, y + 68, { width: TW, height: 50, ellipsis: true });
      }

      y += CARD_H + 6;
    }
  }

  // ── Footer on each page ──────────────────────────────────────────
  const pageCount = doc.bufferedPageRange
    ? doc.bufferedPageRange().count
    : undefined;

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });
}

module.exports = { generateCatalogPDF };
