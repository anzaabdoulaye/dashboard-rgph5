#!/usr/bin/env node

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function deepCleanup() {
  console.log('🚀 Démarrage du nettoyage profond...');
  
  try {
    // 1. Vider Redis
    console.log('🗑️ Vidage Redis...');
    await execPromise('redis-cli FLUSHALL');
    
    // 2. Forcer le garbage collector
    console.log('🧹 Garbage collector...');
    if (global.gc) {
      global.gc();
    } else {
      console.log('⚠️ Démarrer avec --expose-gc pour le GC forcé');
    }
    
    // 3. Vider le cache système (Linux)
    console.log('💾 Cache système...');
    await execPromise('sync && echo 3 > /proc/sys/vm/drop_caches');
    
    // 4. Voir la mémoire actuelle
    const { stdout: memory } = await execPromise('free -h');
    console.log('📊 Mémoire système:', memory);
    
    // 5. Voir les processus Node
    const { stdout: processes } = await execPromise('ps aux | grep node');
    console.log('📋 Processus Node:', processes);
    
    console.log('✅ Nettoyage terminé!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter
deepCleanup();