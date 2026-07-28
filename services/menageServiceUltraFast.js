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
async function getZs(commune, user = null) {
  try {
    const communeValue = commune ? String(commune).trim() : '';

    console.log('================ getZs SERVICE ================');
    console.log('[getZs] commune reçue =', communeValue);
    console.log('[getZs] user =', {
      id: user?.id || null,
      username: user?.username || null,
      role: user?.role || null,
      code: user?.code || null
    });

    if (!communeValue) {
      console.log('[getZs] commune vide -> retour []');
      return [];
    }

    const sql = `
      SELECT DISTINCT TRIM(mo_zs) AS mo_zs
      FROM level1
      WHERE mo_zs IS NOT NULL
        AND TRIM(mo_zs) <> ''
        AND CHAR_LENGTH(TRIM(mo_zs)) >= 5
        AND LEFT(TRIM(mo_zs), 5) = :commune
      ORDER BY TRIM(mo_zs) ASC
    `;

    console.log('[getZs] SQL =', sql.trim());
    console.log('[getZs] replacements =', { commune: communeValue });

    const rows = await menageDB.query(sql, {
      replacements: { commune: communeValue },
      type: QueryTypes.SELECT
    });

    console.log('[getZs] nb lignes =', rows.length);
    console.log('[getZs] aperçu =', rows.slice(0, 10));

    return rows;
  } catch (err) {
    console.error('❌ Erreur menageService.getZs:', err);
    throw err;
  }
}
// Fonctions par défaut
function getDefaultStats() {
  return {
    totalMenages: 0,
    totalPopulation: 0,
    averageDeces: 0,
    dureInterviewMenage : 0,
    nbMenagesPlus10: 0,
    nbMenagesSolo: 0,
    populationRurale: 0,
    menagesEnumeres: 0,
    menagesDenombres: 0,
    menagesDenombresIncomplets: 0,
    menagesAjoutes : 0,
    menagesNexistePlus : 0,
    enmcd: { ecart: 0 },
    enmcdv: { ecart: 0 },
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
    
    return {
      totalMenages: Number(row.total_menages || 0),
      totalPopulation: Number(row.total_population || 0),
      averageDeces: Number(row.average_deces || 0),
      dureInterviewMenage : Number((row.duree_interview_menage / (row.total_menages))),
      nbMenagesPlus10: Number(row.nb_menages_plus_10 || 0),
      nbMenagesSolo: Number(row.nb_menages_solo || 0),
      populationRurale: Number(row.cas_refus || 0),
      menagesEnumeres: Number(row.menages_enumeres || 0),
      menagesDenombres: Number(row.menages_denombres || 0),
      menagesDenombresIncomplets: Number(row.menages_denombres_incomplets || 0),
      menagesAjoutes: Number(row.menages_ajoutes || 0),
      menagesNexistePlus: Number(row.menages_non_existe || 0),
      menagesSupprimes: Number(row.menages_supprimes || 0),

      menagesAttendus: Number(row.total_menages_attendu || 0),
      enmcd: { 
        ecart: Number(row.menages_enumeres || 0) - Number(row.menages_denombres || 0)
      },
      enmcdv: { 
        ecartCarto: Number(row.total_menages_attendu || 0) - Number(row.menages_denombres || 0)
      },
      cartographie: Number(row.population_carto || 0),
      collectee: Number(row.population_collectee || 0),
      tauxProgressionCollecte: Number(((row.menages_denombres / row.total_menages_attendu) * 100).toFixed(2))
          ,
      tailleMoyenneMenage:
        row.total_menages > 0
          ? Number((row.total_population / (row.total_menages - Number(row.cas_refus || 0))).toFixed(2))
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
      proportionEnfantsMoins5: Number(row.nb_enfants_moins_5),
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
    return +((row.menages_agricoles / (row.total_menages  - Number(row.cas_refus || 0)) ) * 100).toFixed(2);
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
    //return +(row.total_emigres / row.menages_avec_emigres).toFixed(2);
    return row.menages_avec_emigres;
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
    
    console.log(`getPyramideAges (ULTRA-FAST) exécutée en ${Date.now() - startTime}ms`);
    
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
                tm.code_region AS regionCode,
                tm.region AS regionName,
                COALESCE(zr.populationCarto, 0) AS populationCarto,
                SUM(tm.xm40) AS populationCollectee
            FROM tmenage tm
            LEFT JOIN (
                SELECT
                    SUBSTRING(zd_zd, 1, 1) AS code_region,
                    SUM(CAST(zd_pop AS UNSIGNED)) AS populationCarto
                FROM zd
                GROUP BY SUBSTRING(zd_zd, 1, 1)
            ) zr ON zr.code_region = tm.code_region
            GROUP BY tm.code_region, tm.region, zr.populationCarto
            ORDER BY tm.region ASC
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

/* async function getZds(commune, user = null) {
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
} */

async function getZdsByZs(zs, user = null) {
  if (!zs) return [];

  const cacheKey = `zds:zs${zs}:u${user?.id}`;

  return await cacheHelper.getOrSet(cacheKey, async () => {

    const sql = `
      SELECT DISTINCT TRIM(mo_zd) AS mo_zd
      FROM level1
      WHERE mo_zd IS NOT NULL
        AND TRIM(mo_zd) <> ''
        AND TRIM(mo_zs) = :zs  
      ORDER BY mo_zd ASC
    `;

    return await menageDB.query(sql, {
      replacements: { zs },
      type: QueryTypes.SELECT
    });

  }, CACHE_TTL.SELECTS);
}



/**
 * Récupère les agents (codes) associés à une ZD donnée
 * via la table user_zd (mo_zd, agent).
 * Retourne une chaîne "agent1 - agent2 - ..." ou '' si aucun agent.
 */
async function getAgentsByZd(zd) {
  if (!zd) return '';
  const cacheKey = `agents_zd:${zd}`;
  return await cacheHelper.getOrSet(cacheKey, async () => {
    const sql = `
      SELECT agent
      FROM user_zd
      WHERE mo_zd = :zd
      ORDER BY agent ASC
    `;
    const rows = await menageDB.query(sql, {
      replacements: { zd },
      type: QueryTypes.SELECT
    });
    if (!rows || rows.length === 0) return '';
    return rows.map(r => r.agent).filter(Boolean).join(' - ');
  }, CACHE_TTL.SELECTS);
}


/**
 * Récupère l'évolution cumulative de la collecte par jour
 * @param {Object} filters - { region, departement, commune, zd }
 * @param {Object} user - utilisateur connecté (pour les restrictions)
 * @returns {Array} [{ date, nbMenagesJour, populationJour, cumulMenages, cumulPopulation }]
 */
async function getEvolutionCollecte(filters = {}, user = null) {
  const cacheKey = generateCacheKey('evolution_collecte', filters, user);
  
  return await cacheHelper.getOrSet(cacheKey, async () => {
    const startTime = Date.now();
    const replacements = buildReplacements(filters, user);
    
    // Construction de la clause WHERE dynamique
    let whereClauses = [];
    whereClauses.push("m.meta_intro = 1");  // ménages valides
    whereClauses.push("m.xm11 IS NOT NULL");
    whereClauses.push("m.xm11 != ''");
    // Ajout : exclure les dates invalides
    whereClauses.push("STR_TO_DATE(m.xm11, '%Y%m%d') IS NOT NULL");
    
    if (replacements.region) {
      whereClauses.push("m.code_region = :region");
    }
    if (replacements.departement) {
      whereClauses.push("m.code_departement = :departement");
    }
    if (replacements.commune) {
      whereClauses.push("m.code_commune = :commune");
    }
    if (replacements.zd) {
      whereClauses.push("m.mo_zd = :zd");
    }
    
    const whereSql = whereClauses.join(' AND ');
    
    const sql = `
      SELECT 
        DATE_FORMAT(STR_TO_DATE(m.xm11, '%Y%m%d'), '%Y-%m-%d') AS date_collecte,
        COUNT(*) AS nb_menages_jour,
        COALESCE(SUM(m.xm40), 0) AS population_jour
      FROM tmenage m
      WHERE ${whereSql}
      GROUP BY date_collecte
      ORDER BY date_collecte ASC
    `;
    
    const rows = await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
    
    // Calcul des cumuls
    let cumulMenages = 0;
    let cumulPopulation = 0;
    const result = rows.map(row => {
      cumulMenages += Number(row.nb_menages_jour || 0);
      cumulPopulation += Number(row.population_jour || 0);
      return {
        date: row.date_collecte,
        nbMenagesJour: Number(row.nb_menages_jour || 0),
        populationJour: Number(row.population_jour || 0),
        cumulMenages,
        cumulPopulation
      };
    });
    
    console.log(`⚡ getEvolutionCollecte exécutée en ${Date.now() - startTime}ms`);
    return result;
  }, CACHE_TTL.STATS); // 10 minutes
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
  getZs,
  getZdsByZs,
  getAgentsByZd,
  getEvolutionCollecte
};