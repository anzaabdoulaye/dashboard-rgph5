const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cases', {
    id: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true
    },
    key: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    label: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    questionnaire: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    last_modified_revision: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    deleted: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    file_order: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    verified: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    partial_save_mode: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    partial_save_field_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    partial_save_level_key: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    partial_save_record_occurrence: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    partial_save_item_occurrence: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    partial_save_subitem_occurrence: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'cases',
    timestamps: false
  });
};
