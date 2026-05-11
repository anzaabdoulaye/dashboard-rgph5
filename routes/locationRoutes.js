// routes/locationRoutes.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');
const locationController = require('../controllers/locationController');

// Récupérer toutes les régions (avec restrictions selon l'utilisateur)
router.get('/regions', requireAuth, locationController.getRegions);

// Récupérer les départements d'une région (avec restrictions)
router.get('/departements', requireAuth, locationController.getDepartements);

// Récupérer les communes d'un département (avec restrictions)
router.get('/communes', requireAuth, locationController.getCommunes);

router.get('/zs', requireAuth, locationController.getZs);
router.get('/zds', requireAuth, locationController.getZdsByZs);

// Récupérer les ZD d'une commune (avec restrictions)
/* exports.getZs = async (req, res) => {
  try {
    const commune = req.query.commune || '';
    const user = req.session.user;
    const userId = user ? `${user.id}_${user.role}` : 'public';
    const cacheKey = getCacheKey(`zs:${commune}`, userId);

    console.log('================ getZs CONTROLLER ================');
    console.log('[getZs controller] req.query =', req.query);
    console.log('[getZs controller] commune =', commune);
    console.log('[getZs controller] cacheKey =', cacheKey);

    if (selectsCache[cacheKey]) {
      console.log(`✅ Cache hit: ${cacheKey}`);
      console.log('[getZs controller] données cache =', selectsCache[cacheKey].slice(0, 10));
      return res.json(selectsCache[cacheKey]);
    }

    const zss = await menageService.getZs(commune, user);

    console.log('[getZs controller] données service nb =', zss.length);
    console.log('[getZs controller] aperçu service =', zss.slice(0, 10));

    selectsCache[cacheKey] = zss;
    setTimeout(() => delete selectsCache[cacheKey], 10 * 60 * 1000);

    return res.json(zss);
  } catch (err) {
    console.error('❌ Erreur getZs:', err);
    return res.status(500).json({ error: err.message });
  }
}; */

// Récupérer les agents associés à une ZD (depuis user_zd)
router.get('/agents-by-zd', requireAuth, locationController.getAgentsByZd);

module.exports = router;