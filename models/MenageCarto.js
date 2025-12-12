const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MenageCarto = sequelize.define('menages_rec', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ca10t: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'menages_rec',
  timestamps: false, 
});

module.exports = MenageCarto;
