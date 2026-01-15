-- =====================================================
-- TABLES PRÉ-AGRÉGÉES POUR PERFORMANCES OPTIMALES
-- Ces tables stockent des statistiques calculées à l'avance
-- =====================================================

USE menage;

-- =====================================================
-- 1. TABLE STATS PAR RÉGION
-- =====================================================

DROP TABLE IF EXISTS stats_par_region;

CREATE TABLE stats_par_region (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_region VARCHAR(10),
    region VARCHAR(100),
    
    -- Stats ménages
    total_menages INT DEFAULT 0,
    total_population BIGINT DEFAULT 0,
    nb_menages_plus_10 INT DEFAULT 0,
    nb_menages_solo INT DEFAULT 0,
    population_rurale INT DEFAULT 0,
    menages_enumeres INT DEFAULT 0,
    menages_denombres INT DEFAULT 0,
    population_carto INT DEFAULT 0,
    population_collectee INT DEFAULT 0,
    average_deces INT DEFAULT 0,
    
    -- Stats population
    hommes INT DEFAULT 0,
    femmes INT DEFAULT 0,
    nb_enfants_moins_5 INT DEFAULT 0,
    nb_residents_absents INT DEFAULT 0,
    nb_visiteurs INT DEFAULT 0,
    nb_naissances_vivantes INT DEFAULT 0,
    nb_femmes_15_49 INT DEFAULT 0,
    
    -- Stats agricoles et émigration
    menages_agricoles INT DEFAULT 0,
    total_emigres INT DEFAULT 0,
    menages_avec_emigres INT DEFAULT 0,
    
    date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_code_region (code_region)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. TABLE STATS PAR DÉPARTEMENT
-- =====================================================

DROP TABLE IF EXISTS stats_par_departement;

CREATE TABLE stats_par_departement (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_region VARCHAR(10),
    code_departement VARCHAR(10),
    departement VARCHAR(100),
    
    -- Stats ménages
    total_menages INT DEFAULT 0,
    total_population BIGINT DEFAULT 0,
    nb_menages_plus_10 INT DEFAULT 0,
    nb_menages_solo INT DEFAULT 0,
    population_rurale INT DEFAULT 0,
    menages_enumeres INT DEFAULT 0,
    menages_denombres INT DEFAULT 0,
    population_carto INT DEFAULT 0,
    population_collectee INT DEFAULT 0,
    average_deces INT DEFAULT 0,
    
    -- Stats population
    hommes INT DEFAULT 0,
    femmes INT DEFAULT 0,
    nb_enfants_moins_5 INT DEFAULT 0,
    nb_residents_absents INT DEFAULT 0,
    nb_visiteurs INT DEFAULT 0,
    nb_naissances_vivantes INT DEFAULT 0,
    nb_femmes_15_49 INT DEFAULT 0,
    
    -- Stats agricoles et émigration
    menages_agricoles INT DEFAULT 0,
    total_emigres INT DEFAULT 0,
    menages_avec_emigres INT DEFAULT 0,
    
    date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_code_departement (code_departement),
    INDEX idx_code_region_dept (code_region, code_departement)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. TABLE STATS PAR COMMUNE
-- =====================================================

DROP TABLE IF EXISTS stats_par_commune;

CREATE TABLE stats_par_commune (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_region VARCHAR(10),
    code_departement VARCHAR(10),
    code_commune VARCHAR(10),
    commune VARCHAR(100),
    
    -- Stats ménages
    total_menages INT DEFAULT 0,
    total_population BIGINT DEFAULT 0,
    nb_menages_plus_10 INT DEFAULT 0,
    nb_menages_solo INT DEFAULT 0,
    population_rurale INT DEFAULT 0,
    menages_enumeres INT DEFAULT 0,
    menages_denombres INT DEFAULT 0,
    population_carto INT DEFAULT 0,
    population_collectee INT DEFAULT 0,
    average_deces INT DEFAULT 0,
    
    -- Stats population
    hommes INT DEFAULT 0,
    femmes INT DEFAULT 0,
    nb_enfants_moins_5 INT DEFAULT 0,
    nb_residents_absents INT DEFAULT 0,
    nb_visiteurs INT DEFAULT 0,
    nb_naissances_vivantes INT DEFAULT 0,
    nb_femmes_15_49 INT DEFAULT 0,
    
    -- Stats agricoles et émigration
    menages_agricoles INT DEFAULT 0,
    total_emigres INT DEFAULT 0,
    menages_avec_emigres INT DEFAULT 0,
    
    date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_code_commune (code_commune),
    INDEX idx_code_region_dept_comm (code_region, code_departement, code_commune)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. TABLE STATS PAR ZD
-- =====================================================

DROP TABLE IF EXISTS stats_par_zd;

CREATE TABLE stats_par_zd (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_region VARCHAR(10),
    code_departement VARCHAR(10),
    code_commune VARCHAR(10),
    mo_zd VARCHAR(20), -- Identifiant de la ZD
    
    -- Stats ménages
    total_menages INT DEFAULT 0,
    total_population BIGINT DEFAULT 0,
    nb_menages_plus_10 INT DEFAULT 0,
    nb_menages_solo INT DEFAULT 0,
    population_rurale INT DEFAULT 0,
    menages_enumeres INT DEFAULT 0,
    menages_denombres INT DEFAULT 0,
    population_carto INT DEFAULT 0,
    population_collectee INT DEFAULT 0,
    average_deces INT DEFAULT 0,
    
    -- Stats population
    hommes INT DEFAULT 0,
    femmes INT DEFAULT 0,
    nb_enfants_moins_5 INT DEFAULT 0,
    nb_residents_absents INT DEFAULT 0,
    nb_visiteurs INT DEFAULT 0,
    nb_naissances_vivantes INT DEFAULT 0,
    nb_femmes_15_49 INT DEFAULT 0,
    
    -- Stats agricoles et émigration
    menages_agricoles INT DEFAULT 0,
    total_emigres INT DEFAULT 0,
    menages_avec_emigres INT DEFAULT 0,
    
    date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Index composite pour recherche rapide par ZD ou par Commune+ZD
    INDEX idx_zd (mo_zd),
    INDEX idx_geo_full (code_commune, mo_zd)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- 4. TABLE PYRAMIDE DES ÂGES PRÉ-CALCULÉE PAR RÉGION
-- =====================================================

DROP TABLE IF EXISTS pyramide_ages_region;

CREATE TABLE pyramide_ages_region (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_region VARCHAR(10),
    age_range VARCHAR(10),
    hommes INT DEFAULT 0,
    femmes INT DEFAULT 0,
    
    date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_region_age (code_region, age_range)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. TABLE PYRAMIDE DES ÂGES PRÉ-CALCULÉE PAR DÉPARTEMENT
-- =====================================================

DROP TABLE IF EXISTS pyramide_ages_departement;

CREATE TABLE pyramide_ages_departement (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_departement VARCHAR(10),
    age_range VARCHAR(10),
    hommes INT DEFAULT 0,
    femmes INT DEFAULT 0,
    
    date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_dept_age (code_departement, age_range)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. TABLE PYRAMIDE DES ÂGES PRÉ-CALCULÉE PAR COMMUNE
-- =====================================================

DROP TABLE IF EXISTS pyramide_ages_commune;

CREATE TABLE pyramide_ages_commune (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_commune VARCHAR(10),
    age_range VARCHAR(10),
    hommes INT DEFAULT 0,
    femmes INT DEFAULT 0,
    
    date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_comm_age (code_commune, age_range)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. TABLE PYRAMIDE DES ÂGES PRÉ-CALCULÉE PAR ZD
-- =====================================================
DROP TABLE IF EXISTS pyramide_ages_zd;

CREATE TABLE pyramide_ages_zd (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mo_zd VARCHAR(20),
    age_range VARCHAR(10),
    hommes INT DEFAULT 0,
    femmes INT DEFAULT 0,
    
    date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_zd_age (mo_zd, age_range)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. TABLE STATS NATIONALES (TOUS NIVEAUX)
-- =====================================================

DROP TABLE IF EXISTS stats_nationales;

CREATE TABLE stats_nationales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Stats ménages
    total_menages INT DEFAULT 0,
    total_population BIGINT DEFAULT 0,
    nb_menages_plus_10 INT DEFAULT 0,
    nb_menages_solo INT DEFAULT 0,
    population_rurale INT DEFAULT 0,
    menages_enumeres INT DEFAULT 0,
    menages_denombres INT DEFAULT 0,
    population_carto INT DEFAULT 0,
    population_collectee INT DEFAULT 0,
    average_deces INT DEFAULT 0,
    
    -- Stats population
    hommes INT DEFAULT 0,
    femmes INT DEFAULT 0,
    nb_enfants_moins_5 INT DEFAULT 0,
    nb_residents_absents INT DEFAULT 0,
    nb_visiteurs INT DEFAULT 0,
    nb_naissances_vivantes INT DEFAULT 0,
    nb_femmes_15_49 INT DEFAULT 0,
    
    -- Stats agricoles et émigration
    menages_agricoles INT DEFAULT 0,
    total_emigres INT DEFAULT 0,
    menages_avec_emigres INT DEFAULT 0,
    
    date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insérer une ligne par défaut pour les stats nationales
INSERT INTO stats_nationales (id) VALUES (1);

-- =====================================================
-- 8. TABLE PYRAMIDE DES ÂGES NATIONALE
-- =====================================================

DROP TABLE IF EXISTS pyramide_ages_nationale;

CREATE TABLE pyramide_ages_nationale (
    id INT AUTO_INCREMENT PRIMARY KEY,
    age_range VARCHAR(10),
    hommes INT DEFAULT 0,
    femmes INT DEFAULT 0,
    
    date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE INDEX idx_age (age_range)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INFORMATION
-- =====================================================

SELECT '✅ Tables pré-agrégées créées avec succès!' AS status;
SELECT 'ℹ️  Utilisez le script 03_populate_aggregated_tables.sql pour peupler ces tables' AS info;