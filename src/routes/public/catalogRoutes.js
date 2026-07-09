const router = require('express').Router();
const { downloadCatalog } = require('../../controllers/catalogController');

// Public route — no auth required, anyone can download
router.get('/download', downloadCatalog);

module.exports = router;
