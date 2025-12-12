const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('departement', {
    code: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    libelle: {
      type: DataTypes.STRING(150),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'departement',
    timestamps: false
  });
};
