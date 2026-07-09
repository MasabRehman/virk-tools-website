require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const db = require('d:/website/creation/src/config/database');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DATA_FILE = 'd:/website/creation/scraped_data/ingco_products.json';
const IMAGES_DIR = 'd:/website/creation/scraped_data/images';

// The EXACT 10 categories requested by the user
const categoryMappings = [
  { dbId: 10, name: "Automotive Tools", keywords: ['automotive', 'jack', 'creeper', 'compressor', 'stand', 'wrench', 'car'] },
  { dbId: 9,  name: "Air Tools", keywords: ['air', 'pneumatic', 'spray gun', 'inflator', 'blow gun', 'sander', 'hose'] },
  { dbId: 12, name: "Safety Equipment", keywords: ['safety', 'goggle', 'goggles', 'gloves', 'glove', 'boots', 'shoe', 'helmet', 'mask', 'vest'] },
  { dbId: 11, name: "Accessories", keywords: ['blade', 'bit', 'disc', 'wheel', 'battery', 'charger', 'chuck', 'socket set', 'accessory'] },
  { dbId: 2,  name: "Cordless Tools", keywords: ['cordless', 'lithium', 'li-ion', '20v', '12v'] },
  { dbId: 1,  name: "Power Tools", keywords: ['power', 'rotary', 'grinder', 'drill', 'electric', 'saw', 'router', 'blower', 'mixer', 'hammer', 'polisher'] },
  { dbId: 3,  name: "Hand Tools", keywords: ['hand', 'pliers', 'screwdriver', 'wrench', 'hammer', 'socket', 'cutter', 'trowel', 'clamp', 'knife', 'spanner'] },
  { dbId: 4,  name: "Garden Tools", keywords: ['garden', 'pump', 'mower', 'chainsaw', 'trimmer', 'pruning', 'shears', 'spray', 'hose'] },
  { dbId: 5,  name: "Welding Equipment", keywords: ['welding', 'inverter', 'electrode', 'holder', 'earth clamp', 'tig', 'mig'] },
  { dbId: 6,  name: "Measuring Tools", keywords: ['measuring', 'level', 'tape', 'caliper', 'laser', 'square', 'ruler'] }
];

async function importProducts() {
  console.log('Connecting to database...');
  await db.testConnection();

  if (!fs.existsSync(DATA_FILE)) {
    console.error('Data file not found:', DATA_FILE);
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(DATA_FILE));
  console.log(`Loaded ${products.length} scraped products.`);

  // Ensure INGCO brand exists
  const [brandRows] = await db.query('SELECT id FROM brands WHERE name = $1', ['INGCO']);
  let brandId = null;
  if (brandRows.length > 0) {
    brandId = brandRows[0].id;
  } else {
    const [result] = await db.query('INSERT INTO brands (name, slug, is_active) VALUES ($1, $2, TRUE) RETURNING id', ['INGCO', 'ingco']);
    brandId = result[0].id;
  }

  let importedCount = 0;

  for (const p of products) {
    const name = p.name.trim();
    const sku = p.sku.trim();
    let localImage = p.localImage;
    
    // 1. Determine Category
    let matchedCategoryId = null;
    const fullText = name.toLowerCase();
    
    // Prioritize specific keywords over generic ones
    for (const cat of categoryMappings) {
        for (const kw of cat.keywords) {
            if (fullText.includes(kw)) {
                matchedCategoryId = cat.dbId;
                break;
            }
        }
        if (matchedCategoryId) break;
    }

    // Only import if it falls exactly into one of the 10 requested categories
    if (!matchedCategoryId) {
      console.log(`Skipping [${sku}] ${name} - Could not map to the 10 specific categories.`);
      continue;
    }

    // 2. Check if product already exists
    const [existing] = await db.query('SELECT id FROM products WHERE sku = $1', [sku]);
    if (existing.length > 0) {
      console.log(`Skipping [${sku}] - Already exists in DB.`);
      continue;
    }

    let publicUrl = null;

    // 3. Upload Image to Supabase
    if (localImage) {
      const imgPath = path.join(IMAGES_DIR, localImage);
      if (fs.existsSync(imgPath)) {
        try {
          const fileBuffer = fs.readFileSync(imgPath);
          const mimeType = localImage.endsWith('.png') ? 'image/png' 
                         : localImage.endsWith('.webp') ? 'image/webp'
                         : localImage.endsWith('.gif') ? 'image/gif'
                         : 'image/jpeg';
                         
          const { data, error } = await supabase.storage
            .from('images')
            .upload(localImage, fileBuffer, {
              contentType: mimeType,
              upsert: true
            });
            
          if (error) throw error;

          const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(localImage);
          publicUrl = publicUrlData.publicUrl;
        } catch (err) {
          console.error(`Failed to upload image for ${sku}:`, err.message);
        }
      }
    }

    // 4. Insert Product
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + sku.toLowerCase();
      const price = Math.floor(Math.random() * 200) + 20; // Mock price
      
      await db.query(`
          INSERT INTO products 
          (category_id, brand_id, name, slug, sku, selling_price, availability_status, description, main_image_url, is_published, is_featured) 
          VALUES ($1, $2, $3, $4, $5, $6, 'available', $7, $8, TRUE, FALSE)
      `, [matchedCategoryId, brandId, name, slug, sku, price, p.description || '', publicUrl]);
      
      importedCount++;
      console.log(`Imported: [${sku}] ${name} -> Category ID: ${matchedCategoryId}`);
    } catch (e) {
      console.error(`Failed to insert product [${sku}]:`, e.message);
    }
  }

  console.log(`\nImport complete! Successfully imported ${importedCount} products mapped strictly to the 10 requested categories.`);
  process.exit(0);
}

importProducts();
