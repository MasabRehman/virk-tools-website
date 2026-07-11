const settingsService = require('../services/settingsService');

/**
 * Get all company settings
 * Public route
 */
exports.getAll = async (req, res, next) => {
  try {
    const settings = await settingsService.getAllSettings();
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update multiple company settings
 * Admin route
 */
exports.update = async (req, res, next) => {
  try {
    const newSettings = req.body;
    const updatedSettings = await settingsService.updateSettings(newSettings);
    
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings
    });
  } catch (error) {
    next(error);
  }
};
