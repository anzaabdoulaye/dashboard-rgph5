const { Sequelize } = require('sequelize');
require('dotenv').config();

const menageDB = new Sequelize(
  process.env.MENAGE_DB_NAME,
  process.env.MENAGE_DB_USER,
  process.env.MENAGE_DB_PASSWORD,
  {
    host: process.env.MENAGE_DB_HOST,
    dialect: 'mysql',
    port: process.env.MENAGE_DB_PORT || 3306,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    // Pool de connexions optimisé pour haute charge
    pool: {
      max: 20,          // Maximum de connexions simultanées
      min: 5,           // Minimum de connexions à maintenir
      acquire: 60000,   // Temps max d'attente pour obtenir une connexion (60s)
      idle: 10000,      // Temps avant de fermer une connexion inactive (10s)
      evict: 5000,      // Intervalle de vérification des connexions inactives (5s)
    },
    
    // Optimisations de requêtes
    define: {
      freezeTableName: true,  // Ne pas pluraliser les noms de tables
      timestamps: false,      // Pas de createdAt/updatedAt automatiques
      underscored: false,
    },
    
    // Configuration dialecte MySQL
    dialectOptions: {
      connectTimeout: 60000,  // Timeout de connexion (60s)
      decimalNumbers: true,   // Parser les DECIMAL en nombres
      supportBigNumbers: true,
      bigNumberStrings: false,
      dateStrings: false,
      
      // Optimisations spécifiques MySQL
      flags: [
        'FOUND_ROWS',         // Pour pagination optimisée
      ],
      
      // Compression des données (si MySQL le supporte)
      compress: true,
    },
    
    // Retry automatique en cas d'échec
    retry: {
      max: 3,
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /EPIPE/,
      ],
    },
    
    // Benchmark des requêtes (désactivé en production)
    benchmark: process.env.NODE_ENV === 'development',
    
    // Hooks pour monitoring
    hooks: {
      beforeConnect: (config) => {
        console.log('🔌 Tentative de connexion à la base de données menage...');
      },
      afterConnect: (connection, config) => {
        console.log('✅ Connexion établie à la base de données menage');
      },
    },
  }
);

// Test de connexion au démarrage
menageDB.authenticate()
  .then(() => {
    console.log('✅ Base de données menage: Connexion établie avec succès');
  })
  .catch(err => {
    console.error('❌ Impossible de se connecter à la base menage:', err);
  });

module.exports = menageDB;
