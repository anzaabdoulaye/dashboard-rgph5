#!/usr/bin/env node
/**
 * Script de warm-up du cache Redis
 * Pré-charge les données les plus fréquemment utilisées
 * À exécuter au démarrage du serveur
 */

require('dotenv').config();
const menageService = require('../services/menageServiceUltraFast');
const { cacheHelper } = require('../config/redis');

console.log('🔥 Préchauffage du cache Redis...');
console.log('====================================');

async function warmupCache() {
    const startTime = Date.now();
    
    try {
        console.log('📊 Chargement des statistiques nationales...');
        
        // Stats nationales
        await menageService.getMainStats({}, null);
        await menageService.getPopulationStatsCombined({}, null);
        await menageService.getProportionMenagesAgricoles({}, null);
        await menageService.getAverageEmigresPerMenage({}, null);
        await menageService.getPyramideAges({}, null);
        
        console.log('✅ Statistiques nationales chargées');
        
        // Listes de sélection
        console.log('📋 Chargement des listes de sélection...');
        await menageService.getRegions(null);
        console.log('✅ Régions chargées');
        
        // Optionnel: pré-charger les stats par région
        // const regions = await menageService.getRegions(null);
        // for (const region of regions) {
        //     console.log(`📊 Chargement des stats pour la région: ${region.region}`);
        //     await menageService.getMainStats({ region: region.code_region }, null);
        //     await menageService.getPopulationStatsCombined({ region: region.code_region }, null);
        // }
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log('');
        console.log('====================================');
        console.log('🎉 Cache préchauffé avec succès!');
        console.log(`⏱️  Durée: ${duration} secondes`);
        console.log('====================================');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors du préchauffage du cache:', error);
        process.exit(1);
    }
}

// Délai de 2 secondes pour laisser Redis démarrer
setTimeout(() => {
    warmupCache();
}, 2000);
