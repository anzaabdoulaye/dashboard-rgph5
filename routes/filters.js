// récupérer les filtres: régions, départements, communes, ZD par leur nom

const express = require('express');
const router = express.Router();
const TLevel1 = require('../models/menage/tlevel1');

// Récupérer toutes les régions (distinctes)
router.get('/regions', async (req, res) => {
  try {
    const regions = await TLevel1.findAll({
      attributes: ['region'],
      group: ['region'],
      order: [['region', 'ASC']]
    });
    res.json(regions.map(r => r.region));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur chargement régions' });
  }
});

// Récupérer les départements d’une région
router.get('/departements/:region', async (req, res) => {
  try {
    const { region } = req.params;
    const deps = await TLevel1.findAll({
      attributes: ['departement'],
      where: { region },
      group: ['departement'],
      order: [['departement', 'ASC']]
    });
    res.json(deps.map(d => d.departement));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur chargement départements' });
  }
});

// Récupérer les communes d’un département
router.get('/communes/:departement', async (req, res) => {
  try {
    const { departement } = req.params;
    const communes = await TLevel1.findAll({
      attributes: ['commune'],
      where: { departement },
      group: ['commune'],
      order: [['commune', 'ASC']]
    });
    res.json(communes.map(c => c.commune));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur chargement communes' });
  }
});

// Récupérer les ZD d’une commune
router.get('/zd/:commune', async (req, res) => {
  try {
    const { commune } = req.params;
    const zds = await TLevel1.findAll({
      attributes: ['mo_zd'],
      where: { commune },
      group: ['mo_zd'],
      order: [['mo_zd', 'ASC']]
    });
    res.json(zds.map(z => z.mo_zd));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur chargement ZD' });
  }
});

module.exports = router;
