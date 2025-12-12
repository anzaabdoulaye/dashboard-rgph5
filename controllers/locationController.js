// controllers/locationController.js
const menageService = require('../services/menageServiceUltraFast');

// Cache simple pour les selects (expire 10 min)
const selectsCache = {};
function getCacheKey(filters) {
  return JSON.stringify(filters);
}

// GET /regions
exports.getRegions = async (req, res) => {
  try {
    const cacheKey = 'regions';
    if (selectsCache[cacheKey]) return res.json(selectsCache[cacheKey]);

    const regions = await menageService.getRegions();
    selectsCache[cacheKey] = regions;
    setTimeout(() => delete selectsCache[cacheKey], 10 * 60 * 1000);

    res.json(regions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /departements
exports.getDepartements = async (req, res) => {
  try {
    const region = req.query.region || '';
    const cacheKey = `departements_${region}`;
    if (selectsCache[cacheKey]) return res.json(selectsCache[cacheKey]);

    const departements = await menageService.getDepartements(region);
    selectsCache[cacheKey] = departements;
    setTimeout(() => delete selectsCache[cacheKey], 10 * 60 * 1000);

    res.json(departements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /communes
exports.getCommunes = async (req, res) => {
  try {
    const departement = req.query.departement || '';
    const cacheKey = `communes_${departement}`;
    if (selectsCache[cacheKey]) return res.json(selectsCache[cacheKey]);

    const communes = await menageService.getCommunes(departement);
    selectsCache[cacheKey] = communes;
    setTimeout(() => delete selectsCache[cacheKey], 10 * 60 * 1000);

    res.json(communes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /zds
exports.getZds = async (req, res) => {
  try {
    const commune = req.query.commune || '';
    const cacheKey = `zds_${commune}`;
    if (selectsCache[cacheKey]) return res.json(selectsCache[cacheKey]);

    const zds = await menageService.getZds(commune);
    selectsCache[cacheKey] = zds;
    setTimeout(() => delete selectsCache[cacheKey], 10 * 60 * 1000);

    res.json(zds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
