// services/menageServiceUltraFast.js
// VERSION ULTRA-RAPIDE AVEC SUPPORT ZD
// Inclut le niveau Zone de Dénombrement (ZD) dans les tables agrégées

const { QueryTypes } = require('sequelize');
const menageDB = require('../config/menageDB');
const { cacheHelper } = require('../config/redis');

// Durées de cache en secondes
const CACHE_TTL = {
  STATS: 600,        // 10 minutes
  SELECTS: 1800,     // 30 minutes
  PYRAMIDE: 1800,    // 30 minutes
};

function normalizeFilterValue(value) {
    if (value === null || value === undefined) {
        return null;
    }
    const trimmed = String(value).trim();
    return trimmed === '' ? null : trimmed;
}

/* Helpers  */
function buildReplacements(filters = {}, user = null) {
  const replacements = {
    region: normalizeFilterValue(filters.region),
    departement: normalizeFilterValue(filters.departement),
    commune: normalizeFilterValue(filters.commune),
    zd: normalizeFilterValue(filters.zd)
  };
  
  // Appliquer les restrictions de l'utilisateur
  if (user && user.code) {
    const userRole = Array.isArray(user.roles) ? user.roles[0] : user.role;
    
    switch(userRole) {
      case 'ROLE_REGIONAL':
        if (user.code.length >= 1) {
          replacements.region = filters.region || user.code.substring(0, 1);
        }
        break;
      case 'ROLE_DEPARTEMENTAL':
        if (user.code.length >= 3) {
          replacements.region = filters.region || user.code.substring(0, 1);
          replacements.departement = filters.departement || user.code.substring(0, 3);
        }
        break;
      case 'ROLE_COMMUNAL':
        if (user.code.length >= 5) {
          replacements.region = filters.region || user.code.substring(0, 1);
          replacements.departement = filters.departement || user.code.substring(0, 3);
          replacements.commune = filters.commune || user.code;
        }
        break;
      // Note: Si vous avez un rôle ZD, ajoutez-le ici
    }
  }
  
  return replacements;
}

// Générer une clé de cache unique
function generateCacheKey(prefix, filters, user) {
  const userKey = user ? `u${user.id}_${user.role}` : 'nouser';
  const filterKey = Object.entries(filters)
    .filter(([_, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${k}:${v}`)
    .join('_') || 'all';
  
  return `${prefix}:${userKey}:${filterKey}`;
}

// Fonctions par défaut
function getDefaultStats() {
  return {
    totalMenages: 0,
    totalPopulation: 0,
    averageDeces: 0,
    nbMenagesPlus10: 0,
    nbMenagesSolo: 0,
    populationRurale: 0,
    menagesEnumeres: 0,
    menagesDenombres: 0,
    enmcd: { ecart: 0 },
    cartographie: 0,
    collectee: 0,
    tauxProgressionCollecte: 0,
    tailleMoyenneMenage: 0,
  };
}

function getDefaultPopulationStats() {
  return {
    hommes: 0,
    femmes: 0,
    total: 0,
    proportionEnfantsMoins5: 0,
    RRAVI: 0,
    rapportMasculinite: 0,
    PA49: 0
  };
}

/* Stats combinées sur tmenage - VERSION ULTRA-RAPIDE  */
async function getMainStats(filters = {}, user = null) {
  const cacheKey = generateCacheKey('stats_main_ultra', filters, user);
  
  return await cacheHelper.getOrSet(cacheKey, async () => {
    const startTime = Date.now();
    const replacements = buildReplacements(filters, user);
    
    let row;
    
    // PRIORITY 1: ZD
    if (replacements.zd) {
      const sql = `SELECT * FROM stats_par_zd WHERE mo_zd = :zd LIMIT 1`;
      const rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
      row = rows[0];
    } 
    // PRIORITY 2: Commune
    else if (replacements.commune) {
      const sql = `SELECT * FROM stats_par_commune WHERE code_commune = :commune LIMIT 1`;
      const rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
      row = rows[0];
    } 
    // PRIORITY 3: Département
    else if (replacements.departement) {
      const sql = `SELECT * FROM stats_par_departement WHERE code_departement = :departement LIMIT 1`;
      const rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
      row = rows[0];
    } 
    // PRIORITY 4: Région
    else if (replacements.region) {
      const sql = `SELECT * FROM stats_par_region WHERE code_region = :region LIMIT 1`;
      const rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
      row = rows[0];
    } 
    // PRIORITY 5: Nationale
    else {
      const sql = `SELECT * FROM stats_nationales LIMIT 1`;
      const rows = await menageDB.query(sql, { type: QueryTypes.SELECT });
      row = rows[0];
    }
    
    console.log(`⚡ getMainStats (ULTRA-FAST) exécutée en ${Date.now() - startTime}ms`);
    
    if (!row) {
      return getDefaultStats();
    }

    const totalDeces = Number(row.average_deces || 0);
    
    return {
      totalMenages: Number(row.total_menages || 0),
      totalPopulation: Number(row.total_population || 0),
      averageDeces: row.total_menages > 0 
          ? Number(((totalDeces / row.total_menages) * 100 ).toFixed(2)) 
          : 0,
      nbMenagesPlus10: Number(row.nb_menages_plus_10 || 0),
      nbMenagesSolo: Number(row.nb_menages_solo || 0),
      populationRurale: Number(row.population_rurale || 0),
      menagesEnumeres: Number(row.menages_enumeres || 0),
      menagesDenombres: Number(row.menages_denombres || 0),
      enmcd: { 
        ecart: Number(row.menages_enumeres || 0) - Number(row.menages_denombres || 0)
      },
      cartographie: Number(row.population_carto || 0),
      collectee: Number(row.population_collectee || 0),
      tauxProgressionCollecte:
        row.population_carto > 0
          ? Number(((row.population_collectee / row.population_carto) * 100).toFixed(2))
          : 0,
      tailleMoyenneMenage:
        row.total_menages > 0
          ? Number((row.total_population / row.total_menages).toFixed(2))
          : 0,
    };
  }, CACHE_TTL.STATS);
}

/* Stats combinées sur tcaracteristique - VERSION ULTRA-RAPIDE  */
async function getPopulationStatsCombined(filters = {}, user = null) {
  const cacheKey = generateCacheKey('stats_population_ultra', filters, user);
  
  return await cacheHelper.getOrSet(cacheKey, async () => {
    const startTime = Date.now();
    const replacements = buildReplacements(filters, user);
    
    let row;
    
    if (replacements.zd) {
      const sql = `SELECT * FROM stats_par_zd WHERE mo_zd = :zd LIMIT 1`;
      const rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
      row = rows[0];
    } else if (replacements.commune) {
      const sql = `SELECT * FROM stats_par_commune WHERE code_commune = :commune LIMIT 1`;
      const rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
      row = rows[0];
    } else if (replacements.departement) {
      const sql = `SELECT * FROM stats_par_departement WHERE code_departement = :departement LIMIT 1`;
      const rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
      row = rows[0];
    } else if (replacements.region) {
      const sql = `SELECT * FROM stats_par_region WHERE code_region = :region LIMIT 1`;
      const rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
      row = rows[0];
    } else {
      const sql = `SELECT * FROM stats_nationales LIMIT 1`;
      const rows = await menageDB.query(sql, { type: QueryTypes.SELECT });
      row = rows[0];
    }
    
    console.log(`⚡ getPopulationStatsCombined (ULTRA-FAST) exécutée en ${Date.now() - startTime}ms`);
    
    if (!row) {
      return getDefaultPopulationStats();
    }

    const nbResidentsAbsents = Number(row.nb_residents_absents || 0);
    const nbVisiteurs = Number(row.nb_visiteurs || 0);
    const hommes = Number(row.hommes || 0);
    const femmes = Number(row.femmes || 0);
    const nbNaissancesVivantes = Number(row.nb_naissances_vivantes || 0);
    const nbFemmes15_49 = Number(row.nb_femmes_15_49 || 0);
    const total = hommes + femmes;

    return {
      hommes: hommes,
      femmes: femmes,
      total: total,
      proportionEnfantsMoins5: total === 0 ? 0 : +((row.nb_enfants_moins_5 / total) * 100).toFixed(2),
      RRAVI: nbVisiteurs > 0 ? Number((nbResidentsAbsents / nbVisiteurs).toFixed(2)) : 0,
      rapportMasculinite: femmes > 0 ? Number(((hommes / femmes) * 100).toFixed(2)) : 0,
      PA49: nbFemmes15_49 > 0 ? Number((nbNaissancesVivantes / nbFemmes15_49).toFixed(2)) : 0
    };
  }, CACHE_TTL.STATS);
}

/* Proportion de ménages agricoles - VERSION ULTRA-RAPIDE  */
async function getProportionMenagesAgricoles(filters = {}, user = null) {
  const cacheKey = generateCacheKey('stats_agricoles_ultra', filters, user);
  
  return await cacheHelper.getOrSet(cacheKey, async () => {
    const replacements = buildReplacements(filters, user);
    let row;
    
    if (replacements.zd) {
      const sql = `SELECT * FROM stats_par_zd WHERE mo_zd = :zd LIMIT 1`;
      const rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
      row = rows[0];
    } else if (replacements.commune) {
      const sql = `SELECT * FROM stats_par_commune WHERE code_commune = :commune LIMIT 1`;
      const rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
      row = rows[0];
    } else if (replacements.departement) {
      const sql = `SELECT * FROM stats_par_departement WHERE code_departement = :departement LIMIT 1`;
      const rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
      row = rows[0];
    } else if (replacements.region) {
      const sql = `SELECT * FROM stats_par_region WHERE code_region = :region LIMIT 1`;
      const rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
      row = rows[0];
    } else {
      const sql = `SELECT * FROM stats_nationales LIMIT 1`;
      const rows = await menageDB.query(sql, { type: QueryTypes.SELECT });
      row = rows[0];
    }
    
    if (!row || row.total_menages === 0) return 0;
    return +((row.menages_agricoles / row.total_menages) * 100).toFixed(2);
  }, CACHE_TTL.STATS);
}

/* Moyenne des émigrés par ménage - VERSION ULTRA-RAPIDE  */
async function getAverageEmigresPerMenage(filters = {}, user = null) {
  const cacheKey = generateCacheKey('stats_emigres_ultra', filters, user);
  
  return await cacheHelper.getOrSet(cacheKey, async () => {
    const replacements = buildReplacements(filters, user);
    let row;
    
    if (replacements.zd) {
      const sql = `SELECT * FROM stats_par_zd WHERE mo_zd = :zd LIMIT 1`;
      const rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
      row = rows[0];
    } else if (replacements.commune) {
      const sql = `SELECT * FROM stats_par_commune WHERE code_commune = :commune LIMIT 1`;
      const rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
      row = rows[0];
    } else if (replacements.departement) {
      const sql = `SELECT * FROM stats_par_departement WHERE code_departement = :departement LIMIT 1`;
      const rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
      row = rows[0];
    } else if (replacements.region) {
      const sql = `SELECT * FROM stats_par_region WHERE code_region = :region LIMIT 1`;
      const rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
      row = rows[0];
    } else {
      const sql = `SELECT * FROM stats_nationales LIMIT 1`;
      const rows = await menageDB.query(sql, { type: QueryTypes.SELECT });
      row = rows[0];
    }
    
    if (!row || row.menages_avec_emigres === 0) return 0;
    return +(row.total_emigres / row.menages_avec_emigres).toFixed(2);
  }, CACHE_TTL.STATS);
}

/* Pyramide des âges - VERSION ULTRA-RAPIDE  */
async function getPyramideAges(filters = {}, user = null) {
  const cacheKey = generateCacheKey('pyramide_ages_ultra', filters, user);
  
  return await cacheHelper.getOrSet(cacheKey, async () => {
    const startTime = Date.now();
    const replacements = buildReplacements(filters, user);
    
    let table = 'pyramide_ages_nationale';
    let whereClause = '';
    
    if (replacements.zd) {
      table = 'pyramide_ages_zd';
      whereClause = 'WHERE mo_zd = :zd';
    } else if (replacements.commune) {
      table = 'pyramide_ages_commune';
      whereClause = 'WHERE code_commune = :commune';
    } else if (replacements.departement) {
      table = 'pyramide_ages_departement';
      whereClause = 'WHERE code_departement = :departement';
    } else if (replacements.region) {
      table = 'pyramide_ages_region';
      whereClause = 'WHERE code_region = :region';
    }
    
    const sql = `
      SELECT age_range, hommes, femmes 
      FROM ${table} 
      ${whereClause}
      ORDER BY FIELD(age_range,'0-4','5-9','10-14','15-19','20-24','25-29','30-34','35-39','40-44','45-49','50-54','55-59','60-64','65-69','70-74','75-79','80+')
    `;
    
    const rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
    
    console.log(`⚡ getPyramideAges (ULTRA-FAST) exécutée en ${Date.now() - startTime}ms`);
    
    return rows.map(r => ({ 
      age: r.age_range, 
      hommes: Number(r.hommes || 0), 
      femmes: Number(r.femmes || 0) 
    }));
  }, CACHE_TTL.PYRAMIDE);
}

async function getPopulationByRegion() {
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
  return rows.map(r => ({
    region: r.regionName,
    carto: Number(r.populationCarto || 0),
    collectee: Number(r.populationCollectee || 0)
  }));
}
/* Select dynamiques (Zones géographiques)  */

async function getRegions(user = null) {
  const cacheKey = user ? `regions:u${user.id}_${user.role}` : 'regions:all';
  return await cacheHelper.getOrSet(cacheKey, async () => {
    let sql = `SELECT DISTINCT code_region, region FROM tmenage`;
    const replacements = {};
    if (user && user.code && user.code !== 'GLOBAL') {
      const userRole = Array.isArray(user.roles) ? user.roles[0] : user.role;
      if (['ROLE_REGIONAL', 'ROLE_DEPARTEMENTAL', 'ROLE_COMMUNAL'].includes(userRole)) {
        sql += ` WHERE code_region = :code_region`;
        replacements.code_region = user.code.substring(0, 1);
      }
    }
    sql += ` ORDER BY region ASC`;
    return await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
  }, CACHE_TTL.SELECTS);
}

async function getDepartements(region, user = null) {
  const userRole = user ? (Array.isArray(user.roles) ? user.roles[0] : user.role) : null;
  const hasRestriction = user && user.code && ['ROLE_DEPARTEMENTAL', 'ROLE_COMMUNAL'].includes(userRole);
  
  if (!region && !hasRestriction) return [];
  const cacheKey = `departements:r${region}:u${user?.id}`;
  
  return await cacheHelper.getOrSet(cacheKey, async () => {
    let sql = `SELECT DISTINCT code_departement, departement FROM tmenage WHERE 1=1`;
    const replacements = {};
    
    if (region) {
      sql += ` AND code_region = :region`;
      replacements.region = region;
    } else if (user && user.code && user.code.length >= 1) {
      sql += ` AND code_region = :code_region`;
      replacements.code_region = user.code.substring(0, 1);
    }
    if (hasRestriction && user.code.length >= 3) {
      sql += ` AND code_departement = :code_departement`;
      replacements.code_departement = user.code.substring(0, 3);
    }
    sql += ` ORDER BY departement ASC`;
    return await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
  }, CACHE_TTL.SELECTS);
}

async function getCommunes(departement, user = null) {
  const userRole = user ? (Array.isArray(user.roles) ? user.roles[0] : user.role) : null;
  const hasRestriction = user && user.code && userRole === 'ROLE_COMMUNAL';
  
  if (!departement && !hasRestriction && !(user && user.code && ['ROLE_DEPARTEMENTAL'].includes(userRole))) return [];
  const cacheKey = `communes:d${departement}:u${user?.id}`;
  
  return await cacheHelper.getOrSet(cacheKey, async () => {
    let sql = `SELECT DISTINCT code_commune, commune FROM tmenage WHERE 1=1`;
    const replacements = {};
    
    if (departement) {
      sql += ` AND code_departement = :departement`;
      replacements.departement = departement;
    } else if (user && user.code && user.code.length >= 3) {
      sql += ` AND code_departement = :code_departement`;
      replacements.code_departement = user.code.substring(0, 3);
    }
    if (hasRestriction && user.code.length === 5) {
      sql += ` AND code_commune = :code_commune`;
      replacements.code_commune = user.code;
    }
    sql += ` ORDER BY commune ASC`;
    return await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
  }, CACHE_TTL.SELECTS);
}

async function getZds(commune, user = null) {
  const userRole = user ? (Array.isArray(user.roles) ? user.roles[0] : user.role) : null;
  const hasRestriction = user && user.code && userRole === 'ROLE_COMMUNAL';
  
  if (!commune && !hasRestriction) return [];
  const cacheKey = `zds:c${commune}:u${user?.id}`;
  
  return await cacheHelper.getOrSet(cacheKey, async () => {
    // Note: Pour les listes déroulantes, on continue d'interroger tmenage (distinct)
    // car c'est performant avec les index existants et garantit l'intégrité des filtres
    let sql = `SELECT DISTINCT mo_zd FROM tmenage WHERE 1=1`;
    const replacements = {};
    
    if (commune) {
      sql += ` AND code_commune = :commune`;
      replacements.commune = commune;
    } else if (user && user.code && user.code.length === 5) {
      sql += ` AND code_commune = :code_commune`;
      replacements.code_commune = user.code;
    }
    
    sql += ` ORDER BY mo_zd ASC`;
    return await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
  }, CACHE_TTL.SELECTS);
}

/* Export  */
module.exports = {
  getMainStats,
  getPopulationStatsCombined,
  getProportionMenagesAgricoles,
  getAverageEmigresPerMenage,
  getPyramideAges,
  getPopulationByRegion,
  getRegions,
  getDepartements,
  getCommunes,
  getZds
};