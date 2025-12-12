const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tranche_age', {
    code: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    libelle: {
      type: DataTypes.STRING(7),
      allowNull: false
    },
    min_value: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    max_value: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'tranche_age',
    timestamps: false
  });
};
