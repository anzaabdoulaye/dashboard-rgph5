// Dans votre fichier de routes (ex: routes/api.js)
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { QueryTypes } = require('sequelize');
const menageDB = require('../config/menageDB');
const { cacheHelper } = require('../config/redis');

// API pour récupérer les régions
router.get('/regions', async (req, res) => {
    try {
        const filePath = path.join(__dirname, '../geoJSON/RegionNiger.geojson');
        console.log('Lecture du fichier:', filePath);
        
        const data = await fs.readFile(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Erreur API regions:', error);
        res.status(500).json({ 
            error: 'Erreur de chargement',
            details: error.message 
        });
    }
});

// API pour récupérer les départements
router.get('/departements', async (req, res) => {
    try {
        const filePath = path.join(__dirname, '../geoJSON/DepartementNiger.geojson');
        console.log('Lecture du fichier:', filePath);
        
        const data = await fs.readFile(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Erreur API départements:', error);
        res.status(500).json({ 
            error: 'Erreur de chargement',
            details: error.message 
        });
    }
});

// 1. Pour les statistiques par région
router.get('/stats/regions', async (req, res) => {
    try {
        const sql = `
            SELECT
                code_region AS regionCode,
                region AS regionName,
                SUM(xm20) AS populationCarto,
                SUM(xm40) AS populationCollectee
            FROM tmenage
            GROUP BY code_region, region
            ORDER BY region ASC
        `;
        const rows = await menageDB.query(sql, { type: QueryTypes.SELECT });
        
        // Mapping des codes aux noms MAJUSCULES (comme dans le GeoJSON)
        const codeToUpperCaseName = {
            'NER001': 'AGADEZ',
            'NER002': 'DIFFA', 
            'NER003': 'DOSSO',
            'NER004': 'MARADI',
            'NER005': 'TAHOUA',
            'NER006': 'TILLABERI',
            'NER007': 'ZINDER',
            'NER008': 'NIAMEY'  // Note: dans votre GeoJSON, Niamey est NER008
        };
        
        const result = rows.map(r => {
            // Utiliser le mapping code -> nom MAJUSCULE
            const upperCaseName = codeToUpperCaseName[r.regionCode] || 
                                 (r.regionName ? r.regionName.toUpperCase().trim() : '');
            
            return {
                // Retourner les deux formats pour plus de flexibilité
                regionName: upperCaseName,           // "AGADEZ" (pour matching avec GeoJSON)
                regionDisplayName: r.regionName,     // "Agadez" (pour affichage)
                regionCode: r.regionCode,            // "NER001"
                populationCarto: Number(r.populationCarto || 0),
                populationCollectee: Number(r.populationCollectee || 0)
            };
        });
        
        // Log pour debug
        console.log('📊 Statistiques régions préparées:');
        result.forEach(r => {
            console.log(`  Code: ${r.regionCode} | GeoJSON: ${r.regionName} | Original: ${r.regionDisplayName}`);
            console.log(`    Carto: ${r.populationCarto} | Collectée: ${r.populationCollectee}`);
        });
        
        res.json(result);
        
    } catch (error) {
        console.error('❌ Erreur API régions:', error);
        res.status(500).json({ 
            error: 'Erreur serveur',
            details: error.message 
        });
    }
});

// 2. Pour les statistiques par département (à créer)
router.get('/stats/departements', async (req, res) => {
    try {
        const sql = `
            SELECT
                code_departement AS departementCode,
                departement AS departementName,
                region,
                SUM(xm20) AS populationCarto,
                SUM(xm40) AS populationCollectee
            FROM tmenage
            GROUP BY code_departement, departement, region
            ORDER BY region, departement ASC
        `;
        const rows = await menageDB.query(sql, { type: QueryTypes.SELECT });
        
        const result = rows.map(r => ({
            departement: r.departementName,
            region: r.region,
            populationCarto: Number(r.populationCarto || 0),
            populationCollectee: Number(r.populationCollectee || 0)
        }));
        
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;