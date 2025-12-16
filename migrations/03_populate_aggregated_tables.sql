-- =====================================================
-- SCRIPT DE PEUPLEMENT DES TABLES PRÉ-AGRÉGÉES
-- Exécution: peut prendre plusieurs minutes sur de grosses bases
-- =====================================================

USE menage;

SET SESSION sql_mode = 'TRADITIONAL';

-- =====================================================
-- 1. STATS NATIONALES
-- =====================================================

SELECT '📊 Calcul des statistiques nationales...' AS status;

UPDATE stats_nationales SET
    -- Stats ménages
    total_menages = (SELECT COUNT(*) FROM tmenage),
    total_population = (SELECT COALESCE(SUM(nb_residents), 0) FROM tmenage),
    nb_menages_plus_10 = (SELECT COUNT(*) FROM tmenage WHERE xm40 > 10),
    nb_menages_solo = (SELECT COUNT(*) FROM tmenage WHERE xm40 = 1),
    population_rurale = (SELECT COUNT(*) FROM tmenage WHERE xm01 = 2),
    menages_enumeres = (SELECT COUNT(*) FROM tmenage WHERE xm30 > 0),
    menages_denombres = (SELECT COUNT(*) FROM tmenage WHERE xm13 = 1),
    population_carto = (SELECT COALESCE(SUM(xm20), 0) FROM tmenage),
    population_collectee = (SELECT COALESCE(SUM(xm40), 0) FROM tmenage),
    
    -- Stats population
    hommes = (SELECT COUNT(*) FROM tcaracteristique WHERE c03 = 1),
    femmes = (SELECT COUNT(*) FROM tcaracteristique WHERE c03 = 2),
    nb_enfants_moins_5 = (SELECT COUNT(*) FROM tcaracteristique WHERE c06 < 5),
    nb_residents_absents = (SELECT COUNT(*) FROM tcaracteristique WHERE c04 = 2),
    nb_visiteurs = (SELECT COUNT(*) FROM tcaracteristique WHERE c04 = 3),
    nb_naissances_vivantes = (SELECT COALESCE(SUM(c24_t), 0) FROM tcaracteristique WHERE c24_t > 0),
    nb_femmes_15_49 = (SELECT COUNT(*) FROM tcaracteristique WHERE c03 = 2 AND c06 BETWEEN 15 AND 49),
    
    -- Stats agricoles et émigration
    menages_agricoles = (SELECT COUNT(DISTINCT `level-1-id`) FROM tagriculture),
    total_emigres = (SELECT COALESCE(SUM(em02), 0) FROM temigration),
    menages_avec_emigres = (SELECT COUNT(DISTINCT `level-1-id`) FROM temigration WHERE em02 > 0),
    
    date_maj = NOW()
WHERE id = 1;

SELECT '✅ Stats nationales calculées' AS status;

-- =====================================================
-- 2. STATS PAR RÉGION
-- =====================================================

SELECT '📊 Calcul des statistiques par région...' AS status;

TRUNCATE TABLE stats_par_region;

INSERT INTO stats_par_region (
    code_region, region,
    total_menages, total_population, nb_menages_plus_10, nb_menages_solo,
    population_rurale, menages_enumeres, menages_denombres,
    population_carto, population_collectee,
    hommes, femmes, nb_enfants_moins_5, nb_residents_absents, nb_visiteurs,
    nb_naissances_vivantes, nb_femmes_15_49,
    menages_agricoles, total_emigres, menages_avec_emigres
)
SELECT 
    m.code_region,
    m.region,
    COUNT(*) AS total_menages,
    COALESCE(SUM(m.nb_residents), 0) AS total_population,
    SUM(CASE WHEN m.xm40 > 10 THEN 1 ELSE 0 END) AS nb_menages_plus_10,
    SUM(CASE WHEN m.xm40 = 1 THEN 1 ELSE 0 END) AS nb_menages_solo,
    SUM(CASE WHEN m.xm01 = 2 THEN 1 ELSE 0 END) AS population_rurale,
    SUM(CASE WHEN m.xm30 > 0 THEN 1 ELSE 0 END) AS menages_enumeres,
    SUM(CASE WHEN m.xm13 = 1 THEN 1 ELSE 0 END) AS menages_denombres,
    COALESCE(SUM(m.xm20), 0) AS population_carto,
    COALESCE(SUM(m.xm40), 0) AS population_collectee,
    
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.code_region = m.code_region AND c.c03 = 1) AS hommes,
     
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.code_region = m.code_region AND c.c03 = 2) AS femmes,
     
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.code_region = m.code_region AND c.c06 < 5) AS nb_enfants_moins_5,
     
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.code_region = m.code_region AND c.c04 = 2) AS nb_residents_absents,
     
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.code_region = m.code_region AND c.c04 = 3) AS nb_visiteurs,
     
    (SELECT COALESCE(SUM(c.c24_t), 0) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.code_region = m.code_region AND c.c24_t > 0) AS nb_naissances_vivantes,
     
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.code_region = m.code_region AND c.c03 = 2 AND c.c06 BETWEEN 15 AND 49) AS nb_femmes_15_49,
     
    (SELECT COUNT(DISTINCT a.`level-1-id`) FROM tagriculture a
     INNER JOIN tmenage m2 ON m2.`level-1-id` = a.`level-1-id`
     WHERE m2.code_region = m.code_region) AS menages_agricoles,
     
    (SELECT COALESCE(SUM(e.em02), 0) FROM temigration e
     INNER JOIN tmenage m2 ON m2.`level-1-id` = e.`level-1-id`
     WHERE m2.code_region = m.code_region) AS total_emigres,
     
    (SELECT COUNT(DISTINCT e.`level-1-id`) FROM temigration e
     INNER JOIN tmenage m2 ON m2.`level-1-id` = e.`level-1-id`
     WHERE m2.code_region = m.code_region AND e.em02 > 0) AS menages_avec_emigres
     
FROM tmenage m
GROUP BY m.code_region, m.region;

SELECT '✅ Stats par région calculées' AS status;

-- =====================================================
-- 3. STATS PAR DÉPARTEMENT
-- =====================================================

SELECT '📊 Calcul des statistiques par département...' AS status;

TRUNCATE TABLE stats_par_departement;

INSERT INTO stats_par_departement (
    code_region, code_departement, departement,
    total_menages, total_population, nb_menages_plus_10, nb_menages_solo,
    population_rurale, menages_enumeres, menages_denombres,
    population_carto, population_collectee,
    hommes, femmes, nb_enfants_moins_5, nb_residents_absents, nb_visiteurs,
    nb_naissances_vivantes, nb_femmes_15_49,
    menages_agricoles, total_emigres, menages_avec_emigres
)
SELECT 
    m.code_region,
    m.code_departement,
    m.departement,
    COUNT(*) AS total_menages,
    COALESCE(SUM(m.nb_residents), 0) AS total_population,
    SUM(CASE WHEN m.xm40 > 10 THEN 1 ELSE 0 END) AS nb_menages_plus_10,
    SUM(CASE WHEN m.xm40 = 1 THEN 1 ELSE 0 END) AS nb_menages_solo,
    SUM(CASE WHEN m.xm01 = 2 THEN 1 ELSE 0 END) AS population_rurale,
    SUM(CASE WHEN m.xm30 > 0 THEN 1 ELSE 0 END) AS menages_enumeres,
    SUM(CASE WHEN m.xm13 = 1 THEN 1 ELSE 0 END) AS menages_denombres,
    COALESCE(SUM(m.xm20), 0) AS population_carto,
    COALESCE(SUM(m.xm40), 0) AS population_collectee,
    
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.code_departement = m.code_departement AND c.c03 = 1) AS hommes,
     
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.code_departement = m.code_departement AND c.c03 = 2) AS femmes,
     
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.code_departement = m.code_departement AND c.c06 < 5) AS nb_enfants_moins_5,
     
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.code_departement = m.code_departement AND c.c04 = 2) AS nb_residents_absents,
     
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.code_departement = m.code_departement AND c.c04 = 3) AS nb_visiteurs,
     
    (SELECT COALESCE(SUM(c.c24_t), 0) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.code_departement = m.code_departement AND c.c24_t > 0) AS nb_naissances_vivantes,
     
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.code_departement = m.code_departement AND c.c03 = 2 AND c.c06 BETWEEN 15 AND 49) AS nb_femmes_15_49,
     
    (SELECT COUNT(DISTINCT a.`level-1-id`) FROM tagriculture a
     INNER JOIN tmenage m2 ON m2.`level-1-id` = a.`level-1-id`
     WHERE m2.code_departement = m.code_departement) AS menages_agricoles,
     
    (SELECT COALESCE(SUM(e.em02), 0) FROM temigration e
     INNER JOIN tmenage m2 ON m2.`level-1-id` = e.`level-1-id`
     WHERE m2.code_departement = m.code_departement) AS total_emigres,
     
    (SELECT COUNT(DISTINCT e.`level-1-id`) FROM temigration e
     INNER JOIN tmenage m2 ON m2.`level-1-id` = e.`level-1-id`
     WHERE m2.code_departement = m.code_departement AND e.em02 > 0) AS menages_avec_emigres
     
FROM tmenage m
GROUP BY m.code_region, m.code_departement, m.departement;

SELECT '✅ Stats par département calculées' AS status;

-- =====================================================
-- 4. STATS PAR COMMUNE (peut être très long)
-- =====================================================

SELECT '📊 Calcul des statistiques par commune (peut prendre du temps)...' AS status;

TRUNCATE TABLE stats_par_commune;

INSERT INTO stats_par_commune (
    code_region, code_departement, code_commune, commune,
    total_menages, total_population, nb_menages_plus_10, nb_menages_solo,
    population_rurale, menages_enumeres, menages_denombres,
    population_carto, population_collectee,
    hommes, femmes, nb_enfants_moins_5, nb_residents_absents, nb_visiteurs,
    nb_naissances_vivantes, nb_femmes_15_49,
    menages_agricoles, total_emigres, menages_avec_emigres
)
SELECT 
    m.code_region,
    m.code_departement,
    m.code_commune,
    m.commune,
    COUNT(*) AS total_menages,
    COALESCE(SUM(m.nb_residents), 0) AS total_population,
    SUM(CASE WHEN m.xm40 > 10 THEN 1 ELSE 0 END) AS nb_menages_plus_10,
    SUM(CASE WHEN m.xm40 = 1 THEN 1 ELSE 0 END) AS nb_menages_solo,
    SUM(CASE WHEN m.xm01 = 2 THEN 1 ELSE 0 END) AS population_rurale,
    SUM(CASE WHEN m.xm30 > 0 THEN 1 ELSE 0 END) AS menages_enumeres,
    SUM(CASE WHEN m.xm13 = 1 THEN 1 ELSE 0 END) AS menages_denombres,
    COALESCE(SUM(m.xm20), 0) AS population_carto,
    COALESCE(SUM(m.xm40), 0) AS population_collectee,
    
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.code_commune = m.code_commune AND c.c03 = 1) AS hommes,
     
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.code_commune = m.code_commune AND c.c03 = 2) AS femmes,
     
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.code_commune = m.code_commune AND c.c06 < 5) AS nb_enfants_moins_5,
     
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.code_commune = m.code_commune AND c.c04 = 2) AS nb_residents_absents,
     
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.code_commune = m.code_commune AND c.c04 = 3) AS nb_visiteurs,
     
    (SELECT COALESCE(SUM(c.c24_t), 0) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.code_commune = m.code_commune AND c.c24_t > 0) AS nb_naissances_vivantes,
     
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.code_commune = m.code_commune AND c.c03 = 2 AND c.c06 BETWEEN 15 AND 49) AS nb_femmes_15_49,
     
    (SELECT COUNT(DISTINCT a.`level-1-id`) FROM tagriculture a
     INNER JOIN tmenage m2 ON m2.`level-1-id` = a.`level-1-id`
     WHERE m2.code_commune = m.code_commune) AS menages_agricoles,
     
    (SELECT COALESCE(SUM(e.em02), 0) FROM temigration e
     INNER JOIN tmenage m2 ON m2.`level-1-id` = e.`level-1-id`
     WHERE m2.code_commune = m.code_commune) AS total_emigres,
     
    (SELECT COUNT(DISTINCT e.`level-1-id`) FROM temigration e
     INNER JOIN tmenage m2 ON m2.`level-1-id` = e.`level-1-id`
     WHERE m2.code_commune = m.code_commune AND e.em02 > 0) AS menages_avec_emigres
     
FROM tmenage m
GROUP BY m.code_region, m.code_departement, m.code_commune, m.commune;

SELECT '✅ Stats par commune calculées' AS status;



-- =====================================================
-- 4b. STATS PAR ZD
-- =====================================================

SELECT '📊 Calcul des statistiques par ZD (Cela peut prendre du temps)...' AS status;

TRUNCATE TABLE stats_par_zd;

INSERT INTO stats_par_zd (
    code_region, code_departement, code_commune, mo_zd,
    total_menages, total_population, nb_menages_plus_10, nb_menages_solo,
    population_rurale, menages_enumeres, menages_denombres,
    population_carto, population_collectee,
    hommes, femmes, nb_enfants_moins_5, nb_residents_absents, nb_visiteurs,
    nb_naissances_vivantes, nb_femmes_15_49,
    menages_agricoles, total_emigres, menages_avec_emigres
)
SELECT 
    m.code_region,
    m.code_departement,
    m.code_commune,
    m.mo_zd,
    COUNT(*) AS total_menages,
    COALESCE(SUM(m.nb_residents), 0) AS total_population,
    SUM(CASE WHEN m.xm40 > 10 THEN 1 ELSE 0 END) AS nb_menages_plus_10,
    SUM(CASE WHEN m.xm40 = 1 THEN 1 ELSE 0 END) AS nb_menages_solo,
    SUM(CASE WHEN m.xm01 = 2 THEN 1 ELSE 0 END) AS population_rurale,
    SUM(CASE WHEN m.xm30 > 0 THEN 1 ELSE 0 END) AS menages_enumeres,
    SUM(CASE WHEN m.xm13 = 1 THEN 1 ELSE 0 END) AS menages_denombres,
    COALESCE(SUM(m.xm20), 0) AS population_carto,
    COALESCE(SUM(m.xm40), 0) AS population_collectee,
    
    -- Sous-requêtes corrélées (optimisées par index)
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.mo_zd = m.mo_zd AND c.c03 = 1) AS hommes,
     
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.mo_zd = m.mo_zd AND c.c03 = 2) AS femmes,
     
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.mo_zd = m.mo_zd AND c.c06 < 5) AS nb_enfants_moins_5,
     
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.mo_zd = m.mo_zd AND c.c04 = 2) AS nb_residents_absents,
     
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.mo_zd = m.mo_zd AND c.c04 = 3) AS nb_visiteurs,
     
    (SELECT COALESCE(SUM(c.c24_t), 0) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.mo_zd = m.mo_zd AND c.c24_t > 0) AS nb_naissances_vivantes,
     
    (SELECT COUNT(*) FROM tcaracteristique c 
     INNER JOIN tmenage m2 ON m2.`level-1-id` = c.`level-1-id` 
     WHERE m2.mo_zd = m.mo_zd AND c.c03 = 2 AND c.c06 BETWEEN 15 AND 49) AS nb_femmes_15_49,
     
    (SELECT COUNT(DISTINCT a.`level-1-id`) FROM tagriculture a
     INNER JOIN tmenage m2 ON m2.`level-1-id` = a.`level-1-id`
     WHERE m2.mo_zd = m.mo_zd) AS menages_agricoles,
     
    (SELECT COALESCE(SUM(e.em02), 0) FROM temigration e
     INNER JOIN tmenage m2 ON m2.`level-1-id` = e.`level-1-id`
     WHERE m2.mo_zd = m.mo_zd) AS total_emigres,
     
    (SELECT COUNT(DISTINCT e.`level-1-id`) FROM temigration e
     INNER JOIN tmenage m2 ON m2.`level-1-id` = e.`level-1-id`
     WHERE m2.mo_zd = m.mo_zd AND e.em02 > 0) AS menages_avec_emigres
     
FROM tmenage m
GROUP BY m.code_region, m.code_departement, m.code_commune, m.mo_zd;

SELECT '✅ Stats par ZD calculées' AS status;


-- =====================================================
-- 5. PYRAMIDE DES ÂGES NATIONALE
-- =====================================================

SELECT '📊 Calcul pyramide des âges nationale...' AS status;

TRUNCATE TABLE pyramide_ages_nationale;

INSERT INTO pyramide_ages_nationale (age_range, hommes, femmes)
SELECT 
    age_range,
    SUM(CASE WHEN c03 = 1 THEN 1 ELSE 0 END) AS hommes,
    SUM(CASE WHEN c03 = 2 THEN 1 ELSE 0 END) AS femmes
FROM (
    SELECT 
        c03,
        CASE
            WHEN c06 BETWEEN 0 AND 4 THEN '0-4'
            WHEN c06 BETWEEN 5 AND 9 THEN '5-9'
            WHEN c06 BETWEEN 10 AND 14 THEN '10-14'
            WHEN c06 BETWEEN 15 AND 19 THEN '15-19'
            WHEN c06 BETWEEN 20 AND 24 THEN '20-24'
            WHEN c06 BETWEEN 25 AND 29 THEN '25-29'
            WHEN c06 BETWEEN 30 AND 34 THEN '30-34'
            WHEN c06 BETWEEN 35 AND 39 THEN '35-39'
            WHEN c06 BETWEEN 40 AND 44 THEN '40-44'
            WHEN c06 BETWEEN 45 AND 49 THEN '45-49'
            WHEN c06 BETWEEN 50 AND 54 THEN '50-54'
            WHEN c06 BETWEEN 55 AND 59 THEN '55-59'
            WHEN c06 BETWEEN 60 AND 64 THEN '60-64'
            WHEN c06 BETWEEN 65 AND 69 THEN '65-69'
            WHEN c06 BETWEEN 70 AND 74 THEN '70-74'
            WHEN c06 BETWEEN 75 AND 79 THEN '75-79'
            ELSE '80+'
        END AS age_range
    FROM tcaracteristique
) AS subq
GROUP BY age_range
ORDER BY FIELD(age_range,'0-4','5-9','10-14','15-19','20-24','25-29','30-34','35-39','40-44','45-49','50-54','55-59','60-64','65-69','70-74','75-79','80+');

SELECT '✅ Pyramide nationale calculée' AS status;

-- =====================================================
-- 6. PYRAMIDE DES ÂGES PAR RÉGION - CORRIGÉE
-- =====================================================

SELECT '📊 Calcul pyramides des âges par région...' AS status;

TRUNCATE TABLE pyramide_ages_region;

INSERT INTO pyramide_ages_region (code_region, age_range, hommes, femmes)
SELECT 
    m.code_region,
    age_range,
    SUM(CASE WHEN c.c03 = 1 THEN 1 ELSE 0 END) AS hommes,
    SUM(CASE WHEN c.c03 = 2 THEN 1 ELSE 0 END) AS femmes
FROM (
    SELECT 
        c03,
        `level-1-id`,
        CASE
           WHEN c06 BETWEEN 0 AND 4 THEN '0-4'
            WHEN c06 BETWEEN 5 AND 9 THEN '5-9'
            WHEN c06 BETWEEN 10 AND 14 THEN '10-14'
            WHEN c06 BETWEEN 15 AND 19 THEN '15-19'
            WHEN c06 BETWEEN 20 AND 24 THEN '20-24'
            WHEN c06 BETWEEN 25 AND 29 THEN '25-29'
            WHEN c06 BETWEEN 30 AND 34 THEN '30-34'
            WHEN c06 BETWEEN 35 AND 39 THEN '35-39'
            WHEN c06 BETWEEN 40 AND 44 THEN '40-44'
            WHEN c06 BETWEEN 45 AND 49 THEN '45-49'
            WHEN c06 BETWEEN 50 AND 54 THEN '50-54'
            WHEN c06 BETWEEN 55 AND 59 THEN '55-59'
            WHEN c06 BETWEEN 60 AND 64 THEN '60-64'
            WHEN c06 BETWEEN 65 AND 69 THEN '65-69'
            WHEN c06 BETWEEN 70 AND 74 THEN '70-74'
            WHEN c06 BETWEEN 75 AND 79 THEN '75-79'
            ELSE '80+'
        END AS age_range
    FROM tcaracteristique
) AS c
INNER JOIN tmenage m ON m.`level-1-id` = c.`level-1-id`
GROUP BY m.code_region, age_range;

SELECT '✅ Pyramides par région calculées' AS status;

-- =====================================================
-- 7. PYRAMIDE DES ÂGES PAR DÉPARTEMENT - CORRIGÉE
-- =====================================================

SELECT '📊 Calcul pyramides des âges par département...' AS status;

TRUNCATE TABLE pyramide_ages_departement;

INSERT INTO pyramide_ages_departement (code_departement, age_range, hommes, femmes)
SELECT 
    m.code_departement,
    age_range,
    SUM(CASE WHEN c.c03 = 1 THEN 1 ELSE 0 END) AS hommes,
    SUM(CASE WHEN c.c03 = 2 THEN 1 ELSE 0 END) AS femmes
FROM (
    SELECT 
        c03,
        `level-1-id`,
        CASE
            WHEN c06 BETWEEN 0 AND 4 THEN '0-4'
            WHEN c06 BETWEEN 5 AND 9 THEN '5-9'
            WHEN c06 BETWEEN 10 AND 14 THEN '10-14'
            WHEN c06 BETWEEN 15 AND 19 THEN '15-19'
            WHEN c06 BETWEEN 20 AND 24 THEN '20-24'
            WHEN c06 BETWEEN 25 AND 29 THEN '25-29'
            WHEN c06 BETWEEN 30 AND 34 THEN '30-34'
            WHEN c06 BETWEEN 35 AND 39 THEN '35-39'
            WHEN c06 BETWEEN 40 AND 44 THEN '40-44'
            WHEN c06 BETWEEN 45 AND 49 THEN '45-49'
            WHEN c06 BETWEEN 50 AND 54 THEN '50-54'
            WHEN c06 BETWEEN 55 AND 59 THEN '55-59'
            WHEN c06 BETWEEN 60 AND 64 THEN '60-64'
            WHEN c06 BETWEEN 65 AND 69 THEN '65-69'
            WHEN c06 BETWEEN 70 AND 74 THEN '70-74'
            WHEN c06 BETWEEN 75 AND 79 THEN '75-79'
            ELSE '80+'
        END AS age_range
    FROM tcaracteristique
) AS c
INNER JOIN tmenage m ON m.`level-1-id` = c.`level-1-id`
GROUP BY m.code_departement, age_range;

SELECT '✅ Pyramides par département calculées' AS status;

-- =====================================================
-- 8. PYRAMIDE DES ÂGES PAR COMMUNE - CORRIGÉE
-- =====================================================

SELECT '📊 Calcul pyramides des âges par commune...' AS status;

TRUNCATE TABLE pyramide_ages_commune;

INSERT INTO pyramide_ages_commune (code_commune, age_range, hommes, femmes)
SELECT 
    m.code_commune,
    age_range,
    SUM(CASE WHEN c.c03 = 1 THEN 1 ELSE 0 END) AS hommes,
    SUM(CASE WHEN c.c03 = 2 THEN 1 ELSE 0 END) AS femmes
FROM (
    SELECT 
        c03,
        `level-1-id`,
        CASE
            WHEN c06 BETWEEN 0 AND 4 THEN '0-4'
            WHEN c06 BETWEEN 5 AND 9 THEN '5-9'
            WHEN c06 BETWEEN 10 AND 14 THEN '10-14'
            WHEN c06 BETWEEN 15 AND 19 THEN '15-19'
            WHEN c06 BETWEEN 20 AND 24 THEN '20-24'
            WHEN c06 BETWEEN 25 AND 29 THEN '25-29'
            WHEN c06 BETWEEN 30 AND 34 THEN '30-34'
            WHEN c06 BETWEEN 35 AND 39 THEN '35-39'
            WHEN c06 BETWEEN 40 AND 44 THEN '40-44'
            WHEN c06 BETWEEN 45 AND 49 THEN '45-49'
            WHEN c06 BETWEEN 50 AND 54 THEN '50-54'
            WHEN c06 BETWEEN 55 AND 59 THEN '55-59'
            WHEN c06 BETWEEN 60 AND 64 THEN '60-64'
            WHEN c06 BETWEEN 65 AND 69 THEN '65-69'
            WHEN c06 BETWEEN 70 AND 74 THEN '70-74'
            WHEN c06 BETWEEN 75 AND 79 THEN '75-79'
            ELSE '80+'
        END AS age_range
    FROM tcaracteristique
) AS c
INNER JOIN tmenage m ON m.`level-1-id` = c.`level-1-id`
GROUP BY m.code_commune, age_range;

SELECT '✅ Pyramides par commune calculées' AS status;

-- =====================================================
-- 8b. PYRAMIDE DES ÂGES PAR ZD
-- =====================================================

SELECT '📊 Calcul pyramides des âges par ZD...' AS status;

TRUNCATE TABLE pyramide_ages_zd;

INSERT INTO pyramide_ages_zd (mo_zd, age_range, hommes, femmes)
SELECT 
    m.mo_zd,
    age_range,
    SUM(CASE WHEN c.c03 = 1 THEN 1 ELSE 0 END) AS hommes,
    SUM(CASE WHEN c.c03 = 2 THEN 1 ELSE 0 END) AS femmes
FROM (
    SELECT 
        c03,
        `level-1-id`,
        CASE
            WHEN c06 BETWEEN 0 AND 4 THEN '0-4'
            WHEN c06 BETWEEN 5 AND 9 THEN '5-9'
            WHEN c06 BETWEEN 10 AND 14 THEN '10-14'
            WHEN c06 BETWEEN 15 AND 19 THEN '15-19'
            WHEN c06 BETWEEN 20 AND 24 THEN '20-24'
            WHEN c06 BETWEEN 25 AND 29 THEN '25-29'
            WHEN c06 BETWEEN 30 AND 34 THEN '30-34'
            WHEN c06 BETWEEN 35 AND 39 THEN '35-39'
            WHEN c06 BETWEEN 40 AND 44 THEN '40-44'
            WHEN c06 BETWEEN 45 AND 49 THEN '45-49'
            WHEN c06 BETWEEN 50 AND 54 THEN '50-54'
            WHEN c06 BETWEEN 55 AND 59 THEN '55-59'
            WHEN c06 BETWEEN 60 AND 64 THEN '60-64'
            WHEN c06 BETWEEN 65 AND 69 THEN '65-69'
            WHEN c06 BETWEEN 70 AND 74 THEN '70-74'
            WHEN c06 BETWEEN 75 AND 79 THEN '75-79'
            ELSE '80+'
        END AS age_range
    FROM tcaracteristique
) AS c
INNER JOIN tmenage m ON m.`level-1-id` = c.`level-1-id`
GROUP BY m.mo_zd, age_range;

SELECT '✅ Pyramides par ZD calculées' AS status;
-- =====================================================
-- RÉSUMÉ FINAL
-- =====================================================

SELECT '🎉 TOUTES LES TABLES PRÉ-AGRÉGÉES SONT PEUPLÉES!' AS status;

SELECT 'ℹ️  Nombre de lignes par table:' AS info;

SELECT 'stats_nationales' AS table_name, COUNT(*) AS nb_rows FROM stats_nationales
UNION ALL
SELECT 'stats_par_region', COUNT(*) FROM stats_par_region
UNION ALL
SELECT 'stats_par_departement', COUNT(*) FROM stats_par_departement
UNION ALL
SELECT 'stats_par_commune', COUNT(*) FROM stats_par_commune
UNION ALL
SELECT 'pyramide_ages_nationale', COUNT(*) FROM pyramide_ages_nationale
UNION ALL
SELECT 'pyramide_ages_region', COUNT(*) FROM pyramide_ages_region
UNION ALL
SELECT 'pyramide_ages_departement', COUNT(*) FROM pyramide_ages_departement
UNION ALL
SELECT 'pyramide_ages_commune', COUNT(*) FROM pyramide_ages_commune;