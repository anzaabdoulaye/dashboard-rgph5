const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sync_history', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    file_revision: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    device_id: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    device_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    user_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    universe: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    direction: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    server_revision: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    partial: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    last_id: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'sync_history',
    timestamps: false
  });
};
