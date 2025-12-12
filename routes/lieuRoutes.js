const express = require('express');
const router = express.Router();
const Region = require('../models/Region');
const Departement = require('../models/Departement');
const Commune = require('../models/Commune');

// ===== ROUTES POUR L'AJOUT D'UTILISATEUR =====

// Récupérer toutes les régions
router.get('/loc/regions', async (req, res) => {
  try {
    const regions = await Region.findAll({
      attributes: ['id', 'code', 'sigle', 'libelle'],
      order: [['libelle', 'ASC']]
    });
    res.json(regions);
  } catch (error) {
    console.error('Erreur chargement régions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les départements d'une région
router.get('/loc/departements/:regionId', async (req, res) => {
  try {
    const departements = await Departement.findAll({
      where: { region_id: req.params.regionId },
      attributes: ['id', 'code', 'libelle'],
      order: [['libelle', 'ASC']]
    });
    res.json(departements);
  } catch (error) {
    console.error('Erreur chargement départements:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les communes d'un département
router.get('/loc/communes/:departementId', async (req, res) => {
  try {
    const communes = await Commune.findAll({
      where: { departement_id: req.params.departementId },
      attributes: ['id', 'code', 'libelle'],
      order: [['libelle', 'ASC']]
    });
    res.json(communes);
  } catch (error) {
    console.error('Erreur chargement communes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== ROUTES POUR L'ÉDITION D'UTILISATEUR (même logique) =====

router.get('/regions', async (req, res) => {
  try {
    const regions = await Region.findAll({
      attributes: ['id', 'code', 'sigle', 'libelle'],
      order: [['libelle', 'ASC']]
    });
    res.json(regions);
  } catch (error) {
    console.error('Erreur chargement régions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/departements/:regionId', async (req, res) => {
  try {
    const departements = await Departement.findAll({
      where: { region_id: req.params.regionId },
      attributes: ['id', 'code', 'libelle'],
      order: [['libelle', 'ASC']]
    });
    res.json(departements);
  } catch (error) {
    console.error('Erreur chargement départements:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/communes/:departementId', async (req, res) => {
  try {
    const communes = await Commune.findAll({
      where: { departement_id: req.params.departementId },
      attributes: ['id', 'code', 'libelle'],
      order: [['libelle', 'ASC']]
    });
    res.json(communes);
  } catch (error) {
    console.error('Erreur chargement communes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;