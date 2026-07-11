const settingsRepository = require('../repositories/settingsRepository');
const cache = require('../utils/cache');

const SETTINGS_CACHE_KEY = 'site_settings';
const CACHE_TTL = 300; // 5 minutes

const settingsService = {
  /**
   * Get all settings (uses cache)
   */
  getAllSettings: async () => {
    const cachedSettings = cache.get(SETTINGS_CACHE_KEY);
    if (cachedSettings) {
      return cachedSettings;
    }

    const settings = await settingsRepository.getAllAsMap();
    cache.set(SETTINGS_CACHE_KEY, settings, CACHE_TTL);
    return settings;
  },

  /**
   * Update multiple settings (admin only)
   */
  updateSettings: async (settingsMap) => {
    if (!settingsMap || Object.keys(settingsMap).length === 0) {
      return;
    }

    await settingsRepository.upsertMultiple(settingsMap);
    
    // Invalidate cache
    cache.del(SETTINGS_CACHE_KEY);
    
    return await settingsRepository.getAllAsMap();
  }
};

module.exports = settingsService;
