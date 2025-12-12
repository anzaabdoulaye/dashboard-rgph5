const path = require('path');
const initModels = require('./init-models');
const sequelize = require('../../config/menageDB'); // adapte selon ton projet

module.exports = initModels(sequelize);
