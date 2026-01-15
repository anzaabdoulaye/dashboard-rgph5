-- menage.level1 source

CREATE OR REPLACE
ALGORITHM = UNDEFINED
VIEW `menage`.`level1` AS
SELECT
    `l`.`level-1-id` AS `level-1-id`,
    SUBSTR(`l`.`mo_zd`, 1, 1) AS `code_region`,
    `r`.`libelle` AS `region`,
    SUBSTR(`l`.`mo_zd`, 1, 3) AS `code_departement`,
    `d`.`libelle` AS `departement`,
    SUBSTR(`l`.`mo_zd`, 1, 5) AS `code_commune`,
    `c`.`libelle` AS `commune`,
    `l`.`mo_zs` AS `mo_zs`,
    `l`.`mo_zd` AS `mo_zd`,
    `l`.`mo_id` AS `mo_id`
FROM (
        (
            `menage`.`level-1` `l`
            JOIN `menage`.`region` `r`
              ON CONVERT(`r`.`code` USING utf8mb4) COLLATE utf8mb4_unicode_ci
               = CONVERT(SUBSTR(`l`.`mo_zd`, 1, 1) USING utf8mb4) COLLATE utf8mb4_unicode_ci
        )
        JOIN `menage`.`departement` `d`
          ON CONVERT(`d`.`code` USING utf8mb4) COLLATE utf8mb4_unicode_ci
           = CONVERT(SUBSTR(`l`.`mo_zd`, 1, 3) USING utf8mb4) COLLATE utf8mb4_unicode_ci
    )
    JOIN `menage`.`commune` `c`
      ON CONVERT(`c`.`code` USING utf8mb4) COLLATE utf8mb4_unicode_ci
       = CONVERT(SUBSTR(`l`.`mo_zd`, 1, 5) USING utf8mb4) COLLATE utf8mb4_unicode_ci;


CREATE TABLE `tlevel1` (
  `level-1-id` int NOT NULL,
  `code_region` varchar(1) DEFAULT NULL,
  `region` varchar(50) NOT NULL,
  `code_departement` varchar(3) DEFAULT NULL,
  `departement` varchar(150) NOT NULL,
  `code_commune` varchar(5) DEFAULT NULL,
  `commune` varchar(150) NOT NULL,
  `mo_zs` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `mo_zd` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `mo_id` int DEFAULT NULL,
  PRIMARY KEY (`level-1-id`),
  UNIQUE KEY `mo_zs` (`mo_zs`,`mo_zd`,`mo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;




INSERT INTO `tlevel1`
SELECT * FROM `menage`.`level1`;
-- menage.vagriculture source

CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW `menage`.`vagriculture` AS
select
    `l`.`code_region` AS `code_region`,
    `l`.`region` AS `region`,
    `l`.`code_departement` AS `code_departement`,
    `l`.`departement` AS `departement`,
    `l`.`code_commune` AS `code_commune`,
    `l`.`commune` AS `commune`,
    `l`.`mo_zs` AS `mo_zs`,
    `l`.`mo_zd` AS `mo_zd`,
    `l`.`mo_id` AS `mo_id`,
    `a`.`agriculture-id` AS `agriculture-id`,
    `a`.`level-1-id` AS `level-1-id`,
    `a`.`occ` AS `occ`,
    `a`.`ag00` AS `ag00`,
    `a`.`ag0l` AS `ag0l`,
    `a`.`ag02a` AS `ag02a`,
    `a`.`ag02b` AS `ag02b`,
    `a`.`ag02c` AS `ag02c`,
    `a`.`ag02d` AS `ag02d`,
    `a`.`ag02e1` AS `ag02e1`,
    `a`.`ag02e2` AS `ag02e2`
from
    (`menage`.`tlevel1` `l`
join `menage`.`agriculture` `a`)
where
    (`l`.`level-1-id` = `a`.`level-1-id`);


-- menage.vcaracteristique source

CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW `menage`.`vcaracteristique` AS
select
    `l`.`code_region` AS `code_region`,
    `l`.`region` AS `region`,
    `l`.`code_departement` AS `code_departement`,
    `l`.`departement` AS `departement`,
    `l`.`code_commune` AS `code_commune`,
    `l`.`commune` AS `commune`,
    `l`.`mo_zs` AS `mo_zs`,
    `l`.`mo_zd` AS `mo_zd`,
    `l`.`mo_id` AS `mo_id`,
    `a`.`caracteristique-id` AS `caracteristique-id`,
    `a`.`level-1-id` AS `level-1-id`,
    `a`.`occ` AS `occ`,
    `a`.`c00` AS `c00`,
    `a`.`c01n` AS `c01n`,
    `a`.`c01p` AS `c01p`,
    `a`.`c01` AS `c01`,
    `a`.`c02` AS `c02`,
    `a`.`c03` AS `c03`,
    `a`.`c04` AS `c04`,
    `a`.`c05` AS `c05`,
    `a`.`c05_jj` AS `c05_jj`,
    `a`.`c05_mm` AS `c05_mm`,
    `a`.`c05_aaaa` AS `c05_aaaa`,
    `a`.`c06` AS `c06`,
    `a`.`c07` AS `c07`,
    `a`.`c07r` AS `c07r`,
    `a`.`c07d` AS `c07d`,
    `a`.`c07c` AS `c07c`,
    `a`.`c08a` AS `c08a`,
    `a`.`c08b` AS `c08b`,
    `a`.`c08c` AS `c08c`,
    `a`.`c09` AS `c09`,
    `a`.`c10` AS `c10`,
    `a`.`c10a` AS `c10a`,
    `a`.`c11p10` AS `c11p10`,
    `a`.`c11r10` AS `c11r10`,
    `a`.`c11d10` AS `c11d10`,
    `a`.`c11c10` AS `c11c10`,
    `a`.`c11m10` AS `c11m10`,
    `a`.`c11m10a` AS `c11m10a`,
    `a`.`c11p5` AS `c11p5`,
    `a`.`c11r5` AS `c11r5`,
    `a`.`c11d5` AS `c11d5`,
    `a`.`c11c5` AS `c11c5`,
    `a`.`c11m5` AS `c11m5`,
    `a`.`c11m5a` AS `c11m5a`,
    `a`.`c11p1` AS `c11p1`,
    `a`.`c11r1` AS `c11r1`,
    `a`.`c11d1` AS `c11d1`,
    `a`.`c11c1` AS `c11c1`,
    `a`.`c11m1` AS `c11m1`,
    `a`.`c11m1a` AS `c11m1a`,
    `a`.`c11me` AS `c11me`,
    `a`.`c11ae` AS `c11ae`,
    `a`.`c12` AS `c12`,
    `a`.`c13` AS `c13`,
    `a`.`c14` AS `c14`,
    `a`.`c15a` AS `c15a`,
    `a`.`c15b` AS `c15b`,
    `a`.`c15c` AS `c15c`,
    `a`.`c15d` AS `c15d`,
    `a`.`c15e` AS `c15e`,
    `a`.`c15f` AS `c15f`,
    `a`.`c15g` AS `c15g`,
    `a`.`c15h` AS `c15h`,
    `a`.`c16a` AS `c16a`,
    `a`.`c16b` AS `c16b`,
    `a`.`c16ba` AS `c16ba`,
    `a`.`c16c` AS `c16c`,
    `a`.`c16d` AS `c16d`,
    `a`.`c16e` AS `c16e`,
    `a`.`c16` AS `c16`,
    `a`.`c16f` AS `c16f`,
    `a`.`c17` AS `c17`,
    `a`.`c17a` AS `c17a`,
    `a`.`c18` AS `c18`,
    `a`.`c18a` AS `c18a`,
    `a`.`c18b` AS `c18b`,
    `a`.`c19` AS `c19`,
    `a`.`c20` AS `c20`,
    `a`.`c21` AS `c21`,
    `a`.`c21a` AS `c21a`,
    `a`.`c22` AS `c22`,
    `a`.`c22a` AS `c22a`,
    `a`.`c23` AS `c23`,
    `a`.`c23a` AS `c23a`,
    `a`.`c24_t` AS `c24_t`,
    `a`.`c24_m` AS `c24_m`,
    `a`.`c24_f` AS `c24_f`,
    `a`.`c25_t` AS `c25_t`,
    `a`.`c25_m` AS `c25_m`,
    `a`.`c25_f` AS `c25_f`,
    `a`.`c26_t` AS `c26_t`,
    `a`.`c26_m` AS `c26_m`,
    `a`.`c26_f` AS `c26_f`,
    `a`.`c27_t` AS `c27_t`,
    `a`.`c27_m` AS `c27_m`,
    `a`.`c27_f` AS `c27_f`,
    `a`.`c28` AS `c28`,
    `a`.`c29` AS `c29`,
    `a`.`membre_controle` AS `membre_controle`,
    `a`.`is_deleted` AS `is_deleted`,
    `t`.`libelle` AS `tranche_age`,
    (case
        when (`a`.`c06` between 19 and 45) then 1
        else 0
    end) AS `age_19_45`
from
    ((`menage`.`tlevel1` `l`
join `menage`.`caracteristique` `a`)
left join `menage`.`tranche_age` `t` on
    ((`a`.`c06` between `t`.`min_value` and `t`.`max_value`)))
where
    (`l`.`level-1-id` = `a`.`level-1-id`);

-- menage.vdeces source

CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW `menage`.`vdeces` AS
select
    `l`.`code_region` AS `code_region`,
    `l`.`region` AS `region`,
    `l`.`code_departement` AS `code_departement`,
    `l`.`departement` AS `departement`,
    `l`.`code_commune` AS `code_commune`,
    `l`.`commune` AS `commune`,
    `l`.`mo_zs` AS `mo_zs`,
    `l`.`mo_zd` AS `mo_zd`,
    `l`.`mo_id` AS `mo_id`,
    `a`.`deces-id` AS `deces-id`,
    `a`.`level-1-id` AS `level-1-id`,
    `a`.`occ` AS `occ`,
    `a`.`d02` AS `d02`,
    `a`.`d03` AS `d03`,
    `a`.`d04` AS `d04`,
    `a`.`d05` AS `d05`
from
    (`menage`.`tlevel1` `l`
join `menage`.`deces` `a`)
where
    (`l`.`level-1-id` = `a`.`level-1-id`);

-- menage.velevage source

CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW `menage`.`velevage` AS
select
    `l`.`code_region` AS `code_region`,
    `l`.`region` AS `region`,
    `l`.`code_departement` AS `code_departement`,
    `l`.`departement` AS `departement`,
    `l`.`code_commune` AS `code_commune`,
    `l`.`commune` AS `commune`,
    `l`.`mo_zs` AS `mo_zs`,
    `l`.`mo_zd` AS `mo_zd`,
    `l`.`mo_id` AS `mo_id`,
    `a`.`elevage-id` AS `elevage-id`,
    `a`.`level-1-id` AS `level-1-id`,
    `a`.`occ` AS `occ`,
    `a`.`e001` AS `e001`,
    `a`.`e002` AS `e002`,
    `a`.`e003` AS `e003`,
    `a`.`e004` AS `e004`,
    `a`.`e005` AS `e005`
from
    (`menage`.`tlevel1` `l`
join `menage`.`elevage` `a`)
where
    (`l`.`level-1-id` = `a`.`level-1-id`);


-- menage.vemigration source

CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW `menage`.`vemigration` AS
select
    `l`.`code_region` AS `code_region`,
    `l`.`region` AS `region`,
    `l`.`code_departement` AS `code_departement`,
    `l`.`departement` AS `departement`,
    `l`.`code_commune` AS `code_commune`,
    `l`.`commune` AS `commune`,
    `l`.`mo_zs` AS `mo_zs`,
    `l`.`mo_zd` AS `mo_zd`,
    `l`.`mo_id` AS `mo_id`,
    `a`.`emigration-id` AS `emigration-id`,
    `a`.`level-1-id` AS `level-1-id`,
    `a`.`occ` AS `occ`,
    `a`.`em02` AS `em02`,
    `a`.`em03n` AS `em03n`,
    `a`.`em03p` AS `em03p`,
    `a`.`em04` AS `em04`,
    `a`.`em05` AS `em05`,
    `a`.`em06m` AS `em06m`,
    `a`.`em06a` AS `em06a`,
    `a`.`em07` AS `em07`,
    `a`.`em08` AS `em08`,
    `a`.`em09` AS `em09`,
    `a`.`em09a` AS `em09a`,
    `a`.`em10` AS `em10`,
    `a`.`em11` AS `em11`,
    `a`.`em12` AS `em12`,
    `a`.`em12a` AS `em12a`
from
    (`menage`.`tlevel1` `l`
join `menage`.`emigration` `a`)
where
    (`l`.`level-1-id` = `a`.`level-1-id`);



-- menage.vhabitat source

CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW `menage`.`vhabitat` AS
select
    `l`.`code_region` AS `code_region`,
    `l`.`region` AS `region`,
    `l`.`code_departement` AS `code_departement`,
    `l`.`departement` AS `departement`,
    `l`.`code_commune` AS `code_commune`,
    `l`.`commune` AS `commune`,
    `l`.`mo_zs` AS `mo_zs`,
    `l`.`mo_zd` AS `mo_zd`,
    `l`.`mo_id` AS `mo_id`,
    `a`.`habitat-id` AS `habitat-id`,
    `a`.`level-1-id` AS `level-1-id`,
    `a`.`h01` AS `h01`,
    `a`.`h01a` AS `h01a`,
    `a`.`h02` AS `h02`,
    `a`.`h03` AS `h03`,
    `a`.`h03a` AS `h03a`,
    `a`.`h04` AS `h04`,
    `a`.`h04a` AS `h04a`,
    `a`.`h05` AS `h05`,
    `a`.`h05a` AS `h05a`,
    `a`.`h06a` AS `h06a`,
    `a`.`h06b` AS `h06b`,
    `a`.`h07` AS `h07`,
    `a`.`h07a` AS `h07a`,
    `a`.`h07m` AS `h07m`,
    `a`.`h08` AS `h08`,
    `a`.`h08a` AS `h08a`,
    `a`.`h09` AS `h09`,
    `a`.`h09a` AS `h09a`,
    `a`.`h10` AS `h10`,
    `a`.`h10a` AS `h10a`,
    `a`.`h11` AS `h11`,
    `a`.`h11a` AS `h11a`,
    `a`.`h12` AS `h12`,
    `a`.`h12a` AS `h12a`,
    `a`.`h13` AS `h13`,
    `a`.`h13a` AS `h13a`,
    `a`.`h141` AS `h141`,
    `a`.`h14110` AS `h14110`,
    `a`.`h142` AS `h142`,
    `a`.`h143` AS `h143`,
    `a`.`h14on` AS `h14on`,
    `a`.`h14re` AS `h14re`,
    `a`.`h144` AS `h144`,
    `a`.`h145a` AS `h145a`,
    `a`.`h145` AS `h145`,
    `a`.`h144a` AS `h144a`,
    `a`.`h146` AS `h146`,
    `a`.`h147` AS `h147`,
    `a`.`h1481` AS `h1481`,
    `a`.`h148` AS `h148`,
    `a`.`h149` AS `h149`,
    `a`.`h1410` AS `h1410`,
    `a`.`h1411` AS `h1411`,
    `a`.`h1412` AS `h1412`,
    `a`.`h1413` AS `h1413`,
    `a`.`h1414` AS `h1414`,
    `a`.`h1415` AS `h1415`,
    `a`.`h1416` AS `h1416`,
    `a`.`h14161` AS `h14161`,
    `a`.`h1417` AS `h1417`,
    `a`.`h1418` AS `h1418`,
    `a`.`h1419` AS `h1419`,
    `a`.`h1420` AS `h1420`,
    `a`.`h1421` AS `h1421`,
    `a`.`h1422` AS `h1422`,
    `a`.`h1423` AS `h1423`,
    `a`.`h1424` AS `h1424`,
    `a`.`h14m` AS `h14m`,
    `a`.`h14r` AS `h14r`,
    `a`.`h14w` AS `h14w`,
    `a`.`h14de` AS `h14de`,
    `a`.`h1425` AS `h1425`,
    `a`.`h1426` AS `h1426`
from
    (`menage`.`tlevel1` `l`
join `menage`.`habitat` `a`)
where
    (`l`.`level-1-id` = `a`.`level-1-id`);


-- menage.vmenage source

CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW `menage`.`vmenage` AS
select
    `l`.`code_region` AS `code_region`,
    `l`.`region` AS `region`,
    `l`.`code_departement` AS `code_departement`,
    `l`.`departement` AS `departement`,
    `l`.`code_commune` AS `code_commune`,
    `l`.`commune` AS `commune`,
    `l`.`mo_zs` AS `mo_zs`,
    `l`.`mo_zd` AS `mo_zd`,
    `l`.`mo_id` AS `mo_id`,
    `a`.`menage-id` AS `menage-id`,
    `a`.`level-1-id` AS `level-1-id`,
    `a`.`id01` AS `id01`,
    `a`.`id02` AS `id02`,
    `a`.`id03` AS `id03`,
    `a`.`id04` AS `id04`,
    `a`.`id05` AS `id05`,
    `a`.`id06` AS `id06`,
    `a`.`id07` AS `id07`,
    `a`.`xm01` AS `xm01`,
    `a`.`xm02` AS `xm02`,
    `a`.`xm02g` AS `xm02g`,
    `a`.`xm03` AS `xm03`,
    `a`.`xm04` AS `xm04`,
    `a`.`xm05` AS `xm05`,
    `a`.`xm05i` AS `xm05i`,
    `a`.`xm06` AS `xm06`,
    `a`.`xm07` AS `xm07`,
    `a`.`xm07c` AS `xm07c`,
    `a`.`xm08l` AS `xm08l`,
    `a`.`xm08` AS `xm08`,
    `a`.`xm09` AS `xm09`,
    `a`.`xm10` AS `xm10`,
    `a`.`xm12` AS `xm12`,
    `a`.`xm12lo` AS `xm12lo`,
    `a`.`xm12la` AS `xm12la`,
    `a`.`xm12al` AS `xm12al`,
    `a`.`xm12pr` AS `xm12pr`,
    `a`.`xm13` AS `xm13`,
    `a`.`xm13a` AS `xm13a`,
    `a`.`xm14` AS `xm14`,
    `a`.`xm14_jj` AS `xm14_jj`,
    `a`.`xm14_mm` AS `xm14_mm`,
    `a`.`xm14_aaaa` AS `xm14_aaaa`,
    `a`.`xm15` AS `xm15`,
    `a`.`xm15h` AS `xm15h`,
    `a`.`xm15l` AS `xm15l`,
    `a`.`xm16` AS `xm16`,
    `a`.`xm16_jj` AS `xm16_jj`,
    `a`.`xm16_mm` AS `xm16_mm`,
    `a`.`xm16_aaaa` AS `xm16_aaaa`,
    `a`.`xm17` AS `xm17`,
    `a`.`xm17h` AS `xm17h`,
    `a`.`xm17l` AS `xm17l`,
    `a`.`xm50` AS `xm50`,
    `a`.`xm20` AS `xm20`,
    `a`.`xm30` AS `xm30`,
    `a`.`xm40` AS `xm40`,
    `a`.`xm60` AS `xm60`,
    `a`.`xm41` AS `xm41`,
    `a`.`d00` AS `d00`,
    `a`.`d01` AS `d01`,
    `a`.`ag01` AS `ag01`,
    `a`.`ag01b` AS `ag01b`,
    `a`.`em00` AS `em00`,
    `a`.`em01` AS `em01`,
    `a`.`intro_membre` AS `intro_membre`,
    `a`.`nb_residents` AS `nb_residents`,
    `a`.`nb_resident_presents` AS `nb_resident_presents`,
    `a`.`nb_rp_h` AS `nb_rp_h`
from
    (`menage`.`tlevel1` `l`
join `menage`.`menage` `a`)
where
    (`l`.`level-1-id` = `a`.`level-1-id`);

