var DataTypes = require("sequelize").DataTypes;
var _agent = require("./agent");
var _agriculture = require("./agriculture");
var _binary-data = require("./binary-data");
var _binary-sync-history = require("./binary-sync-history");
var _binary-sync-history-archive = require("./binary-sync-history-archive");
var _caracteristique = require("./caracteristique");
var _case-binary-data = require("./case-binary-data");
var _cases = require("./cases");
var _commune = require("./commune");
var _deces = require("./deces");
var _departement = require("./departement");
var _elevage = require("./elevage");
var _emigration = require("./emigration");
var _file_revisions = require("./file_revisions");
var _habitat = require("./habitat");
var _level-1 = require("./level-1");
var _menage = require("./menage");
var _menages_rec = require("./menages_rec");
var _meta = require("./meta");
var _notes = require("./notes");
var _region = require("./region");
var _sync_history = require("./sync_history");
var _tagriculture = require("./tagriculture");
var _tcaracteristique = require("./tcaracteristique");
var _tcaracteristique_old = require("./tcaracteristique_old");
var _tdeces = require("./tdeces");
var _televage = require("./televage");
var _temigration = require("./temigration");
var _thabitat = require("./thabitat");
var _tlevel1 = require("./tlevel1");
var _tmenage = require("./tmenage");
var _tranche_age = require("./tranche_age");
var _vector_clock = require("./vector_clock");

function initModels(sequelize) {
  var agent = _agent(sequelize, DataTypes);
  var agriculture = _agriculture(sequelize, DataTypes);
  var binary-data = _binary-data(sequelize, DataTypes);
  var binary-sync-history = _binary-sync-history(sequelize, DataTypes);
  var binary-sync-history-archive = _binary-sync-history-archive(sequelize, DataTypes);
  var caracteristique = _caracteristique(sequelize, DataTypes);
  var case-binary-data = _case-binary-data(sequelize, DataTypes);
  var cases = _cases(sequelize, DataTypes);
  var commune = _commune(sequelize, DataTypes);
  var deces = _deces(sequelize, DataTypes);
  var departement = _departement(sequelize, DataTypes);
  var elevage = _elevage(sequelize, DataTypes);
  var emigration = _emigration(sequelize, DataTypes);
  var file_revisions = _file_revisions(sequelize, DataTypes);
  var habitat = _habitat(sequelize, DataTypes);
  var level-1 = _level-1(sequelize, DataTypes);
  var menage = _menage(sequelize, DataTypes);
  var menages_rec = _menages_rec(sequelize, DataTypes);
  var meta = _meta(sequelize, DataTypes);
  var notes = _notes(sequelize, DataTypes);
  var region = _region(sequelize, DataTypes);
  var sync_history = _sync_history(sequelize, DataTypes);
  var tagriculture = _tagriculture(sequelize, DataTypes);
  var tcaracteristique = _tcaracteristique(sequelize, DataTypes);
  var tcaracteristique_old = _tcaracteristique_old(sequelize, DataTypes);
  var tdeces = _tdeces(sequelize, DataTypes);
  var televage = _televage(sequelize, DataTypes);
  var temigration = _temigration(sequelize, DataTypes);
  var thabitat = _thabitat(sequelize, DataTypes);
  var tlevel1 = _tlevel1(sequelize, DataTypes);
  var tmenage = _tmenage(sequelize, DataTypes);
  var tranche_age = _tranche_age(sequelize, DataTypes);
  var vector_clock = _vector_clock(sequelize, DataTypes);


  return {
    agent,
    agriculture,
    binary-data,
    binary-sync-history,
    binary-sync-history-archive,
    caracteristique,
    case-binary-data,
    cases,
    commune,
    deces,
    departement,
    elevage,
    emigration,
    file_revisions,
    habitat,
    level-1,
    menage,
    menages_rec,
    meta,
    notes,
    region,
    sync_history,
    tagriculture,
    tcaracteristique,
    tcaracteristique_old,
    tdeces,
    televage,
    temigration,
    thabitat,
    tlevel1,
    tmenage,
    tranche_age,
    vector_clock,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
