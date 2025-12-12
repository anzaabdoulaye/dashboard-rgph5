// services/menageServiceUltraFast.js
// VERSION ULTRA-RAPIDE utilisant les tables pré-agrégées

const { QueryTypes } = require('sequelize');
const menageDB = require('../config/menageDB');
const { cacheHelper } = require('../config/redis');

// Durées de cache en secondes (plus longues car données pré-calculées)
const CACHE_TTL = {
  STATS: 600,        // 10 minutes pour les statistiques
  SELECTS: 1800,     // 30 minutes pour les listes de sélection
  PYRAMIDE: 1800,    // 30 minutes pour la pyramide des âges
};

/*  Helpers  */
function buildReplacements(filters = {}, user = null) {
  const replacements = {
    region: filters.region ?? null,
    departement: filters.departement ?? null,
    commune: filters.commune ?? null,
    zd: filters.zd ?? null
  };
  
  // Appliquer les restrictions de l'utilisateur selon son rôle
  if (user && user.code) {
    const userRole = Array.isArray(user.roles) ? user.roles[0] : user.role;
    
    switch(userRole) {
      case 'ROLE_REGIONAL':
        // Pour le rôle régional, extraire le code région (1er caractère)
        if (user.code.length >= 1) {
          replacements.region = filters.region || user.code.substring(0, 1);
        }
        break;
        
      case 'ROLE_DEPARTEMENTAL':
        // Pour le rôle départemental, extraire région et département (3 premiers caractères)
        if (user.code.length >= 3) {
          replacements.region = filters.region || user.code.substring(0, 1);
          replacements.departement = filters.departement || user.code.substring(0, 3);
        }
        break;
        
      case 'ROLE_COMMUNAL':
        // Pour le rôle communal, utiliser le code complet (5 caractères)
        if (user.code.length === 5) {
          replacements.region = filters.region || user.code.substring(0, 1);
          replacements.departement = filters.departement || user.code.substring(0, 3);
          replacements.commune = filters.commune || user.code;
        }
        break;
        
      case 'ROLE_GLOBAL':
      default:
        // Pour le rôle global, utiliser uniquement les filtres fournis (aucune restriction)
        break;
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

/*  Stats combinées sur tmenage - VERSION ULTRA-RAPIDE  */
async function getMainStats(filters = {}, user = null) {
  const cacheKey = generateCacheKey('stats_main_ultra', filters, user);
  
  return await cacheHelper.getOrSet(cacheKey, async () => {
    const startTime = Date.now();
    const replacements = buildReplacements(filters, user);
    
    let row;
    
    // Déterminer quelle table pré-agrégée utiliser
    if (replacements.commune) {
      // Stats par commune
      const sql = `
        SELECT * FROM stats_par_commune
        WHERE code_commune = :commune
        LIMIT 1
      `;
      const rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
      row = rows[0];
    } else if (replacements.departement) {
      // Stats par département
      const sql = `
        SELECT * FROM stats_par_departement
        WHERE code_departement = :departement
        LIMIT 1
      `;
      const rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
      row = rows[0];
    } else if (replacements.region) {
      // Stats par région
      const sql = `
        SELECT * FROM stats_par_region
        WHERE code_region = :region
        LIMIT 1
      `;
      const rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
      row = rows[0];
    } else {
      // Stats nationales
      const sql = `SELECT * FROM stats_nationales LIMIT 1`;
      const rows = await menageDB.query(sql, { type: QueryTypes.SELECT });
      row = rows[0];
    }
    
    const duration = Date.now() - startTime;
    console.log(`⚡ getMainStats (ULTRA-FAST) exécutée en ${duration}ms`);
    
    if (!row) {
      console.warn('⚠️  Aucune donnée trouvée dans les tables pré-agrégées');
      return getDefaultStats();
    }
    
    return {
      totalMenages: Number(row.total_menages || 0),
      totalPopulation: Number(row.total_population || 0),
      averageDeces: 0, // Non disponible dans les tables agrégées
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

/*  Stats combinées sur tcaracteristique - VERSION ULTRA-RAPIDE  */
async function getPopulationStatsCombined(filters = {}, user = null) {
  const cacheKey = generateCacheKey('stats_population_ultra', filters, user);
  
  return await cacheHelper.getOrSet(cacheKey, async () => {
    const startTime = Date.now();
    const replacements = buildReplacements(filters, user);
    
    let row;
    
    // Déterminer quelle table pré-agrégée utiliser
    if (replacements.commune) {
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
    
    const duration = Date.now() - startTime;
    console.log(`⚡ getPopulationStatsCombined (ULTRA-FAST) exécutée en ${duration}ms`);
    
    if (!row) {
      console.warn('⚠️  Aucune donnée trouvée dans les tables pré-agrégées');
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

/*  Proportion de ménages agricoles - VERSION ULTRA-RAPIDE  */
async function getProportionMenagesAgricoles(filters = {}, user = null) {
  const cacheKey = generateCacheKey('stats_agricoles_ultra', filters, user);
  
  return await cacheHelper.getOrSet(cacheKey, async () => {
    const startTime = Date.now();
    const replacements = buildReplacements(filters, user);
    
    let row;
    
    if (replacements.commune) {
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
    
    const duration = Date.now() - startTime;
    console.log(`⚡ getProportionMenagesAgricoles (ULTRA-FAST) exécutée en ${duration}ms`);
    
    if (!row || row.total_menages === 0) {
      return 0;
    }
    
    const proportion = (row.menages_agricoles / row.total_menages) * 100;
    return +proportion.toFixed(2);
  }, CACHE_TTL.STATS);
}

/*  Moyenne des émigrés par ménage - VERSION ULTRA-RAPIDE  */
async function getAverageEmigresPerMenage(filters = {}, user = null) {
  const cacheKey = generateCacheKey('stats_emigres_ultra', filters, user);
  
  return await cacheHelper.getOrSet(cacheKey, async () => {
    const startTime = Date.now();
    const replacements = buildReplacements(filters, user);
    
    let row;
    
    if (replacements.commune) {
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
    
    const duration = Date.now() - startTime;
    console.log(`⚡ getAverageEmigresPerMenage (ULTRA-FAST) exécutée en ${duration}ms`);
    
    if (!row || row.menages_avec_emigres === 0) {
      return 0;
    }
    
    const average = row.total_emigres / row.menages_avec_emigres;
    return +average.toFixed(2);
  }, CACHE_TTL.STATS);
}

/*  Pyramide des âges - VERSION ULTRA-RAPIDE  */
async function getPyramideAges(filters = {}, user = null) {
  const cacheKey = generateCacheKey('pyramide_ages_ultra', filters, user);
  
  return await cacheHelper.getOrSet(cacheKey, async () => {
    const startTime = Date.now();
    const replacements = buildReplacements(filters, user);
    
    let rows;
    
    // Déterminer quelle table pré-agrégée utiliser
    if (replacements.commune) {
      const sql = `
        SELECT age_range, hommes, femmes 
        FROM pyramide_ages_commune 
        WHERE code_commune = :commune
        ORDER BY FIELD(age_range,'0-4','5-9','10-14','15-19','20-24','25-29','30-34','35-39','40-44','45-49','50-54','55-59','60-64','65-69','70-74','75-79','80+')
      `;
      rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
    } else if (replacements.departement) {
      const sql = `
        SELECT age_range, hommes, femmes 
        FROM pyramide_ages_departement 
        WHERE code_departement = :departement
        ORDER BY FIELD(age_range,'0-4','5-9','10-14','15-19','20-24','25-29','30-34','35-39','40-44','45-49','50-54','55-59','60-64','65-69','70-74','75-79','80+')
      `;
      rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
    } else if (replacements.region) {
      const sql = `
        SELECT age_range, hommes, femmes 
        FROM pyramide_ages_region 
        WHERE code_region = :region
        ORDER BY FIELD(age_range,'0-4','5-9','10-14','15-19','20-24','25-29','30-34','35-39','40-44','45-49','50-54','55-59','60-64','65-69','70-74','75-79','80+')
      `;
      rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
    } else {
      const sql = `
        SELECT age_range, hommes, femmes 
        FROM pyramide_ages_nationale
        ORDER BY FIELD(age_range,'0-4','5-9','10-14','15-19','20-24','25-29','30-34','35-39','40-44','45-49','50-54','55-59','60-64','65-69','70-74','75-79','80+')
      `;
      rows = await menageDB.query(sql, { type: QueryTypes.SELECT });
    }
    
    const duration = Date.now() - startTime;
    console.log(`⚡ getPyramideAges (ULTRA-FAST) exécutée en ${duration}ms`);
    
    return rows.map(r => ({ 
      age: r.age_range, 
      hommes: Number(r.hommes || 0), 
      femmes: Number(r.femmes || 0) 
    }));
  }, CACHE_TTL.PYRAMIDE);
}

/*  Select dynamiques avec restrictions utilisateur  */
async function getRegions(user = null) {
  const cacheKey = user ? `regions:u${user.id}_${user.role}` : 'regions:all';
  
  return await cacheHelper.getOrSet(cacheKey, async () => {
    let sql = `SELECT DISTINCT code_region, region FROM tmenage`;
    const replacements = {};
    
    // Si l'utilisateur a un rôle restreint, filtrer par sa région
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
  // Vérifier si on a une région ou si l'utilisateur a un département restreint
  const userRole = user ? (Array.isArray(user.roles) ? user.roles[0] : user.role) : null;
  const hasDepartementRestriction = user && user.code && 
    ['ROLE_DEPARTEMENTAL', 'ROLE_COMMUNAL'].includes(userRole);
  
  if (!region && !hasDepartementRestriction) return [];
  
  const cacheKey = `departements:r${region || 'null'}:u${user?.id || 'null'}_${userRole || 'null'}`;
  
  return await cacheHelper.getOrSet(cacheKey, async () => {
    let sql = `SELECT DISTINCT code_departement, departement FROM tmenage WHERE 1=1`;
    const replacements = {};
    
    if (region) {
      sql += ` AND code_region = :region`;
      replacements.region = region;
    } else if (user && user.code && user.code !== 'GLOBAL' && user.code.length >= 1) {
      // Appliquer la restriction par région de l'utilisateur
      sql += ` AND code_region = :code_region`;
      replacements.code_region = user.code.substring(0, 1);
    }
    
    // Si l'utilisateur a un rôle départemental ou communal, filtrer par son département
    if (hasDepartementRestriction && user.code.length >= 3) {
      sql += ` AND code_departement = :code_departement`;
      replacements.code_departement = user.code.substring(0, 3);
    }
    
    sql += ` ORDER BY departement ASC`;
    
    return await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
  }, CACHE_TTL.SELECTS);
}

async function getCommunes(departement, user = null) {
  // Vérifier si on a un département ou si l'utilisateur a une commune restreinte
  const userRole = user ? (Array.isArray(user.roles) ? user.roles[0] : user.role) : null;
  const hasCommuneRestriction = user && user.code && userRole === 'ROLE_COMMUNAL';
  
  if (!departement && !hasCommuneRestriction && 
      !(user && user.code && ['ROLE_DEPARTEMENTAL'].includes(userRole))) return [];
  
  const cacheKey = `communes:d${departement || 'null'}:u${user?.id || 'null'}_${userRole || 'null'}`;
  
  return await cacheHelper.getOrSet(cacheKey, async () => {
    let sql = `SELECT DISTINCT code_commune, commune FROM tmenage WHERE 1=1`;
    const replacements = {};
    
    if (departement) {
      sql += ` AND code_departement = :departement`;
      replacements.departement = departement;
    } else if (user && user.code && user.code.length >= 3) {
      // Appliquer la restriction par département de l'utilisateur
      sql += ` AND code_departement = :code_departement`;
      replacements.code_departement = user.code.substring(0, 3);
    }
    
    // Si l'utilisateur a un rôle communal, filtrer par sa commune
    if (hasCommuneRestriction && user.code.length === 5) {
      sql += ` AND code_commune = :code_commune`;
      replacements.code_commune = user.code;
    }
    
    sql += ` ORDER BY commune ASC`;
    
    return await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
  }, CACHE_TTL.SELECTS);
}

async function getZds(commune, user = null) {
  // Vérifier si on a une commune ou si l'utilisateur a une commune restreinte
  const userRole = user ? (Array.isArray(user.roles) ? user.roles[0] : user.role) : null;
  const hasCommuneRestriction = user && user.code && userRole === 'ROLE_COMMUNAL';
  
  if (!commune && !hasCommuneRestriction) return [];
  
  const cacheKey = `zds:c${commune || 'null'}:u${user?.id || 'null'}_${userRole || 'null'}`;
  
  return await cacheHelper.getOrSet(cacheKey, async () => {
    let sql = `SELECT DISTINCT mo_zd FROM tmenage WHERE 1=1`;
    const replacements = {};
    
    if (commune) {
      sql += ` AND code_commune = :commune`;
      replacements.commune = commune;
    } else if (user && user.code && user.code.length === 5) {
      // Appliquer la restriction par commune de l'utilisateur
      sql += ` AND code_commune = :code_commune`;
      replacements.code_commune = user.code;
    }
    
    sql += ` ORDER BY mo_zd ASC`;
    
    return await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
  }, CACHE_TTL.SELECTS);
}

// Fonctions par défaut en cas de données manquantes
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

/*  Export  */
module.exports = {
  getMainStats,
  getPopulationStatsCombined,
  getProportionMenagesAgricoles,
  getAverageEmigresPerMenage,
  getPyramideAges,
  getRegions,
  getDepartements,
  getCommunes,
  getZds
};
