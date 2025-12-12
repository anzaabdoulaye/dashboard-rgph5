#!/usr/bin/env node
/**
 * Script pour mettre à jour les tables pré-agrégées
 * Usage: node scripts/updateAggregatedStats.js
 * Peut être appelé depuis un CRON job pour mise à jour automatique
 */

require('dotenv').config();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const DB_HOST = process.env.MENAGE_DB_HOST || 'localhost';
const DB_PORT = process.env.MENAGE_DB_PORT || '3306';
const DB_NAME = process.env.MENAGE_DB_NAME || 'menage';
const DB_USER = process.env.MENAGE_DB_USER || 'root';
const DB_PASSWORD = process.env.MENAGE_DB_PASSWORD || '';

const SQL_FILE = path.join(__dirname, '..', 'migrations', '03_populate_aggregated_tables.sql');

console.log('🔄 Mise à jour des statistiques pré-agrégées');
console.log('============================================');
console.log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`);
console.log(`📊 Base: ${DB_NAME}`);
console.log(`🖥️  Hôte: ${DB_HOST}:${DB_PORT}`);
console.log('');

// Vérifier que le fichier SQL existe
if (!fs.existsSync(SQL_FILE)) {
    console.error('❌ Fichier SQL introuvable:', SQL_FILE);
    process.exit(1);
}

// Construire la commande MySQL
let mysqlCmd;
if (DB_PASSWORD) {
    mysqlCmd = `mysql -h${DB_HOST} -P${DB_PORT} -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < "${SQL_FILE}"`;
} else {
    mysqlCmd = `mysql -h${DB_HOST} -P${DB_PORT} -u${DB_USER} ${DB_NAME} < "${SQL_FILE}"`;
}

console.log('⏳ Exécution en cours...');
console.log('');

const startTime = Date.now();

exec(mysqlCmd, (error, stdout, stderr) => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (error) {
        console.error('❌ Erreur lors de la mise à jour:', error.message);
        console.error(stderr);
        process.exit(1);
    }
    
    console.log('✅ Mise à jour terminée avec succès!');
    console.log(`⏱️  Durée: ${duration} secondes`);
    console.log('');
    
    if (stdout) {
        console.log('📋 Détails:');
        console.log(stdout);
    }
    
    console.log('============================================');
    console.log('🎉 Les statistiques sont à jour!');
    console.log('');
    
    process.exit(0);
});
