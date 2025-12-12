const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('meta', {
    schema_version: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cspro_version: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    dictionary: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    dictionary_structure: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    dictionary_timestamp: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'meta',
    timestamps: false
  });
};
