const { DataTypes } = require('sequelize');
const menageDB = require('../../config/menageDB');
const TLevel1 = require('./tlevel1');


const TDeces = menageDB.define('TDeces', {
    code_region: {
      type: DataTypes.STRING(1),
      allowNull: true
    },
    region: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    code_departement: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    departement: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    code_commune: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    commune: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    mo_zs: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    mo_zd: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    mo_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'deces-id': {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    'level-1-id': {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'level-1-id'
    },
    occ: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    d02: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    d03: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    d04: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    d05: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'tdeces',
    timestamps: false
  });

TDeces.belongsTo(TLevel1, {
  foreignKey: 'level-1-id',
  as: 'level1'
});

module.exports = TDeces;