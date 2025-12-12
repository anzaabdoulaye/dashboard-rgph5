-- =====================================================
-- SCRIPT DE PEUPLEMENT DES TABLES PRÉ-AGRÉGÉES - CORRIGÉ
-- =====================================================

USE menage;
SET SESSION sql_mode = 'TRADITIONAL';

-- ... [conserver les sections 1-4 inchangées] ...

-- =====================================================
-- 5. PYRAMIDE DES ÂGES NATIONALE - CORRIGÉE
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

-- ... [section résumé inchangée] ...