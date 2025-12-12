const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('habitat', {
    'habitat-id': {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    'level-1-id': {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    h01: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h01a: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    h02: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h03: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h03a: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    h04: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h04a: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    h05: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h05a: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    h06a: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h06b: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h07: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h07a: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    h07m: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h08: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h08a: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    h09: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h09a: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    h10: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h10a: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    h11: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h11a: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    h12: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h12a: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    h13: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h13a: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    h141: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h14110: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h142: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h143: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h14on: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h14re: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h144: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h145a: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h145: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h144a: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h146: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h147: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h1481: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h148: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h149: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h1410: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h1411: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h1412: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h1413: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h1414: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h1415: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h1416: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h14161: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h1417: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h1418: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h1419: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h1420: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h1421: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h1422: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h1423: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h1424: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h14m: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h14r: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h14w: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h14de: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h1425: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    h1426: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'habitat',
    timestamps: false
  });
};
