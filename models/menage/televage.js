const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('televage', {
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
    'elevage-id': {
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
    e001: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    e002: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    e003: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    e004: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    e005: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'televage',
    timestamps: false
  });
};
