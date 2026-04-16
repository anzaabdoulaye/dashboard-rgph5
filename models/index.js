const sequelize = require('../config/menageDB');
const User = require('./User');
const Region = require('./Region');
const Departement = require('./Departement');
const Commune = require('./Commune');

// =========================
// RELATIONS
// =========================

// Région -> Départements
Region.hasMany(Departement, {
  foreignKey: 'id_region'
});
Departement.belongsTo(Region, {
  foreignKey: 'id_region'
});

// Département -> Communes
Departement.hasMany(Commune, {
  foreignKey: 'id_departement'
});
Commune.belongsTo(Departement, {
  foreignKey: 'id_departement'
});

// Région -> Users
Region.hasMany(User, {
  foreignKey: 'region_id'
});
User.belongsTo(Region, {
  foreignKey: 'region_id'
});

// Département -> Users
Departement.hasMany(User, {
  foreignKey: 'departement_id'
});
User.belongsTo(Departement, {
  foreignKey: 'departement_id'
});

// Commune -> Users
Commune.hasMany(User, {
  foreignKey: 'commune_id'
});
User.belongsTo(Commune, {
  foreignKey: 'commune_id'
});

// =========================
// SYNCHRONISATION
// =========================
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // En développement seulement
    await sequelize.sync({ alter: true });
    console.log('Database synchronized.');
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

syncDatabase();

// =========================
// EXPORTS
// =========================
module.exports = {
  sequelize,
  User,
  Region,
  Departement,
  Commune,
};