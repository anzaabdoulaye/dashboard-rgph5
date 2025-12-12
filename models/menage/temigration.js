const { DataTypes } = require('sequelize');
const menageDB = require('../../config/menageDB');


const TEmigration = menageDB.define('TEmigration', {
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
    'emigration-id': {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    'level-1-id': {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    occ: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    em02: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    em03n: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    em03p: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    em04: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    em05: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    em06m: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    em06a: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    em07: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    em08: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    em09: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    em09a: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    em10: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    em11: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    em12: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    em12a: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'temigration',
    timestamps: false
  });

  module.exports = TEmigration;