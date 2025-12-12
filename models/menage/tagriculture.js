const { DataTypes } = require('sequelize');
const menageDB = require('../../config/menageDB');
const TLevel1 = require('./tlevel1');

const TAgriculture = menageDB.define('TAgriculture', {
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
    'agriculture-id': {
      type: DataTypes.INTEGER,
      allowNull: false
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
    ag00: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ag0l: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ag02a: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ag02b: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ag02c: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ag02d: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ag02e1: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ag02e2: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'tagriculture',
    timestamps: false
  });




  module.exports = TAgriculture;