const sequelize = require('../config/database');
const User = require('./User');
const Region = require('./Region');
const Departement = require('./Departement');
const Commune = require('./Commune');

// Définition des relations entre modèles
Region.hasMany(Departement, { foreignKey: 'id_region', sourceKey: 'id_region' });
Departement.belongsTo(Region, { foreignKey: 'id_region', targetKey: 'id_region' });

Departement.hasMany(Commune, { foreignKey: 'id_departement', sourceKey: 'id_departement' });
Commune.belongsTo(Departement, { foreignKey: 'id_departement', targetKey: 'id_departement' });

Commune.hasMany(User, { foreignKey: 'commune_id', sourceKey: 'id_commune' });
User.belongsTo(Commune, { foreignKey: 'commune_id', targetKey: 'id_commune' });

Region.hasMany(User, { foreignKey: 'region_id', sourceKey: 'id_region' });
User.belongsTo(Region, { foreignKey: 'region_id', targetKey: 'id_region' });

Departement.hasMany(User, { foreignKey: 'departement_id', sourceKey: 'id_departement' });
User.belongsTo(Departement, { foreignKey: 'departement_id', targetKey: 'id_departement' });

// Synchronisation
const syncDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');
        await sequelize.sync({ alter: true });
        console.log('Database synchronized.');
    } catch (error) {
        console.error('Database connection error:', error);
    }
};
syncDatabase();

// Export de tous les modèles
module.exports = {
    sequelize,
    User,
    Region,
    Departement,
    Commune,
};
