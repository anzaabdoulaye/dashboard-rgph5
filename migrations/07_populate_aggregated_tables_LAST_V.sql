-- =====================================================
-- SCRIPT DE PEUPLEMENT DES TABLES PRÉ-AGRÉGÉES
-- Exécution: peut prendre plusieurs minutes sur de grosses bases
-- =====================================================


-- SET SESSION sql_mode = 'TRADITIONAL';
 
-- =====================================================
-- 1. STATS NATIONALES
-- =====================================================


SELECT '📊 fin insertion des donnees dans tlevel1...' AS status;

    UPDATE stats_nationales SET
        -- Stats ménages
        total_menages_attendu = (SELECT sum(zd_men) FROM zd),
        total_menages = (SELECT COUNT(*) FROM tmenage),
        total_population = (SELECT COALESCE(SUM(xm40), 0) FROM tmenage),
        nb_menages_plus_10 = (SELECT COUNT(*) FROM tmenage WHERE xm40 > 10),
        nb_menages_solo = (SELECT COUNT(*) FROM tmenage WHERE xm40 = 1),
        population_rurale = (SELECT SUM(XM40) FROM tmenage WHERE xm01 = 2),
        menages_enumeres = (SELECT COUNT(*) FROM tenumeration WHERE men_exist BETWEEN 1 AND 3),
        menages_denombres = (SELECT COUNT(*) FROM tmenage WHERE xm09 = 1 and meta_intro=1),
        menages_denombres_incomplets = (SELECT COUNT(*) FROM tmenage WHERE xm09 = 2 and meta_intro=1),
        population_carto = (SELECT sum(zd_pop) FROM zd),
        population_collectee = (SELECT COALESCE(SUM(xm40), 0) FROM tmenage),
        menages_ajoutes = (SELECT COUNT(*) FROM tenumeration WHERE men_exist=2), 
        menages_non_existe = (SELECT COUNT(*) FROM tenumeration WHERE men_exist=3), 
        cas_refus = (SELECT COUNT(*) FROM tmenage WHERE meta_intro=2),
        -- Requete nouvelle ajouté
        average_deces = (SELECT COUNT(*) FROM tmenage where d00 = 1),
        
        -- Stats population
        hommes = (SELECT COUNT(*) FROM tcaracteristique WHERE c03 = 1),
        femmes = (SELECT COUNT(*) FROM tcaracteristique WHERE c03 = 2),
        nb_enfants_moins_5 = (SELECT COUNT(*) FROM tcaracteristique WHERE c06 < 5),
        nb_residents_absents = (SELECT COUNT(*) FROM tcaracteristique c INNER JOIN tmenage m ON m.`level-1-id` = c.`level-1-id` WHERE c.c04 = 2),
        nb_visiteurs = (SELECT COUNT(*) FROM tcaracteristique c INNER JOIN tmenage m ON m.`level-1-id` = c.`level-1-id` WHERE c.c04 = 3),
        nb_naissances_vivantes = (SELECT COALESCE(SUM(c27t), 0) FROM tcaracteristique WHERE c27t > 0),
        nb_femmes_15_49 = (SELECT COUNT(*) FROM tcaracteristique WHERE c03 = 2 AND c06 BETWEEN 15 AND 49),
        
        -- Stats agricoles et émigration
        menages_agricoles = (SELECT COUNT(*) FROM tmenage where ag01=1),
        -- Correction : On joint temigration avec tmenage pour exclure les orphelins
        total_emigres = (
            SELECT COUNT(e.em02) 
            FROM temigration e 
            INNER JOIN tmenage m ON m.`level-1-id` = e.`level-1-id`
        ),
        
        -- Correction : On compte les ménages distincts présents dans les deux tables
        menages_avec_emigres = (
            SELECT COUNT(*) 
            FROM tmenage e where e.em00=1 and meta_intro=1
        ),
        
        date_maj = NOW()
    WHERE id = 1;

    SELECT '✅ Stats nationales calculées' AS status;

    -- =====================================================
    -- 2. STATS PAR RÉGION
    -- =====================================================

    SELECT '📊 Calcul des statistiques par région...' AS status;

    TRUNCATE TABLE stats_par_region;

    INSERT INTO stats_par_region (
        code_region, region, total_menages_attendu,
        total_menages, total_population, nb_menages_plus_10, nb_menages_solo,
        population_rurale, menages_enumeres, menages_denombres,
        population_carto, population_collectee,
        average_deces,
        hommes, femmes, nb_enfants_moins_5, nb_residents_absents, nb_visiteurs,
        nb_naissances_vivantes, nb_femmes_15_49,
        menages_agricoles, total_emigres, menages_avec_emigres, menages_denombres_incomplets, menages_ajoutes, cas_refus, menages_non_existe
    )
    SELECT 
        H.code_region,
        H.region,
        J.total_menages_attendu,
        H.total_menages,
        H.total_population,
        H.nb_menages_plus_10,
        H.nb_menages_solo,
        H.population_rurale,
        COALESCE(EN.menages_enumeres, 0) as menages_enumeres,
        H.menages_denombres,
        J.population_carto,
        H.population_collectee,
        H.average_deces,
        
        -- Données venant de la table Population (P)
        COALESCE(P.hommes, 0),
        COALESCE(P.femmes, 0),
        COALESCE(P.nb_enfants_moins_5, 0),
        COALESCE(P.nb_residents_absents, 0),
        COALESCE(P.nb_visiteurs, 0),
        COALESCE(P.nb_naissances_vivantes, 0),
        COALESCE(P.nb_femmes_15_49, 0),
        -- Données Agriculture (A) et Emigration (E)
        COALESCE(A.menages_agricoles, 0),
        COALESCE(E.total_emigres, 0),
        COALESCE(E.menages_avec_emigres, 0), H.menages_denombres_incomplets, K.menages_ajoutes, H.cas_refus, I.menages_non_existe
    FROM 
        -- 1. Agrégation Ménages (Source fiable) okk
        (SELECT 
            code_region, region,
            COUNT(*) as total_menages,
            COALESCE(SUM(xm40), 0) as total_population,
            SUM(CASE WHEN xm40 > 10 THEN 1 ELSE 0 END) as nb_menages_plus_10,
            SUM(CASE WHEN xm40 = 1 THEN 1 ELSE 0 END) as nb_menages_solo,
            SUM(CASE WHEN xm01 = 2 THEN 1 ELSE 0 END) as population_rurale,
            SUM(CASE WHEN ( xm09 = 1 and meta_intro=1) THEN 1 ELSE 0 END) as menages_denombres,
            SUM(CASE WHEN (xm09 = 2 and meta_intro=1) THEN 1 ELSE 0 END) as menages_denombres_incomplets,
            -- SUM(CASE WHEN men_exist = 2 THEN 1 ELSE 0 END) as menages_ajoutes,
            SUM(CASE WHEN meta_intro = 2 THEN 1 ELSE 0 END) as cas_refus,
            COALESCE(SUM(xm40), 0) as population_collectee,
            SUM(CASE WHEN d00 = 1 THEN 1 ELSE 0 END ) as average_deces
            
        FROM tmenage 
        GROUP BY code_region, region
        ) H
        -- 2. Jointure pour les individus (Correction Amalgame)
        LEFT JOIN (
            SELECT 
                m.code_region,
                SUM(CASE WHEN c.c03 = 1 THEN 1 ELSE 0 END) as hommes,
                SUM(CASE WHEN c.c03 = 2 THEN 1 ELSE 0 END) as femmes,
                SUM(CASE WHEN c.c06 < 5 THEN 1 ELSE 0 END) as nb_enfants_moins_5,
                SUM(CASE WHEN c.c04 = 2 THEN 1 ELSE 0 END) as nb_residents_absents,
                SUM(CASE WHEN c.c04 = 3 THEN 1 ELSE 0 END) as nb_visiteurs,
                SUM(CASE WHEN c.c27t > 0 THEN c.c27t ELSE 0 END) as nb_naissances_vivantes,
                SUM(CASE WHEN c.c03 = 2 AND c.c06 BETWEEN 15 AND 49 THEN 1 ELSE 0 END) as nb_femmes_15_49
            FROM tcaracteristique c
            INNER JOIN tmenage m ON m.`level-1-id` = c.`level-1-id`
            GROUP BY m.code_region
        ) P ON H.code_region = P.code_region
        -- 3. Jointure Agriculture
        LEFT JOIN (
            SELECT m.code_region, COUNT(*) as menages_agricoles
            FROM tmenage m where m.ag01=1
            GROUP BY m.code_region
        ) A ON H.code_region = A.code_region
        -- 4. Jointure Emigration
        LEFT JOIN (
            SELECT m.code_region, 
                COALESCE(sum(m.em01), 0) as total_emigres,
                COUNT(*) as menages_avec_emigres
            FROM tmenage m where m.em00=1
            GROUP BY m.code_region
        ) E ON H.code_region = E.code_region
        -- 5. Jointure avec enumeration
        LEFT JOIN (         
            SELECT  SUBSTR(en.men_zd, 1, 1) as code_region, 
                    COUNT(*) as menages_enumeres
            FROM tenumeration en
            WHERE en.men_exist BETWEEN 1 AND 3
            GROUP BY SUBSTR(en.men_zd, 1, 1)
        ) EN ON H.code_region = EN.code_region
        -- 6. Jointure avec zd
        LEFT JOIN (
            SELECT  substr(e.zd_zd, 1,1) as code_region, 
                sum(e.zd_men) as total_menages_attendu,
                    sum(e.zd_pop) as population_carto
            FROM zd e
            GROUP BY substr(e.zd_zd, 1,1)
        ) J ON H.code_region = J.code_region

        LEFT JOIN (
            SELECT  substr(e.men_zd, 1,1) as code_region, 
                count(e.men_zd) as menages_non_existe
            FROM tenumeration e where men_exist=3
            GROUP BY substr(e.men_zd, 1,1)
        ) I ON H.code_region = I.code_region

         LEFT JOIN (
            SELECT  substr(e.men_zd, 1,1) as code_region, 
                count(e.men_zd) as menages_ajoutes
            FROM tenumeration e where men_exist=2
            GROUP BY substr(e.men_zd, 1,1)
        ) K ON H.code_region = I.code_region;

SELECT '✅ Stats par région CORRIGÉES (Join)' AS status;


-- =====================================================
-- 3. STATS PAR DÉPARTEMENT (Même logique JOIN)
-- =====================================================
SELECT '📊 Calcul des statistiques par département (Méthode JOIN)...' AS status;
TRUNCATE TABLE stats_par_departement;

INSERT INTO stats_par_departement (
    code_region, code_departement, departement,
    total_menages_attendu, total_menages, total_population, nb_menages_plus_10, nb_menages_solo,
    population_rurale, menages_enumeres, menages_denombres,
    population_carto, population_collectee, average_deces,
    hommes, femmes, nb_enfants_moins_5, nb_residents_absents, nb_visiteurs,
    nb_naissances_vivantes, nb_femmes_15_49,
    menages_agricoles, total_emigres, menages_avec_emigres, menages_denombres_incomplets, menages_ajoutes, cas_refus, menages_non_existe
)
SELECT 
    H.code_region, H.code_departement, H.departement,
    J.total_menages_attendu, H.total_menages, H.total_population, H.nb_menages_plus_10, H.nb_menages_solo,
    H.population_rurale, COALESCE(EN.menages_enumeres, 0) as menages_enumeres,H.menages_denombres,
    J.population_carto, H.population_collectee, H.average_deces,
    COALESCE(P.hommes, 0), COALESCE(P.femmes, 0), COALESCE(P.nb_enfants_moins_5, 0),
    COALESCE(P.nb_residents_absents, 0), COALESCE(P.nb_visiteurs, 0),
    COALESCE(P.nb_naissances_vivantes, 0), COALESCE(P.nb_femmes_15_49, 0),
    COALESCE(A.menages_agricoles, 0), COALESCE(E.total_emigres, 0), COALESCE(E.menages_avec_emigres, 0),  H.menages_denombres_incomplets, K.menages_ajoutes, H.cas_refus, I.menages_non_existe
FROM 
    (SELECT 
        code_region, code_departement, departement,
        COUNT(*) as total_menages, COALESCE(SUM(xm40), 0) as total_population,
        SUM(CASE WHEN xm40 > 10 THEN 1 ELSE 0 END) as nb_menages_plus_10,
        SUM(CASE WHEN xm40 = 1 THEN 1 ELSE 0 END) as nb_menages_solo,
        SUM(CASE WHEN xm01 = 2 THEN 1 ELSE 0 END) as population_rurale,
        SUM(CASE WHEN ( xm09 = 1 and meta_intro=1) THEN 1 ELSE 0 END) as menages_denombres,
        SUM(CASE WHEN (xm09 = 2 and meta_intro=1) THEN 1 ELSE 0 END) as menages_denombres_incomplets,
        -- SUM(CASE WHEN men_exist_denombrement = 2 THEN 1 ELSE 0 END) as menages_ajoutes,
        SUM(CASE WHEN meta_intro = 2 THEN 1 ELSE 0 END) as cas_refus,
        COALESCE(SUM(xm40), 0) as population_collectee,
        SUM(CASE WHEN d00 =1 THEN 1 ELSE 0 END)  as average_deces
     FROM tmenage GROUP BY code_region, code_departement, departement) H
    LEFT JOIN (
        SELECT m.code_departement,
            SUM(CASE WHEN c.c03 = 1 THEN 1 ELSE 0 END) as hommes,
            SUM(CASE WHEN c.c03 = 2 THEN 1 ELSE 0 END) as femmes,
            SUM(CASE WHEN c.c06 < 5 THEN 1 ELSE 0 END) as nb_enfants_moins_5,
            SUM(CASE WHEN c.c04 = 2 THEN 1 ELSE 0 END) as nb_residents_absents,
            SUM(CASE WHEN c.c04 = 3 THEN 1 ELSE 0 END) as nb_visiteurs,
            SUM(CASE WHEN c.c27t > 0 THEN c.c27t ELSE 0 END) as nb_naissances_vivantes,
            SUM(CASE WHEN c.c03 = 2 AND c.c06 BETWEEN 15 AND 49 THEN 1 ELSE 0 END) as nb_femmes_15_49
        FROM tcaracteristique c JOIN tmenage m ON m.`level-1-id` = c.`level-1-id`
        GROUP BY m.code_departement
    ) P ON H.code_departement = P.code_departement
    LEFT JOIN (
        SELECT m.code_departement, COUNT(*) as menages_agricoles
       FROM tmenage m where m.ag01=1
        GROUP BY m.code_departement
    ) A ON H.code_departement = A.code_departement
    LEFT JOIN (
        SELECT m.code_departement,  COALESCE(sum(m.em01), 0) as total_emigres,
               COUNT(*) as menages_avec_emigres 
        FROM tmenage m where m.em00=1
        GROUP BY m.code_departement
    ) E ON H.code_departement = E.code_departement
    -- 5. Jointure avec enumeration
    LEFT JOIN (
        SELECT  SUBSTR(en.men_zd, 1, 3) as code_departement, 
                COUNT(*) as menages_enumeres
        FROM tenumeration en
        WHERE en.men_exist BETWEEN 1 AND 3
        GROUP BY SUBSTR(en.men_zd, 1, 3)
    ) EN ON H.code_departement = EN.code_departement
     -- 6. Jointure avec zd
    LEFT JOIN (
        SELECT  substr(e.zd_zd, 1,3) as code_departement, 
               sum(e.zd_men) as total_menages_attendu,
                sum(e.zd_pop) as population_carto
        FROM zd e
        GROUP BY substr(e.zd_zd, 1,3)
    ) J ON H.code_departement = J.code_departement

    LEFT JOIN (
            SELECT  substr(e.men_zd, 1,3) as code_departement, 
                count(e.men_zd) as menages_non_existe
            FROM tenumeration e where men_exist=3
            GROUP BY substr(e.men_zd, 1,3)
        ) I ON  H.code_departement = I.code_departement

        LEFT JOIN (
            SELECT  substr(e.men_zd, 1,3) as code_departement, 
                count(e.men_zd) as menages_ajoutes
            FROM tenumeration e where men_exist=2
            GROUP BY substr(e.men_zd, 1,3)
        ) K ON  H.code_departement = I.code_departement;

SELECT '✅ Stats par département CORRIGÉES' AS status;

-- =====================================================
-- 4. STATS PAR COMMUNE (CORRIGÉE AVEC JOIN)
-- =====================================================

SELECT '📊 Calcul des statistiques par commune (Méthode JOIN)...' AS status;

TRUNCATE TABLE stats_par_commune;

INSERT INTO stats_par_commune (
    code_region, code_departement, code_commune, commune,
    total_menages_attendu, total_menages, total_population, nb_menages_plus_10, nb_menages_solo,
    population_rurale, menages_enumeres, menages_denombres,
    population_carto, population_collectee, average_deces,
    hommes, femmes, nb_enfants_moins_5, nb_residents_absents, nb_visiteurs,
    nb_naissances_vivantes, nb_femmes_15_49,
    menages_agricoles, total_emigres, menages_avec_emigres, menages_denombres_incomplets,menages_ajoutes, cas_refus,menages_non_existe
)
SELECT 
    H.code_region, H.code_departement, H.code_commune, H.commune,
    J.total_menages_attendu, H.total_menages, H.total_population, H.nb_menages_plus_10, H.nb_menages_solo,
    H.population_rurale, COALESCE(EN.menages_enumeres, 0) as menages_enumeres, H.menages_denombres,
    J.population_carto, H.population_collectee,H.average_deces,
    
    -- Population (P)
    COALESCE(P.hommes, 0), COALESCE(P.femmes, 0), COALESCE(P.nb_enfants_moins_5, 0),
    COALESCE(P.nb_residents_absents, 0), COALESCE(P.nb_visiteurs, 0),
    COALESCE(P.nb_naissances_vivantes, 0), COALESCE(P.nb_femmes_15_49, 0),
    
    -- Agriculture (A) & Emigration (E)
    COALESCE(A.menages_agricoles, 0), COALESCE(E.total_emigres, 0), COALESCE(E.menages_avec_emigres, 0),   H.menages_denombres_incomplets, K.menages_ajoutes, H.cas_refus, I.menages_non_existe
FROM 
    -- 1. Agrégation Ménages
    (SELECT 
        code_region, code_departement, code_commune, commune,
        COUNT(*) as total_menages, COALESCE(SUM(xm40), 0) as total_population,
        SUM(CASE WHEN xm40 > 10 THEN 1 ELSE 0 END) as nb_menages_plus_10,
        SUM(CASE WHEN xm40 = 1 THEN 1 ELSE 0 END) as nb_menages_solo,
        SUM(CASE WHEN xm01 = 2 THEN 1 ELSE 0 END) as population_rurale,
        -- SUM(CASE WHEN men_exist_denombrement > 0 THEN 1 ELSE 0 END) as menages_enumeres,
         SUM(CASE WHEN ( xm09 = 1 and meta_intro=1) THEN 1 ELSE 0 END) as menages_denombres,
        SUM(CASE WHEN (xm09 = 2 and meta_intro=1) THEN 1 ELSE 0 END) as menages_denombres_incomplets,
        -- SUM(CASE WHEN men_exist_denombrement = 2 THEN 1 ELSE 0 END) as menages_ajoutes,
        SUM(CASE WHEN meta_intro = 2 THEN 1 ELSE 0 END) as cas_refus,
        -- COALESCE(SUM(xm20), 0) as population_carto,
        COALESCE(SUM(xm40), 0) as population_collectee,
        SUM(CASE WHEN d00 =1 THEN 1 ELSE 0 END)  as average_deces
        
     FROM tmenage 
     GROUP BY code_region, code_departement, code_commune, commune
    ) H

    -- 2. Jointure Population
    LEFT JOIN (
        SELECT m.code_commune,
            SUM(CASE WHEN c.c03 = 1 THEN 1 ELSE 0 END) as hommes,
            SUM(CASE WHEN c.c03 = 2 THEN 1 ELSE 0 END) as femmes,
            SUM(CASE WHEN c.c06 < 5 THEN 1 ELSE 0 END) as nb_enfants_moins_5,
            SUM(CASE WHEN c.c04 = 2 THEN 1 ELSE 0 END) as nb_residents_absents,
            SUM(CASE WHEN c.c04 = 3 THEN 1 ELSE 0 END) as nb_visiteurs,
            SUM(CASE WHEN c.c27t > 0 THEN c.c27t ELSE 0 END) as nb_naissances_vivantes,
            SUM(CASE WHEN c.c03 = 2 AND c.c06 BETWEEN 15 AND 49 THEN 1 ELSE 0 END) as nb_femmes_15_49
        FROM tcaracteristique c JOIN tmenage m ON m.`level-1-id` = c.`level-1-id`
        GROUP BY m.code_commune
    ) P ON H.code_commune = P.code_commune

    -- 3. Jointure Agriculture
    LEFT JOIN (
        SELECT m.code_commune, COUNT(*) as menages_agricoles
       FROM tmenage m where m.ag01=1
        GROUP BY m.code_commune
    ) A ON H.code_commune = A.code_commune

    -- 4. Jointure Emigration
    LEFT JOIN (
        SELECT m.code_commune, 
               COALESCE(sum(m.em01), 0) as total_emigres,
               COUNT(*) as menages_avec_emigres 
        FROM tmenage m where m.em00=1
        GROUP BY m.code_commune
    ) E ON H.code_commune = E.code_commune
    -- 5. Jointure avec enumeration
    LEFT JOIN (
        SELECT  SUBSTR(en.men_zd, 1, 5) as code_commune, 
                COUNT(*) as menages_enumeres
        FROM tenumeration en
        WHERE en.men_exist BETWEEN 1 AND 3
        GROUP BY SUBSTR(en.men_zd, 1, 5)
    ) EN ON H.code_commune = EN.code_commune
    -- 6. Jointure avec zd
    LEFT JOIN (
        SELECT  e.zd_commune as code_commune, 
               sum(e.zd_men) as total_menages_attendu,
                sum(e.zd_pop) as population_carto
        FROM zd e
        GROUP BY e.zd_commune
    ) J ON H.code_commune = J.code_commune

     LEFT JOIN (
            SELECT  substr(e.men_zd, 1,5) as code_commune, 
                count(e.men_zd) as menages_non_existe
            FROM tenumeration e where men_exist=3
            GROUP BY substr(e.men_zd, 1,5)
        ) I ON  H.code_commune = I.code_commune

        LEFT JOIN (
            SELECT  substr(e.men_zd, 1,5) as code_commune, 
                count(e.men_zd) as menages_ajoutes
            FROM tenumeration e where men_exist=2
            GROUP BY substr(e.men_zd, 1,5)
        ) K ON  H.code_commune = I.code_commune;

SELECT '✅ Stats par commune CORRIGÉES (Join)' AS status;



-- =====================================================
-- 4b. STATS PAR ZD (CORRIGÉE AVEC JOIN)
-- =====================================================

SELECT '📊 Calcul des statistiques par ZD (Méthode JOIN)...' AS status;

TRUNCATE TABLE stats_par_zd;

INSERT INTO stats_par_zd (
    code_region, code_departement, code_commune, mo_zd,
    total_menages_attendu, total_menages, total_population, nb_menages_plus_10, nb_menages_solo,
    population_rurale, menages_enumeres, menages_denombres,
    population_carto, population_collectee, average_deces,
    hommes, femmes, nb_enfants_moins_5, nb_residents_absents, nb_visiteurs,
    nb_naissances_vivantes, nb_femmes_15_49,
    menages_agricoles, total_emigres, menages_avec_emigres, menages_denombres_incomplets, menages_ajoutes, cas_refus, menages_non_existe
)
SELECT 
    H.code_region, H.code_departement, H.code_commune, H.mo_zd,
    J.total_menages_attendu, H.total_menages, H.total_population, H.nb_menages_plus_10, H.nb_menages_solo,
    H.population_rurale, COALESCE(EN.menages_enumeres, 0) as menages_enumeres, H.menages_denombres,
    J.population_carto, H.population_collectee,H.average_deces,
    
    -- Population (P)
    COALESCE(P.hommes, 0), COALESCE(P.femmes, 0), COALESCE(P.nb_enfants_moins_5, 0),
    COALESCE(P.nb_residents_absents, 0), COALESCE(P.nb_visiteurs, 0),
    COALESCE(P.nb_naissances_vivantes, 0), COALESCE(P.nb_femmes_15_49, 0),
    
    -- Agriculture (A) & Emigration (E)
    COALESCE(A.menages_agricoles, 0), COALESCE(E.total_emigres, 0), COALESCE(E.menages_avec_emigres, 0), H.menages_denombres_incomplets, K.menages_ajoutes, H.cas_refus, I.menages_non_existe
FROM 
    -- 1. Agrégation Ménages
    (SELECT 
        code_region, code_departement, code_commune, mo_zd,
        COUNT(*) as total_menages, COALESCE(SUM(xm40), 0) as total_population,
        SUM(CASE WHEN xm40 > 10 THEN 1 ELSE 0 END) as nb_menages_plus_10,
        SUM(CASE WHEN xm40 = 1 THEN 1 ELSE 0 END) as nb_menages_solo,
        SUM(CASE WHEN xm01 = 2 THEN 1 ELSE 0 END) as population_rurale,
        -- SUM(CASE WHEN men_exist_denombrement > 0 THEN 1 ELSE 0 END) as menages_enumeres,
         SUM(CASE WHEN ( xm09 = 1 and meta_intro=1) THEN 1 ELSE 0 END) as menages_denombres,
        SUM(CASE WHEN (xm09 = 2 and meta_intro=1) THEN 1 ELSE 0 END) as menages_denombres_incomplets,
        -- SUM(CASE WHEN men_exist_denombrement = 2 THEN 1 ELSE 0 END) as menages_ajoutes,
        SUM(CASE WHEN meta_intro = 2 THEN 1 ELSE 0 END) as cas_refus,
        -- COALESCE(SUM(xm20), 0) as population_carto,
        COALESCE(SUM(xm40), 0) as population_collectee,
        SUM(CASE WHEN d00 =1 THEN 1 ELSE 0 END) as average_deces
        
     FROM tmenage 
     GROUP BY code_region, code_departement, code_commune, mo_zd
    ) H

    -- 2. Jointure Population
    LEFT JOIN (
        SELECT m.mo_zd,
            SUM(CASE WHEN c.c03 = 1 THEN 1 ELSE 0 END) as hommes,
            SUM(CASE WHEN c.c03 = 2 THEN 1 ELSE 0 END) as femmes,
            SUM(CASE WHEN c.c06 < 5 THEN 1 ELSE 0 END) as nb_enfants_moins_5,
            SUM(CASE WHEN c.c04 = 2 THEN 1 ELSE 0 END) as nb_residents_absents,
            SUM(CASE WHEN c.c04 = 3 THEN 1 ELSE 0 END) as nb_visiteurs,
            SUM(CASE WHEN c.c27t > 0 THEN c.c27t ELSE 0 END) as nb_naissances_vivantes,
            SUM(CASE WHEN c.c03 = 2 AND c.c06 BETWEEN 15 AND 49 THEN 1 ELSE 0 END) as nb_femmes_15_49
        FROM tcaracteristique c JOIN tmenage m ON m.`level-1-id` = c.`level-1-id`
        GROUP BY m.mo_zd
    ) P ON H.mo_zd = P.mo_zd

    -- 3. Jointure Agriculture
    LEFT JOIN (
        SELECT m.mo_zd, COUNT(*) as menages_agricoles
       FROM tmenage m where m.ag01=1
        GROUP BY m.mo_zd
    ) A ON H.mo_zd = A.mo_zd

    -- 4. Jointure Emigration
    LEFT JOIN (
        SELECT m.mo_zd, 
                COALESCE(sum(m.em01), 0) as total_emigres,
               COUNT(*) as menages_avec_emigres
        FROM tmenage m where m.em00=1
        GROUP BY m.mo_zd
    ) E ON H.mo_zd = E.mo_zd
     -- 6. Jointure avec enumeration
    LEFT JOIN (
        SELECT  en.men_zd as mo_zd, 
                COUNT(*) as menages_enumeres
        FROM tenumeration en
        WHERE en.men_exist BETWEEN 1 AND 3
        GROUP BY en.men_zd
    ) EN ON H.mo_zd = EN.mo_zd
    -- 5. Jointure avec zd
    LEFT JOIN (
        SELECT  e.zd_zd as mo_zd, 
               sum(e.zd_men) as total_menages_attendu,
                sum(e.zd_pop) as population_carto
        FROM zd e
        GROUP BY e.zd_zd
    ) J ON H.mo_zd = J.mo_zd

     LEFT JOIN (
            SELECT  e.men_zd as mo_zd, 
                count(e.men_zd) as menages_non_existe
            FROM tenumeration e where men_exist=3
            GROUP BY e.men_zd
        ) I ON  H.mo_zd = I.mo_zd

         LEFT JOIN (
            SELECT  e.men_zd as mo_zd, 
                count(e.men_zd) as menages_ajoutes
            FROM tenumeration e where men_exist=2
            GROUP BY e.men_zd
        ) K ON  H.mo_zd = I.mo_zd;

SELECT '✅ Stats par ZD CORRIGÉES (Join)' AS status;


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
SELECT 'stats_par_zd', COUNT(*) FROM stats_par_zd
UNION ALL
SELECT 'pyramide_ages_nationale', COUNT(*) FROM pyramide_ages_nationale
UNION ALL
SELECT 'pyramide_ages_region', COUNT(*) FROM pyramide_ages_region
UNION ALL
SELECT 'pyramide_ages_departement', COUNT(*) FROM pyramide_ages_departement
UNION ALL
SELECT 'pyramide_ages_commune', COUNT(*) FROM pyramide_ages_commune;