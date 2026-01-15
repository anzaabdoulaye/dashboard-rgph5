-- File: create_indexes_optimized.sql
USE menage;

SET SESSION sql_log_bin = 0;  -- Désactive le binlog temporairement
SET SESSION sort_buffer_size = 64*1024*1024;  -- 64M

-- Créez UNIQUEMENT ces 6 index (supprimez d'abord les doublons si nécessaire)
CREATE INDEX idx_menage_geo_filters ON tmenage(code_region, code_departement, code_commune, mo_zd) ALGORITHM=INPLACE LOCK=NONE;
CREATE INDEX idx_menage_stats ON tmenage(`level-1-id`, xm40, nb_residents) ALGORITHM=INPLACE LOCK=NONE;
CREATE INDEX idx_caracteristique_stats ON tcaracteristique(`level-1-id`, c03, c06) ALGORITHM=INPLACE LOCK=NONE;
CREATE INDEX idx_caracteristique_femmes_age ON tcaracteristique(c03, c06) ALGORITHM=INPLACE LOCK=NONE;
CREATE INDEX idx_agriculture_level1id ON tagriculture(`level-1-id`) ALGORITHM=INPLACE LOCK=NONE;
CREATE INDEX idx_emigration_level1id ON temigration(`level-1-id`) ALGORITHM=INPLACE LOCK=NONE;

ANALYZE TABLE tmenage, tcaracteristique, tagriculture, temigration;