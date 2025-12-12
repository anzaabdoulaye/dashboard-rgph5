const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Departement = require('./Departement');

const Commune = sequelize.define('Commune', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  departement_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Departement,
      key: 'id',
    },
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  libelle: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
}, {
  tableName: 'commune',
  timestamps: false,
});

// Association
Departement.hasMany(Commune, { foreignKey: 'departement_id' });
Commune.belongsTo(Departement, { foreignKey: 'departement_id' });

module.exports = Commune;
