// services/menageService.js
const { QueryTypes } = require('sequelize');
const menageDB = require('../config/menageDB'); // Sequelize instance

/*  Helpers  */
function buildReplacements(filters = {}, user = null) {
  const replacements = {
    region: filters.region ?? null,
    departement: filters.departement ?? null,
    commune: filters.commune ?? null,
    zd: filters.zd ?? null
  };
  
  // Appliquer les restrictions de l'utilisateur si fourni
  if (user) {
    if (user.code_region) {
      replacements.region = user.code_region;
    }
    if (user.code_departement) {
      replacements.departement = user.code_departement;
    }
    // Pour les utilisateurs communaux, on pourrait aussi fixer la commune
    if (user.code_commune) {
      replacements.commune = user.code_commune;
    }
  }
  
  return replacements;
}

// Clause WHERE globale avec gestion utilisateur
function buildBaseWhere(user = null) {
  let whereClause = 'WHERE 1=1';
  
  // Ajouter les restrictions fixes basées sur le rôle/utilisateur
  if (user) {
    if (user.code_region) {
      whereClause += ` AND m.code_region = '${user.code_region}'`;
    }
    if (user.code_departement) {
      whereClause += ` AND m.code_departement = '${user.code_departement}'`;
    }
    if (user.code_commune) {
      whereClause += ` AND m.code_commune = '${user.code_commune}'`;
    }
  }
  
  // Ajouter les filtres dynamiques (pour les sélections dans l'interface)
  whereClause += `
    AND (m.code_region = COALESCE(:region, m.code_region))
    AND (m.code_departement = COALESCE(:departement, m.code_departement))
    AND (m.code_commune = COALESCE(:commune, m.code_commune))
    AND (m.mo_zd = COALESCE(:zd, m.mo_zd))
  `;
  
  return whereClause;
}

/*  Stats combinées sur tmenage  */
async function getMainStats(filters = {}, user = null) {
  const baseWhere = buildBaseWhere(user);
  const sql = `
    SELECT
      COUNT(*) AS totalMenages,
      COALESCE(SUM(m.nb_residents),0) AS totalPopulation,
      COALESCE(AVG(m.xm41),0) AS averageDeces,
      SUM(CASE WHEN m.xm40 > 10 THEN 1 ELSE 0 END) AS nbMenagesPlus10,
      SUM(CASE WHEN m.xm40 = 1 THEN 1 ELSE 0 END) AS nbMenagesSolo,
      SUM(CASE WHEN m.xm01 = 2 THEN 1 ELSE 0 END) AS populationRurale,
      SUM(CASE WHEN m.xm30 > 0 THEN 1 ELSE 0 END) AS menagesEnumeres,
      SUM(CASE WHEN m.xm13 = 1 THEN 1 ELSE 0 END) AS menagesDenombres,
      SUM(CASE WHEN m.xm20 > 0 THEN 1 ELSE 0 END) - SUM(CASE WHEN m.xm13 = 1 THEN 1 ELSE 0 END) AS ecartCartoDenombre,
      SUM(m.xm20) AS populationCarto,
      SUM(m.xm40) AS populationCollectee
    FROM tmenage m
    ${baseWhere}
  `;
  const replacements = buildReplacements(filters, user);
  const row = (await menageDB.query(sql, { replacements, type: QueryTypes.SELECT }))[0];
  
  return {
    totalMenages: Number(row.totalMenages || 0),
    totalPopulation: Number(row.totalPopulation || 0),
    averageDeces: Number(row.averageDeces || 0),
    nbMenagesPlus10: Number(row.nbMenagesPlus10 || 0),
    nbMenagesSolo: Number(row.nbMenagesSolo || 0),
    populationRurale: Number(row.populationRurale || 0),
    menagesEnumeres: Number(row.menagesEnumeres || 0),
    menagesDenombres: Number(row.menagesDenombres || 0),
    enmcd: { ecart: Number(row.ecartCartoDenombre || 0) },
    cartographie: Number(row.populationCarto || 0),
    collectee: Number(row.populationCollectee || 0),
    tauxProgressionCollecte:
      row.populationCarto > 0
        ? Number(((row.populationCollectee / row.populationCarto) * 100).toFixed(2))
        : 0,
    tailleMoyenneMenage:
      row.totalMenages > 0
        ? Number((row.totalPopulation / row.totalMenages).toFixed(2))
        : 0,
  };
}

/*  Stats combinées sur tcaracteristique  */
async function getPopulationStatsCombined(filters = {}, user = null) {
  const baseWhere = buildBaseWhere(user);
  const sql = `
    SELECT
      COALESCE(SUM(CASE WHEN c.c03=1 THEN 1 ELSE 0 END),0) AS hommes,
      COALESCE(SUM(CASE WHEN c.c03=2 THEN 1 ELSE 0 END),0) AS femmes,
      COALESCE(COUNT(*),0) AS total,
      SUM(CASE WHEN c.c06 < 5 THEN 1 ELSE 0 END) AS nbEnfantsMoins5,
      SUM(CASE WHEN c.c04 = 2 THEN 1 ELSE 0 END) AS nbResidentsAbsents,
      SUM(CASE WHEN c.c04 = 3 THEN 1 ELSE 0 END) AS nbVisiteurs,
      SUM(CASE WHEN c.c24_t > 0 THEN c.c24_t ELSE 0 END) AS nbNaissancesVivantes,
      SUM(CASE WHEN c.c03 = 2 AND c.c06 BETWEEN 15 AND 49 THEN 1 ELSE 0 END) AS nbFemmes15_49
    FROM tcaracteristique c
    INNER JOIN tmenage m ON m.\`level-1-id\` = c.\`level-1-id\`
    ${baseWhere}
  `;
  const row = (await menageDB.query(sql, { replacements: buildReplacements(filters, user), type: QueryTypes.SELECT }))[0];

  const nbResidentsAbsents = Number(row.nbResidentsAbsents || 0);
  const nbVisiteurs = Number(row.nbVisiteurs || 0);
  const hommes = Number(row.hommes || 0);
  const femmes = Number(row.femmes || 0);
  const nbNaissancesVivantes = Number(row.nbNaissancesVivantes || 0);
  const nbFemmes15_49 = Number(row.nbFemmes15_49 || 0);

  return {
    hommes: Number(row.hommes || 0),
    femmes: Number(row.femmes || 0),
    total: Number(row.total || 0),
    proportionEnfantsMoins5: row.total === 0 ? 0 : +(row.nbEnfantsMoins5 / row.total * 100).toFixed(2),
    RRAVI:
      nbVisiteurs > 0 ? Number((nbResidentsAbsents / nbVisiteurs).toFixed(2)) : 0,
    rapportMasculinite:
      femmes > 0 ? Number(((hommes / femmes) * 100).toFixed(2)) : 0,
    PA49:
      nbFemmes15_49 > 0
        ? Number((nbNaissancesVivantes / nbFemmes15_49).toFixed(2))
        : 0
  };
}

/*  Proportion de ménages agricoles  */
async function getProportionMenagesAgricoles(filters = {}, user = null) {
  const baseWhere = buildBaseWhere(user);
  const baseWhereAgric = baseWhere.replace(/m\./g,'a.');
  
  const sql = `
    SELECT (ag.totalAgricoles / NULLIF(men.totalMenages,0))*100 AS proportion
    FROM
      (SELECT COUNT(*) AS totalMenages FROM tmenage m ${baseWhere}) AS men,
      (SELECT COUNT(DISTINCT a.\`level-1-id\`) AS totalAgricoles FROM tagriculture a ${baseWhereAgric}) AS ag
  `;
  const rows = await menageDB.query(sql, { replacements: buildReplacements(filters, user), type: QueryTypes.SELECT });
  return +(Number(rows[0]?.proportion || 0)).toFixed(2);
}

/*  Moyenne des émigrés par ménage  */
async function getAverageEmigresPerMenage(filters = {}, user = null) {
  const baseWhere = buildBaseWhere(user);
  const sql = `
    SELECT
      COALESCE(SUM(t.em02),0) AS totalEmigres,
      COALESCE(COUNT(DISTINCT m.\`level-1-id\`),0) AS totalMenages
    FROM temigration t
    INNER JOIN tmenage m ON m.\`level-1-id\` = t.\`level-1-id\`
    ${baseWhere}
  `;
  const rows = await menageDB.query(sql, { replacements: buildReplacements(filters, user), type: QueryTypes.SELECT });
  const totalEmigres = Number(rows[0].totalEmigres || 0);
  const totalMenages = Number(rows[0].totalMenages || 0);
  return totalMenages === 0 ? 0 : +(totalEmigres / totalMenages).toFixed(2);
}

/*  Pyramide des âges  */
async function getPyramideAges(filters = {}, user = null) {
  const baseWhere = buildBaseWhere(user);
  const sql = `
    SELECT age_range,
           SUM(CASE WHEN t.c03 = 1 THEN 1 ELSE 0 END) AS hommes,
           SUM(CASE WHEN t.c03 = 2 THEN 1 ELSE 0 END) AS femmes
    FROM (
      SELECT c.*,
        CASE
        WHEN c.c06 BETWEEN 0 AND 4 THEN '0-4'
        WHEN c.c06 BETWEEN 5 AND 9 THEN '5-9'
        WHEN c.c06 BETWEEN 10 AND 14 THEN '10-14'
        WHEN c.c06 BETWEEN 15 AND 19 THEN '15-19'
        WHEN c.c06 BETWEEN 20 AND 24 THEN '20-24'
        WHEN c.c06 BETWEEN 25 AND 29 THEN '25-29'
        WHEN c.c06 BETWEEN 30 AND 34 THEN '30-34'
        WHEN c.c06 BETWEEN 35 AND 39 THEN '35-39'
        WHEN c.c06 BETWEEN 40 AND 44 THEN '40-44'
        WHEN c.c06 BETWEEN 45 AND 49 THEN '45-49'
        WHEN c.c06 BETWEEN 50 AND 54 THEN '50-54'
        WHEN c.c06 BETWEEN 55 AND 59 THEN '55-59'
        WHEN c.c06 BETWEEN 60 AND 64 THEN '60-64'
        WHEN c.c06 BETWEEN 65 AND 69 THEN '65-69'
        WHEN c.c06 BETWEEN 70 AND 74 THEN '70-74'
        WHEN c.c06 BETWEEN 75 AND 79 THEN '75-79'
        ELSE '80+'
        END AS age_range
      FROM tcaracteristique c
      INNER JOIN tmenage m ON m.\`level-1-id\` = c.\`level-1-id\`
      ${baseWhere}
    ) t
    GROUP BY age_range
    ORDER BY FIELD(age_range,'0-4','5-9','10-14','15-19','20-24','25-29','30-34','35-39','40-44','45-49','50-54','55-59','60-64','65-69','70-74','75-79','80+')
  `;
  const rows = await menageDB.query(sql, { replacements: buildReplacements(filters, user), type: QueryTypes.SELECT });
  return rows.map(r => ({ age: r.age_range, hommes: Number(r.hommes||0), femmes: Number(r.femmes||0) }));
}

/*  Select dynamiques avec restrictions utilisateur  */
async function getRegions(user = null) {
  let sql = `SELECT DISTINCT code_region, region FROM tmenage`;
  const replacements = {};
  
  // Appliquer les restrictions utilisateur
  if (user && user.code_region) {
    sql += ` WHERE code_region = :code_region`;
    replacements.code_region = user.code_region;
  }
  
  sql += ` ORDER BY region ASC`;
  return await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
}

async function getDepartements(region, user = null) {
  if (!region && !user?.code_departement) return [];
  
  let sql = `SELECT DISTINCT code_departement, departement FROM tmenage WHERE 1=1`;
  const replacements = {};
  
  // Priorité au paramètre région
  if (region) {
    sql += ` AND code_region = :region`;
    replacements.region = region;
  }
  // Sinon utiliser la région de l'utilisateur
  else if (user?.code_region) {
    sql += ` AND code_region = :code_region`;
    replacements.code_region = user.code_region;
  }
  
  // Si l'utilisateur a un département fixe, filtrer par celui-ci
  if (user?.code_departement) {
    sql += ` AND code_departement = :code_departement`;
    replacements.code_departement = user.code_departement;
  }
  
  sql += ` ORDER BY departement ASC`;
  return await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
}

async function getCommunes(departement, user = null) {
  if (!departement && !user?.code_commune) return [];
  
  let sql = `SELECT DISTINCT code_commune, commune FROM tmenage WHERE 1=1`;
  const replacements = {};
  
  // Priorité au paramètre département
  if (departement) {
    sql += ` AND code_departement = :departement`;
    replacements.departement = departement;
  }
  // Sinon utiliser le département de l'utilisateur
  else if (user?.code_departement) {
    sql += ` AND code_departement = :code_departement`;
    replacements.code_departement = user.code_departement;
  }
  
  // Si l'utilisateur a une commune fixe, filtrer par celle-ci
  if (user?.code_commune) {
    sql += ` AND code_commune = :code_commune`;
    replacements.code_commune = user.code_commune;
  }
  
  sql += ` ORDER BY commune ASC`;
  return await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
}

async function getZds(commune, user = null) {
  if (!commune && !user?.code_commune) return [];
  
  let sql = `SELECT DISTINCT mo_zd FROM tmenage WHERE 1=1`;
  const replacements = {};
  
  // Priorité au paramètre commune
  if (commune) {
    sql += ` AND code_commune = :commune`;
    replacements.commune = commune;
  }
  // Sinon utiliser la commune de l'utilisateur
  else if (user?.code_commune) {
    sql += ` AND code_commune = :code_commune`;
    replacements.code_commune = user.code_commune;
  }
  
  sql += ` ORDER BY mo_zd ASC`;
  return await menageDB.query(sql, { replacements, type: QueryTypes.SELECT });
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