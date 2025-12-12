/* // routes d’affichage (EJS)

const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');

const dashboardController = require('../controllers/dashboardController');
const locationController = require('../controllers/locationController');

// Dashboard
router.get('/',requireAuth, dashboardController.showDashboard);

//Nouvelle page pour les graphiques
router.get('/charts',requireAuth, dashboardController.showCharts);

// AJAX selects
router.get('/regions',requireAuth, locationController.getRegions);
router.get('/departements',requireAuth, locationController.getDepartements);
router.get('/communes',requireAuth, locationController.getCommunes);
router.get('/zds',requireAuth, locationController.getZds);

// Stats JSON
router.get('/stats',requireAuth, dashboardController.getStats);

module.exports = router; */


// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');

const dashboardController = require('../controllers/dashboardController');
const locationController = require('../controllers/locationController');

// Dashboard
router.get('/', requireAuth, dashboardController.showDashboard);

// Nouvelle page pour les graphiques
router.get('/charts', requireAuth, dashboardController.showCharts);

// AJAX selects - CORRECTION DES CHEMINS
router.get('/api/location/regions', requireAuth, locationController.getRegions);
router.get('/api/location/departements', requireAuth, locationController.getDepartements);
router.get('/api/location/communes', requireAuth, locationController.getCommunes);
router.get('/api/location/zds', requireAuth, locationController.getZds);

// Stats JSON
router.get('/stats', requireAuth, dashboardController.getStats);

module.exports = router;
