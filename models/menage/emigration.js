const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('emigration', {
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
    sequelize,
    tableName: 'emigration',
    timestamps: false
  });
};
