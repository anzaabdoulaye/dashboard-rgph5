// controllers/locationController.js
const menageService = require('../services/menageServiceUltraFast');

// Cache simple pour les selects (expire 10 min)
const selectsCache = {};
function getCacheKey(prefix, userId = 'public') {
  return `${prefix}:${userId}`;
}

// GET /regions
exports.getRegions = async (req, res) => {
  try {
    const user = req.session.user;
    const userId = user ? `${user.id}_${user.role}` : 'public';
    const cacheKey = getCacheKey('regions', userId);

    if (selectsCache[cacheKey]) {
      console.log(`✅ Cache hit: ${cacheKey}`);
      return res.json(selectsCache[cacheKey]);
    }

    const regions = await menageService.getRegions(user);
    selectsCache[cacheKey] = regions;
    setTimeout(() => delete selectsCache[cacheKey], 10 * 60 * 1000);

    res.json(regions);
  } catch (err) {
    console.error('❌ Erreur getRegions:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /departements
exports.getDepartements = async (req, res) => {
  try {
    const region = req.query.region || '';
    const user = req.session.user;
    const userId = user ? `${user.id}_${user.role}` : 'public';
    const cacheKey = getCacheKey(`departements:${region}`, userId);

    if (selectsCache[cacheKey]) {
      console.log(`✅ Cache hit: ${cacheKey}`);
      return res.json(selectsCache[cacheKey]);
    }

    const departements = await menageService.getDepartements(region, user);
    selectsCache[cacheKey] = departements;
    setTimeout(() => delete selectsCache[cacheKey], 10 * 60 * 1000);

    res.json(departements);
  } catch (err) {
    console.error('❌ Erreur getDepartements:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /communes
exports.getCommunes = async (req, res) => {
  try {
    const departement = req.query.departement || '';
    const user = req.session.user;
    const userId = user ? `${user.id}_${user.role}` : 'public';
    const cacheKey = getCacheKey(`communes:${departement}`, userId);

    if (selectsCache[cacheKey]) {
      console.log(`✅ Cache hit: ${cacheKey}`);
      return res.json(selectsCache[cacheKey]);
    }

    const communes = await menageService.getCommunes(departement, user);
    selectsCache[cacheKey] = communes;
    setTimeout(() => delete selectsCache[cacheKey], 10 * 60 * 1000);

    res.json(communes);
  } catch (err) {
    console.error('❌ Erreur getCommunes:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /zds
exports.getZds = async (req, res) => {
  try {
    const commune = req.query.commune || '';
    const user = req.session.user;
    const userId = user ? `${user.id}_${user.role}` : 'public';
    const cacheKey = getCacheKey(`zds:${commune}`, userId);

    if (selectsCache[cacheKey]) {
      console.log(`✅ Cache hit: ${cacheKey}`);
      return res.json(selectsCache[cacheKey]);
    }

    const zds = await menageService.getZds(commune, user);
    selectsCache[cacheKey] = zds;
    setTimeout(() => delete selectsCache[cacheKey], 10 * 60 * 1000);

    res.json(zds);
  } catch (err) {
    console.error('❌ Erreur getZds:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /agents-by-zd?zd=XXXX
// Retourne { agents: "agent1 - agent2 - ..." } pour la ZD donnée
exports.getAgentsByZd = async (req, res) => {
  try {
    const zd = req.query.zd || '';
    if (!zd) {
      return res.json({ agents: '' });
    }

    const cacheKey = getCacheKey(`agents_zd:${zd}`, 'shared');
    if (selectsCache[cacheKey]) {
      console.log(`✅ Cache hit: ${cacheKey}`);
      return res.json(selectsCache[cacheKey]);
    }

    const agents = await menageService.getAgentsByZd(zd);
    const result = { agents };
    selectsCache[cacheKey] = result;
    setTimeout(() => delete selectsCache[cacheKey], 10 * 60 * 1000);

    res.json(result);
  } catch (err) {
    console.error('❌ Erreur getAgentsByZd:', err);
    res.status(500).json({ error: err.message });
  }
};