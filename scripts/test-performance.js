#!/usr/bin/env node

/**
 * Script de test de performance pour Dashboard BCR
 * Teste les temps de réponse des différents endpoints
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const NUM_REQUESTS = parseInt(process.env.NUM_REQUESTS) || 10;

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m'
};

// Endpoints à tester
const endpoints = [
  { name: 'Métriques système', path: '/api/metrics?token=test' },
  { name: 'Stats principales (API)', path: '/stats' },
];

console.log(`${colors.blue}========================================${colors.reset}`);
console.log(`${colors.blue}🚀 Test de Performance - Dashboard BCR${colors.reset}`);
console.log(`${colors.blue}========================================${colors.reset}`);
console.log(`URL: ${BASE_URL}`);
console.log(`Nombre de requêtes par endpoint: ${NUM_REQUESTS}`);
console.log('');

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        const size = Buffer.byteLength(data, 'utf8');
        
        resolve({
          statusCode: res.statusCode,
          duration,
          size,
          headers: res.headers
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function getColorByDuration(duration) {
  if (duration < 500) return colors.green;
  if (duration < 1000) return colors.yellow;
  return colors.red;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function calculateStats(durations) {
  const sorted = durations.sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / sorted.length,
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)]
  };
}

async function testEndpoint(endpoint) {
  console.log(`\n📊 Test: ${endpoint.name}`);
  console.log(`   URL: ${endpoint.path}`);
  console.log(`   Requêtes: ${NUM_REQUESTS}`);
  console.log('');
  
  const durations = [];
  const sizes = [];
  let errors = 0;
  
  for (let i = 0; i < NUM_REQUESTS; i++) {
    try {
      const result = await makeRequest(`${BASE_URL}${endpoint.path}`);
      durations.push(result.duration);
      sizes.push(result.size);
      
      const color = getColorByDuration(result.duration);
      const compression = result.headers['content-encoding'] || 'none';
      
      process.stdout.write(
        `   ${i + 1}/${NUM_REQUESTS} ${color}${result.duration}ms${colors.reset} ` +
        `(${formatBytes(result.size)}, ${compression})\n`
      );
      
      if (result.statusCode !== 200) {
        console.log(`   ⚠️  Status: ${result.statusCode}`);
      }
    } catch (error) {
      errors++;
      console.log(`   ${colors.red}❌ Erreur: ${error.message}${colors.reset}`);
    }
    
    // Petit délai entre les requêtes pour ne pas surcharger
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  if (durations.length > 0) {
    const stats = calculateStats(durations);
    const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
    
    console.log('\n   📈 Statistiques:');
    console.log(`      Temps min:     ${getColorByDuration(stats.min)}${stats.min.toFixed(0)}ms${colors.reset}`);
    console.log(`      Temps max:     ${getColorByDuration(stats.max)}${stats.max.toFixed(0)}ms${colors.reset}`);
    console.log(`      Temps moyen:   ${getColorByDuration(stats.avg)}${stats.avg.toFixed(0)}ms${colors.reset}`);
    console.log(`      Médiane:       ${getColorByDuration(stats.median)}${stats.median.toFixed(0)}ms${colors.reset}`);
    console.log(`      P95:           ${getColorByDuration(stats.p95)}${stats.p95.toFixed(0)}ms${colors.reset}`);
    console.log(`      P99:           ${getColorByDuration(stats.p99)}${stats.p99.toFixed(0)}ms${colors.reset}`);
    console.log(`      Taille moy:    ${formatBytes(avgSize)}`);
    console.log(`      Erreurs:       ${errors}/${NUM_REQUESTS}`);
    console.log(`      Taux succès:   ${((1 - errors / NUM_REQUESTS) * 100).toFixed(2)}%`);
    
    // Évaluation
    console.log('\n   🎯 Évaluation:');
    if (stats.avg < 500) {
      console.log(`      ${colors.green}✅ Excellent${colors.reset} - Temps de réponse très rapide`);
    } else if (stats.avg < 1000) {
      console.log(`      ${colors.yellow}⚠️  Bon${colors.reset} - Temps de réponse acceptable`);
    } else if (stats.avg < 3000) {
      console.log(`      ${colors.red}🔴 Moyen${colors.reset} - Optimisation recommandée`);
    } else {
      console.log(`      ${colors.red}❌ Lent${colors.reset} - Optimisation urgente nécessaire`);
    }
  }
  
  return durations.length > 0 ? calculateStats(durations) : null;
}

async function runTests() {
  const results = [];
  
  for (const endpoint of endpoints) {
    const stats = await testEndpoint(endpoint);
    if (stats) {
      results.push({
        name: endpoint.name,
        ...stats
      });
    }
  }
  
  console.log(`\n${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.blue}📊 Résumé Global${colors.reset}`);
  console.log(`${colors.blue}========================================${colors.reset}\n`);
  
  results.forEach(result => {
    const color = getColorByDuration(result.avg);
    console.log(`${result.name}:`);
    console.log(`   Temps moyen: ${color}${result.avg.toFixed(0)}ms${colors.reset}`);
    console.log(`   P95: ${getColorByDuration(result.p95)}${result.p95.toFixed(0)}ms${colors.reset}`);
    console.log('');
  });
  
  console.log(`${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.green}✅ Tests terminés${colors.reset}`);
  console.log(`${colors.blue}========================================${colors.reset}\n`);
}

// Vérifier que le serveur est accessible
console.log('🔍 Vérification de la connexion au serveur...\n');

makeRequest(`${BASE_URL}/api/metrics?token=test`)
  .then(() => {
    console.log(`${colors.green}✅ Serveur accessible${colors.reset}\n`);
    return runTests();
  })
  .catch((error) => {
    console.error(`${colors.red}❌ Impossible de se connecter au serveur${colors.reset}`);
    console.error(`   Erreur: ${error.message}`);
    console.error(`\n   Assurez-vous que le serveur est démarré sur ${BASE_URL}`);
    process.exit(1);
  });
