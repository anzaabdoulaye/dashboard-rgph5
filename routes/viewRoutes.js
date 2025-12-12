
const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');


    router.get('/my-view-data', async (req, res) => {
        try {
            const [rows] = await sequelize.query('SELECT * FROM popCarTotal');
            res.json(rows);
        } catch (error) {
            console.error('Error fetching view data:', error);
            res.status(500).json({ error: 'Failed to retrieve view data' });
        }
    });

    router.get('/my-view-data-nb-menage', async (req, res) => {
        try {
            const [rows] = await sequelize.query('SELECT COUNT(*) FROM level1');
            res.json(rows);
        } catch (error) {
            console.error('Error fetching view data:', error);
            res.status(500).json({ error: 'Failed to retrieve view data' });
        }
    });

    module.exports = router;