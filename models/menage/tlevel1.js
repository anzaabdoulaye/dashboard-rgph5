const { DataTypes } = require('sequelize');
const menageDB = require('../../config/menageDB');



const TLevel1 = menageDB.define('TLevel1', {
    'level-1-id': {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    code_region: {
      type: DataTypes.STRING(1),
      allowNull: true
    },
    region: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    code_departement: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    departement: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    code_commune: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    commune: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    mo_zs: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    mo_zd: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    mo_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'tlevel1',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "level-1-id" },
        ]
      },
      {
        name: "mo_zs",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "mo_zs" },
          { name: "mo_zd" },
          { name: "mo_id" },
        ]
      },
    ]
  });

module.exports = TLevel1;