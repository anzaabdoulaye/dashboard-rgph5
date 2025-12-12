const { Sequelize } = require('sequelize');
const MenageCarto = require('../models/MenageCarto');

exports.getTotalPopulation = async () => {
  try {
    const result = await MenageCarto.findOne({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.cast(Sequelize.col('ca10t'), 'UNSIGNED')), 'totalPopulation']
      ],
      raw: true
    });

    return result.totalPopulation || 0;
  } catch (error) {
    console.error('Erreur dans menageCartoService:', error);
    throw error;
  }
};
