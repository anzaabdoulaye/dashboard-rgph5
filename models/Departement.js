const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Region = require('./Region');

const Departement = sequelize.define('Departement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  region_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Region,
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
  tableName: 'departement',
  timestamps: false,
});

// Association
Region.hasMany(Departement, { foreignKey: 'region_id' });
Departement.belongsTo(Region, { foreignKey: 'region_id' });

module.exports = Departement;
