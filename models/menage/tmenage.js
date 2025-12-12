const { DataTypes } = require('sequelize');
const menageDB = require('../../config/menageDB');
const TLevel1 = require('./tlevel1');


const TMenage = menageDB.define('TMenage', {
  
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
    },
    'menage-id': {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    'level_1_id': {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'level-1-id'
    },
    id01: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id02: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id03: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id04: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id05: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id06: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id07: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm01: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm02: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm02g: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm03: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm04: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm05: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm05i: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm06: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm07: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm07c: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm08l: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    xm08: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm09: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm10: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm12: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm12lo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm12la: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm12al: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm12pr: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm13: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm13a: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm14: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm14_jj: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm14_mm: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm14_aaaa: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm15: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm15h: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm15l: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm16: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm16_jj: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm16_mm: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm16_aaaa: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm17: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm17h: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm17l: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm50: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm20: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm30: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm40: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm60: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xm41: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    d00: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    d01: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ag01: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ag01b: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    em00: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    em01: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    intro_membre: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nb_residents: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nb_resident_presents: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nb_rp_h: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'tmenage',
    timestamps: false
  });

  TMenage.belongsTo(TLevel1, {
  foreignKey: 'level_1_id',
  as: 'level1'
});

  module.exports = TMenage;