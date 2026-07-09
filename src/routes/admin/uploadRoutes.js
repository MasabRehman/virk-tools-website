const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');
const { authenticate, requireAdmin } = require('../../middlewares/authMiddleware');

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configure multer storage for memory
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit as requested
  fileFilter: fileFilter
});

// All admin upload routes require authentication + admin role
router.use(authenticate, requireAdmin);

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Generate a unique filename
    const ext = path.extname(req.file.originalname);
    const filename = `${uuidv4()}${ext}`;
    
    // Upload the file to Supabase Storage bucket 'images'
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });
      
    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload image to cloud storage: ${error.message}`);
    }

    // Retrieve the public URL
    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(filename);
      
    const imageUrl = publicUrlData.publicUrl;
    
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully to cloud',
      data: {
        imageUrl: imageUrl
      }
    });
  } catch (error) {
    console.error('Upload route error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Error handling middleware specific for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File is too large. Max size is 2MB.' });
    }
    return res.status(400).json({ success: false, message: error.message });
  } else if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
  next();
});

module.exports = router;
