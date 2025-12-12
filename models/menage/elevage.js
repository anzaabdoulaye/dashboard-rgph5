const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('elevage', {
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
    tableName: 'elevage',
    timestamps: false
  });
};
