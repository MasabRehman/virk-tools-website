const { generateCatalogPDF } = require('../services/catalogService');

const downloadCatalog = async (req, res, next) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const pdfBuffer = await generateCatalogPDF(baseUrl);
    
    const filename = `virk-tools-catalog-${new Date().toISOString().split('T')[0]}.pdf`;
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });
    
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

module.exports = { downloadCatalog };
