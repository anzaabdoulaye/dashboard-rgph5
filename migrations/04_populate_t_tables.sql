INSERT INTO `tagriculture` SELECT * FROM `vagriculture`;


INSERT INTO `tcaracteristique` SELECT * FROM `vcaracteristique`;


INSERT INTO `tdeces` SELECT * FROM `vdeces`;


INSERT INTO `televage` SELECT * FROM `velevage`;

INSERT INTO `temigration` SELECT * FROM `vemigration`;


INSERT INTO `thabitat` SELECT * FROM `vhabitat`;


INSERT INTO `tmenage` SELECT * FROM `vmenage`;

insert into user_zd (mo_zd, agent) SELECT DISTINCT mo_zd, id10 from tmenage where mo_zd is not null and id10 is not null

INSERT INTO `tstats` SELECT * FROM `vstats`;
