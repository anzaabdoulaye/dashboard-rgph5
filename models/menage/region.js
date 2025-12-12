const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('region', {
    code: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    libelle: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'region',
    timestamps: false
  });
};
