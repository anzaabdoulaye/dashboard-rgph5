const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('level-1', {
    'level-1-id': {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    'case-id': {
      type: DataTypes.TEXT,
      allowNull: false
    },
    mo_zs: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    mo_zc: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    mo_zd: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    mo_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_zs: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    men_zc: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    men_zd: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    men_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'level-1',
    timestamps: false
  });
};
