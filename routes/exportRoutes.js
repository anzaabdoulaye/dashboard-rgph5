const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const requireAuth = require('../middleware/authMiddleware');
const mapAuthorization = require('../middleware/mapAuthorization'); // adapte le chemin si besoin

router.get('/exports', requireAuth, mapAuthorization, exportController.index);
router.get('/api/exports/meta', requireAuth, mapAuthorization, exportController.meta);
router.get('/api/exports/preview', requireAuth, mapAuthorization, exportController.preview);
router.get('/exports/download', requireAuth, mapAuthorization, exportController.download);

module.exports = router;