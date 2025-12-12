const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('notes', {
    case_id: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    field_name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    level_key: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    record_occurrence: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    item_occurrence: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subitem_occurrence: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    operator_id: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    modified_time: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'notes',
    timestamps: false
  });
};
