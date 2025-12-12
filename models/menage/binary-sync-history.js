const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('binary-sync-history', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
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
    tableName: 'binary-sync-history',
    timestamps: false
  });
};
