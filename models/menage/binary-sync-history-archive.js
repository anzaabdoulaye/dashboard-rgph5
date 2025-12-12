const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('binary-sync-history-archive', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    'binary-sync-history-id': {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'binary-data-signature': {
      type: DataTypes.TEXT,
      allowNull: true
    },
    'sync-history-id': {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'binary-sync-history-archive',
    timestamps: false
  });
};
