require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const db = require('d:/website/creation/src/config/database');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const DATA_FILE = 'd:/website/creation/scraped_data/ingco_products.json';
const IMAGES_DIR = 'd:/website/creation/scraped_data/images';

async function updateExisting() {
  await db.testConnection();
  const products = JSON.parse(fs.readFileSync(DATA_FILE));
  let updatedCount = 0;

  for (const p of products) {
    const sku = p.sku.trim();
    let localImage = p.localImage;
    
    // Check if product exists
    const [existing] = await db.query('SELECT id, main_image_url FROM products WHERE sku = $1', [sku]);
    if (existing.length > 0) {
      let publicUrl = null;
      if (localImage) {
        const imgPath = path.join(IMAGES_DIR, localImage);
        if (fs.existsSync(imgPath)) {
          try {
            const fileBuffer = fs.readFileSync(imgPath);
            const mimeType = localImage.endsWith('.png') ? 'image/png' 
                           : localImage.endsWith('.webp') ? 'image/webp'
                           : localImage.endsWith('.gif') ? 'image/gif'
                           : 'image/jpeg';
                           
            await supabase.storage.from('images').upload(localImage, fileBuffer, {
                contentType: mimeType,
                upsert: true
            });
            const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(localImage);
            publicUrl = publicUrlData.publicUrl;
          } catch (err) {
            console.error(`Failed to upload image for ${sku}:`, err.message);
          }
        }
      }

      if (publicUrl) {
        await db.query(`UPDATE products SET main_image_url = $1 WHERE sku = $2`, [publicUrl, sku]);
        console.log(`Updated existing product [${sku}] with new image.`);
        updatedCount++;
      }
    }
  }
  console.log(`\nSuccessfully updated ${updatedCount} existing products.`);
  process.exit(0);
}

updateExisting();
