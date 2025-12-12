const SequelizeAuto = require('sequelize-auto');
const menageDB = require('./config/menageDB'); // ta connexion Sequelize existante

// Tables “t” seulement
const tablesT = [
  'tmenage',
  'tdeces',
  'thabitat',
  'televage',
  'temigration',
  'tagriculture',
  'tcaracteristique',
  'tlevel1',
  'tranche_age'
];

const auto = new SequelizeAuto(menageDB, null, null, {
  directory: './models/menage', // dossier où générer les modèles
  tables: tablesT,              // tables ciblées
  noTimestamps: true,           // pas de createdAt / updatedAt
});

auto.run().then(data => {
  console.log('Modèles “t” générés avec menageDB !');
}).catch(err => {
  console.error('Erreur génération modèles :', err);
});
