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

// Récupérer les ZD d'une commune (avec restrictions)
router.get('/zds', requireAuth, locationController.getZds);

// Récupérer les agents associés à une ZD (depuis user_zd)
router.get('/agents-by-zd', requireAuth, locationController.getAgentsByZd);

module.exports = router;