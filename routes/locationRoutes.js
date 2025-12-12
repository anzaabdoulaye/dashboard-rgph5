// routes/locationRoutes.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');
const menageService = require('../services/menageServiceUltraFast');

// Récupérer toutes les régions (avec restrictions selon l'utilisateur)
router.get('/regions', async (req, res) => {
    try {
        const user = req.session.user;
        console.log('Récupération des régions pour utilisateur:', user?.username);
        
        // Utiliser le service menageService qui gère déjà les restrictions
        const regions = await menageService.getRegions(user);
        
        console.log('Régions récupérées:', regions.length, 'pour utilisateur', user?.username);
        res.json(regions);
    } catch (err) {
        console.error('Erreur régions:', err);
        res.status(500).json({ error: err.message });
    }
});

// Récupérer les départements d'une région (avec restrictions)
router.get('/departements', async (req, res) => {
    try {
        const { region } = req.query; // Note: changement de regionId à region
        const user = req.session.user;
        
        console.log(`Récupération départements pour région ${region}, utilisateur:`, user?.username);
        
        if (!region && !user?.code_departement) {
            console.log('Aucune région spécifiée et utilisateur sans département fixe');
            return res.json([]);
        }
        
        // Utiliser le service menageService
        const departements = await menageService.getDepartements(region, user);
        
        console.log(`Départements pour région ${region}:`, departements.length);
        res.json(departements);
    } catch (err) {
        console.error('Erreur départements:', err);
        res.status(500).json({ error: err.message });
    }
});

// Récupérer les communes d'un département (avec restrictions)
router.get('/communes', async (req, res) => {
    try {
        const { departement } = req.query; // Note: changement de departementId à departement
        const user = req.session.user;
        
        console.log(`Récupération communes pour département ${departement}, utilisateur:`, user?.username);
        
        if (!departement && !user?.code_commune) {
            console.log('Aucun département spécifié et utilisateur sans commune fixe');
            return res.json([]);
        }
        
        // Utiliser le service menageService
        const communes = await menageService.getCommunes(departement, user);
        
        console.log(`Communes pour département ${departement}:`, communes.length);
        res.json(communes);
    } catch (err) {
        console.error('Erreur communes:', err);
        res.status(500).json({ error: err.message });
    }
});

// Récupérer les ZD d'une commune (avec restrictions)
router.get('/zds', async (req, res) => {
    try {
        const { commune } = req.query;
        const user = req.session.user;
        
        console.log(`Récupération ZDs pour commune ${commune}, utilisateur:`, user?.username);
        
        if (!commune && !user?.code_commune) {
            console.log('Aucune commune spécifiée et utilisateur sans commune fixe');
            return res.json([]);
        }
        
        // Utiliser le service menageService
        const zds = await menageService.getZds(commune, user);
        
        console.log(`ZDs pour commune ${commune}:`, zds.length);
        res.json(zds);
    } catch (err) {
        console.error('Erreur ZDs:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;