#!/usr/bin/env node

/**
 * Helper pour la création des index MySQL
 * Multi-plateforme (Windows, Linux, macOS)
 */

const os = require('os');
const path = require('path');

console.log('\n=================================================');
console.log('   Création des Index MySQL - Dashboard BCR');
console.log('=================================================\n');

const platform = os.platform();
const sqlFile = path.join(__dirname, '..', 'migrations', '01_create_indexes.sql');

console.log(`Système détecté: ${platform}`);
console.log(`Fichier SQL: ${sqlFile}\n`);

console.log('📋 Instructions pour créer les index:\n');

if (platform === 'win32') {
  // Windows
  console.log('=== WINDOWS ===\n');
  console.log('Option 1 - Via MySQL Workbench (Recommandé):');
  console.log('  1. Ouvrir MySQL Workbench');
  console.log('  2. Se connecter à votre serveur MySQL');
  console.log('  3. Ouvrir un nouvel onglet SQL');
  console.log('  4. Fichier → Open SQL Script');
  console.log(`  5. Sélectionner: ${sqlFile}`);
  console.log('  6. Cliquer sur l\'icône éclair (Execute)');
  console.log('  7. Attendre 30-60 minutes\n');
  
  console.log('Option 2 - Via ligne de commande:');
  console.log('  Ouvrir CMD ou PowerShell et exécuter:\n');
  console.log(`  mysql -u root -p menage < "${sqlFile}"`);
  console.log('\n  ⚠️  Remplacer "root" par votre utilisateur MySQL');
  console.log('  ⚠️  Remplacer "menage" par le nom de votre base de données\n');
} else {
  // Linux / macOS
  console.log('=== LINUX / macOS ===\n');
  console.log('Via ligne de commande:\n');
  console.log(`  mysql -u root -p menage < "${sqlFile}"`);
  console.log('\n  ⚠️  Remplacer "root" par votre utilisateur MySQL');
  console.log('  ⚠️  Remplacer "menage" par le nom de votre base de données\n');
}

console.log('⏱️  Temps estimé: 30-60 minutes');
console.log('💡 Cette opération est CRITIQUE pour les performances\n');

console.log('=================================================');
console.log('Pour plus d\'informations:');
console.log('  - OPTIMIZATIONS.md (guide technique)');
if (platform === 'win32') {
  console.log('  - INSTALLATION_WINDOWS.md (guide Windows)');
}
console.log('=================================================\n');
