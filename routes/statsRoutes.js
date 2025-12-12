var express = require('express');
var router = express.Router();
const { Sequelize } = require('sequelize');
const MenageCarto = require('../models/MenageCarto');

/* GET home page */
router.get('/', async function(req, res, next) {
  try {
    //  Comme `ca10t` est un champ texte, on le convertit en nombre avant la somme
    const result = await MenageCarto.findOne({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.cast(Sequelize.col('level-1-id'), 'UNSIGNED')), 'nbMenages']
      ],
      raw: true
    });

    const totalPopulation = result.totalPopulation || 0;

    res.render('pages/statsViews', { 
      title: 'Concrétisation',
      nbMenages: result.nbMenages || 0
    });
  } catch (error) {
    console.error('Erreur de récupération :', error);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;
