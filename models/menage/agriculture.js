const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('agriculture', {
    'agriculture-id': {
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
    sequelize,
    tableName: 'agriculture',
    timestamps: false
  });
};
