const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('case-binary-data', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    'case-id': {
      type: DataTypes.TEXT,
      allowNull: true
    },
    'binary-data-signature': {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'case-binary-data',
    timestamps: false
  });
};
