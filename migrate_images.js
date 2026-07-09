require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const db = require('./src/config/database');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const uploadsDir = path.join(__dirname, 'uploads', 'images');

async function migrateImages() {
  console.log('Connecting to database...');
  await db.testConnection();

  console.log(`Scanning local directory: ${uploadsDir}`);
  if (!fs.existsSync(uploadsDir)) {
    console.log('No local images directory found.');
    process.exit(0);
  }

  const files = fs.readdirSync(uploadsDir);
  console.log(`Found ${files.length} images to migrate.`);

  for (const filename of files) {
    const filePath = path.join(uploadsDir, filename);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile()) {
      try {
        console.log(`Uploading ${filename}...`);
        const fileBuffer = fs.readFileSync(filePath);
        const mimeType = filename.endsWith('.png') ? 'image/png' 
                       : filename.endsWith('.webp') ? 'image/webp'
                       : filename.endsWith('.gif') ? 'image/gif'
                       : 'image/jpeg';
                       
        const { data, error } = await supabase.storage
          .from('images')
          .upload(filename, fileBuffer, {
            contentType: mimeType,
            upsert: true
          });
          
        if (error) throw error;

        // Get public URL
        const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(filename);
        const newUrl = publicUrlData.publicUrl;
        
        // Update Products
        await db.query(`UPDATE "products" SET "main_image_url" = $1 WHERE "main_image_url" LIKE $2`, [newUrl, `%${filename}`]);
        
        // Update Categories
        await db.query(`UPDATE "categories" SET "image_url" = $1 WHERE "image_url" LIKE $2`, [newUrl, `%${filename}`]);
        await db.query(`UPDATE "categories" SET "banner_url" = $1 WHERE "banner_url" LIKE $2`, [newUrl, `%${filename}`]);
        
        // Update Subcategories
        await db.query(`UPDATE "subcategories" SET "image_url" = $1 WHERE "image_url" LIKE $2`, [newUrl, `%${filename}`]);
        
        // Update Brands
        await db.query(`UPDATE "brands" SET "logo_url" = $1 WHERE "logo_url" LIKE $2`, [newUrl, `%${filename}`]);
        
        // Update Product Images
        await db.query(`UPDATE "product_images" SET "image_url" = $1 WHERE "image_url" LIKE $2`, [newUrl, `%${filename}`]);
        
        // Update Homepage Banners
        await db.query(`UPDATE "homepage_banners" SET "desktop_image_url" = $1 WHERE "desktop_image_url" LIKE $2`, [newUrl, `%${filename}`]);
        await db.query(`UPDATE "homepage_banners" SET "mobile_image_url" = $1 WHERE "mobile_image_url" LIKE $2`, [newUrl, `%${filename}`]);

      } catch (err) {
        console.error(`Failed to process ${filename}:`, err.message);
      }
    }
  }

  console.log('Migration complete!');
  process.exit(0);
}

migrateImages();
