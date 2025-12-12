const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('binary-data', {
    signature: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    data: {
      type: DataTypes.BLOB,
      allowNull: true
    },
    last_modified_revision: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'binary-data',
    timestamps: false
  });
};
