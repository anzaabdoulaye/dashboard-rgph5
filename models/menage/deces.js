const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('deces', {
    'deces-id': {
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
    sequelize,
    tableName: 'deces',
    timestamps: false
  });
};
