// middleware/performanceMonitor.js
// Middleware pour monitorer les performances des requêtes

const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  // Intercepter la fin de la réponse
  const originalEnd = res.end;
  const originalJson = res.json;

  res.end = function(...args) {
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage();
    
    logPerformance(req, res, duration, startMemory, endMemory);
    
    originalEnd.apply(res, args);
  };

  res.json = function(...args) {
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage();
    
    logPerformance(req, res, duration, startMemory, endMemory);
    
    originalJson.apply(res, args);
  };

  next();
};

function logPerformance(req, res, duration, startMemory, endMemory) {
  const memoryDiff = {
    rss: ((endMemory.rss - startMemory.rss) / 1024 / 1024).toFixed(2),
    heapUsed: ((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024).toFixed(2)
  };

  // Définir le niveau de log selon la durée
  let logLevel = '✅';
  if (duration > 3000) {
    logLevel = '🔴'; // Très lent
  } else if (duration > 1000) {
    logLevel = '🟠'; // Lent
  } else if (duration > 500) {
    logLevel = '🟡'; // Moyen
  }

  const logData = {
    level: logLevel,
    method: req.method,
    url: req.originalUrl || req.url,
    status: res.statusCode,
    duration: `${duration}ms`,
    memory: {
      rss: `${memoryDiff.rss}MB`,
      heap: `${memoryDiff.heapUsed}MB`
    },
    userAgent: req.get('user-agent') ? req.get('user-agent').substring(0, 50) : 'N/A'
  };

  // Afficher seulement si la requête est lente ou en mode développement
  if (duration > 1000 || process.env.NODE_ENV === 'development') {
    console.log(
      `${logLevel} [${logData.method}] ${logData.url} - ${logData.status} - ${logData.duration}`
    );
    
    if (duration > 3000) {
      console.warn(`   ⚠️  REQUÊTE TRÈS LENTE: ${logData.url} (${logData.duration})`);
    }
  }

  // Si activé, enregistrer dans un fichier de log
  if (process.env.PERFORMANCE_LOG === 'true') {
    const fs = require('fs');
    const path = require('path');
    const logDir = path.join(__dirname, '..', 'logs');
    const logFile = path.join(logDir, `performance-${new Date().toISOString().split('T')[0]}.log`);

    // Créer le dossier logs s'il n'existe pas
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Écrire dans le fichier
    const logLine = `${new Date().toISOString()} | ${JSON.stringify(logData)}\n`;
    fs.appendFileSync(logFile, logLine);
  }
}

// Middleware pour exposer les métriques de performance
const performanceMetrics = (req, res) => {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();

  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptime),
      formatted: formatUptime(uptime)
    },
    memory: {
      rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      external: `${(memUsage.external / 1024 / 1024).toFixed(2)} MB`,
      heapUsagePercent: `${((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2)}%`
    },
    cpu: {
      loadAverage: require('os').loadavg(),
      cpuCount: require('os').cpus().length
    },
    node: {
      version: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };

  res.json(metrics);
};

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

module.exports = {
  performanceMonitor,
  performanceMetrics
};
