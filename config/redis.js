// config/redis.js
const Redis = require('ioredis');
require('dotenv').config();

// Configuration Redis avec retry strategy
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 10000,
});

redis.on('connect', () => {
  console.log('✅ Redis connecté avec succès');
});

redis.on('error', (err) => {
  console.error('❌ Erreur Redis:', err.message);
});

redis.on('ready', () => {
  console.log('✅ Redis prêt à recevoir des commandes');
});

redis.on('close', () => {
  console.warn('⚠️  Connexion Redis fermée');
});

// Helper pour gérer le cache
const cacheHelper = {
  /**
   * Récupère une donnée du cache ou l'exécute et la met en cache
   * @param {string} key - Clé du cache
   * @param {Function} fetchFn - Fonction async à exécuter si cache manquant
   * @param {number} ttl - Durée de vie en secondes (par défaut 5 minutes)
   */
  async getOrSet(key, fetchFn, ttl = 300) {
    try {
      // Vérifier si la donnée existe dans le cache
      const cached = await redis.get(key);
      
      if (cached) {
        console.log(`📦 Cache HIT pour: ${key}`);
        return JSON.parse(cached);
      }
      
      console.log(`🔍 Cache MISS pour: ${key} - Exécution de la requête...`);
      
      // Exécuter la fonction et mettre en cache
      const data = await fetchFn();
      await redis.setex(key, ttl, JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error(`❌ Erreur cache pour ${key}:`, error.message);
      // En cas d'erreur Redis, exécuter directement la fonction
      return await fetchFn();
    }
  },

  /**
   * Invalide le cache pour une clé spécifique
   */
  async invalidate(key) {
    try {
      await redis.del(key);
      console.log(`🗑️  Cache invalidé pour: ${key}`);
    } catch (error) {
      console.error(`❌ Erreur invalidation cache ${key}:`, error.message);
    }
  },

  /**
   * Invalide tous les caches correspondant à un pattern
   */
  async invalidatePattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`🗑️  ${keys.length} clés invalidées avec le pattern: ${pattern}`);
      }
    } catch (error) {
      console.error(`❌ Erreur invalidation pattern ${pattern}:`, error.message);
    }
  },

  /**
   * Vider tout le cache (à utiliser avec précaution)
   */
  async flushAll() {
    try {
      await redis.flushdb();
      console.log('🗑️  Tout le cache a été vidé');
    } catch (error) {
      console.error('❌ Erreur flush cache:', error.message);
    }
  }
};

module.exports = { redis, cacheHelper };
