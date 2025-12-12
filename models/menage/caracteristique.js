const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('caracteristique', {
    'caracteristique-id': {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    'level-1-id': {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    occ: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    c00: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c01n: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    c01p: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    c01: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    c02: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c03: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c04: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c05: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    c05_jj: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c05_mm: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c05_aaaa: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c06: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c07: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c07r: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c07d: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c07c: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c08a: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c08b: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c08c: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    c09: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c10: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c10a: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    c11p10: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c11r10: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c11d10: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c11c10: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c11m10: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c11m10a: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    c11p5: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c11r5: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c11d5: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c11c5: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c11m5: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c11m5a: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    c11p1: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c11r1: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c11d1: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c11c1: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c11m1: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c11m1a: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    c11me: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c11ae: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c12: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c13: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c14: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c15a: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c15b: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c15c: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c15d: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c15e: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c15f: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c15g: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c15h: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c16a: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c16b: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c16ba: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    c16c: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c16d: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c16e: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c16: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c16f: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c17: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    c17a: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    c18: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c18a: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c18b: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c19: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    c20: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    c21: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c21a: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    c22: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    c22a: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c23: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c23a: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c24_t: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c24_m: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c24_f: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c25_t: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c25_m: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c25_f: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c26_t: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c26_m: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c26_f: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c27_t: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c27_m: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c27_f: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c28: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    c29: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    membre_controle: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_deleted: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'caracteristique',
    timestamps: false
  });
};
