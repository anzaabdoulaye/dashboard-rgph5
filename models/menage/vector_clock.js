const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('vector_clock', {
    case_id: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    device: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    revision: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'vector_clock',
    timestamps: false
  });
};
