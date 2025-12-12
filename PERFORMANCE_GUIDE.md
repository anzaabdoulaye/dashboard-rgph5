# ⚡ Guide de Performance - Dashboard BCR

## 🎯 Objectif
Optimiser l'application pour gérer **35 millions d'habitants** avec des temps de réponse < 3 secondes.

---

## 📊 Benchmarks

### Avant optimisation (2M habitants, 5 Go)
```
⏱️  Chargement page dashboard: 10-20 secondes
⏱️  Requête SQL moyenne: 5-10 secondes
⏱️  Taille des données transférées: ~500 KB (non compressé)
👥 Capacité: 5-10 utilisateurs simultanés
```

### Après optimisation (35M habitants projetés, 87.5 Go)
```
⏱️  Premier chargement: 1-3 secondes
⏱️  Chargements suivants (cache): 100-300 ms
⏱️  Requête SQL moyenne: 0.5-2 secondes
⏱️  Taille des données transférées: ~50-100 KB (compressé)
👥 Capacité: 100+ utilisateurs simultanés
```

---

## 🚀 Quick Start

### Installation rapide
```bash
# 1. Installer les optimisations
chmod +x scripts/install-optimizations.sh
./scripts/install-optimizations.sh

# 2. Démarrer l'application
npm start
```

### Vérification
```bash
# Tester Redis
redis-cli ping
# Devrait retourner: PONG

# Vérifier les index MySQL
mysql -u root -p menage -e "SHOW INDEX FROM tmenage;"

# Tester l'application
curl -I http://localhost:3000
# Devrait retourner: Content-Encoding: gzip
```

---

## 🔧 Configuration MySQL pour Production

### Fichier: `/etc/mysql/my.cnf` (Linux) ou `my.ini` (Windows)

```ini
[mysqld]
# ==========================================
# CONFIGURATION POUR 35 MILLIONS D'HABITANTS
# ==========================================

# Buffer Pool (80% de la RAM dédiée à MySQL)
# Si vous avez 16 GB de RAM, allouer 12-13 GB
innodb_buffer_pool_size = 12G
innodb_buffer_pool_instances = 12

# Logs
innodb_log_file_size = 1G
innodb_log_buffer_size = 32M
innodb_flush_log_at_trx_commit = 2

# I/O Performance
innodb_flush_method = O_DIRECT
innodb_io_capacity = 4000
innodb_io_capacity_max = 8000
innodb_read_io_threads = 8
innodb_write_io_threads = 8

# Connections
max_connections = 300
max_connect_errors = 10000
back_log = 500

# Temporary tables
tmp_table_size = 512M
max_heap_table_size = 512M

# Sort & Join buffers
sort_buffer_size = 8M
read_rnd_buffer_size = 8M
join_buffer_size = 8M

# Table cache
table_open_cache = 8000
table_definition_cache = 4000

# Thread cache
thread_cache_size = 200

# Query cache (désactivé sur MySQL 8+)
query_cache_type = 0
query_cache_size = 0

# Monitoring
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-query.log
long_query_time = 2

# Performance Schema
performance_schema = ON
performance_schema_instrument = '%=ON'
```

### Appliquer la configuration
```bash
# Redémarrer MySQL
sudo systemctl restart mysql

# Vérifier les paramètres
mysql -u root -p -e "SHOW VARIABLES LIKE 'innodb_buffer_pool_size';"
```

---

## 📈 Monitoring en Production

### 1. Monitoring Redis

```bash
# Console interactive Redis
redis-cli

# Infos mémoire
INFO memory

# Statistiques
INFO stats

# Nombre de clés
DBSIZE

# Voir toutes les clés (ATTENTION: lent sur grosse base)
KEYS stats_*

# Surveiller en temps réel
MONITOR
```

### 2. Monitoring MySQL

```sql
-- Connexions actives
SHOW FULL PROCESSLIST;

-- Requêtes lentes
SELECT * FROM mysql.slow_log ORDER BY query_time DESC LIMIT 10;

-- Utilisation du buffer pool
SHOW STATUS LIKE 'Innodb_buffer_pool%';

-- Hit rate du buffer pool (devrait être > 95%)
SELECT 
  (1 - (Innodb_buffer_pool_reads / Innodb_buffer_pool_read_requests)) * 100 
  AS buffer_pool_hit_rate
FROM 
  (SELECT 
    VARIABLE_VALUE AS Innodb_buffer_pool_reads 
   FROM performance_schema.global_status 
   WHERE VARIABLE_NAME = 'Innodb_buffer_pool_reads') AS reads,
  (SELECT 
    VARIABLE_VALUE AS Innodb_buffer_pool_read_requests 
   FROM performance_schema.global_status 
   WHERE VARIABLE_NAME = 'Innodb_buffer_pool_read_requests') AS requests;

-- Fragmentation des tables
SELECT 
    TABLE_NAME,
    ROUND(DATA_LENGTH / 1024 / 1024, 2) AS 'Data_MB',
    ROUND(INDEX_LENGTH / 1024 / 1024, 2) AS 'Index_MB',
    ROUND(DATA_FREE / 1024 / 1024, 2) AS 'Free_MB'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'menage'
ORDER BY DATA_FREE DESC;
```

### 3. Monitoring Node.js

```javascript
// Ajouter dans votre code
const os = require('os');

setInterval(() => {
  const used = process.memoryUsage();
  console.log({
    rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    cpuUsage: `${(os.loadavg()[0] * 100 / os.cpus().length).toFixed(2)}%`
  });
}, 60000); // Toutes les minutes
```

### 4. Outils de monitoring recommandés

- **PM2**: Monitoring et gestion des processus Node.js
- **New Relic**: APM complet
- **Grafana + Prometheus**: Dashboards personnalisés
- **MySQL Enterprise Monitor**: Monitoring MySQL avancé
- **Redis Commander**: Interface web pour Redis

---

## 🔍 Analyse de Performance

### Test de charge avec Apache Bench
```bash
# Installer Apache Bench
sudo apt-get install apache2-utils

# Test simple (100 requêtes, 10 simultanées)
ab -n 100 -c 10 http://localhost:3000/

# Test avec authentification
ab -n 100 -c 10 -C "session=xyz" http://localhost:3000/
```

### Test de charge avec Artillery
```bash
# Installer Artillery
npm install -g artillery

# Créer un fichier de test: load-test.yml
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - get:
          url: "/"
      - get:
          url: "/stats"
EOF

# Exécuter le test
artillery run load-test.yml
```

### Profiling Node.js
```bash
# Profiling CPU
node --prof app.js

# Générer le rapport
node --prof-process isolate-*.log > profile.txt

# Profiling mémoire
node --inspect app.js
# Ouvrir chrome://inspect dans Chrome
```

---

## 🚨 Troubleshooting

### Problème: Redis ne démarre pas
```bash
# Vérifier les logs
sudo tail -f /var/log/redis/redis-server.log

# Vérifier le port
sudo netstat -tulpn | grep 6379

# Redémarrer Redis
sudo systemctl restart redis

# Tester la connexion
redis-cli ping
```

### Problème: MySQL trop lent
```sql
-- Analyser une requête lente
EXPLAIN SELECT ... ;

-- Vérifier les index
SHOW INDEX FROM tmenage;

-- Forcer l'utilisation d'un index
SELECT /*+ INDEX(m idx_menage_geo_filters) */ * FROM tmenage m WHERE ...;

-- Optimiser une table
OPTIMIZE TABLE tmenage;

-- Analyser les statistiques
ANALYZE TABLE tmenage;
```

### Problème: Mémoire insuffisante
```bash
# Vérifier l'utilisation mémoire
free -h

# Augmenter le swap si nécessaire
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Réduire le buffer pool MySQL si nécessaire
# Éditer /etc/mysql/my.cnf
innodb_buffer_pool_size = 8G  # Au lieu de 12G
```

### Problème: Trop de connexions MySQL
```sql
-- Voir les connexions actives
SHOW FULL PROCESSLIST;

-- Tuer une connexion
KILL <process_id>;

-- Augmenter le max_connections
SET GLOBAL max_connections = 500;
```

---

## 📋 Checklist de Production

### Avant le déploiement
- [ ] Redis installé et configuré
- [ ] Index MySQL créés (vérifier avec `SHOW INDEX`)
- [ ] Configuration MySQL optimisée
- [ ] Variables d'environnement `.env` configurées
- [ ] Tests de charge effectués
- [ ] Monitoring configuré
- [ ] Backups automatiques configurés
- [ ] Plan de disaster recovery en place

### Surveillance quotidienne
- [ ] Vérifier l'utilisation mémoire Redis
- [ ] Vérifier les requêtes lentes MySQL
- [ ] Vérifier les logs d'erreur
- [ ] Vérifier l'espace disque
- [ ] Vérifier le hit rate du cache

### Maintenance hebdomadaire
- [ ] Analyser les statistiques MySQL (`ANALYZE TABLE`)
- [ ] Vérifier la fragmentation des tables
- [ ] Nettoyer les logs anciens
- [ ] Vérifier les backups

### Maintenance mensuelle
- [ ] Optimiser les tables (`OPTIMIZE TABLE`)
- [ ] Analyser les tendances de performance
- [ ] Mettre à jour les dépendances (si nécessaire)
- [ ] Réviser les alertes et seuils de monitoring

---

## 🎓 Ressources Utiles

### Documentation
- [Redis Documentation](https://redis.io/docs/)
- [MySQL Performance Tuning](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [Node.js Performance](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

### Outils
- [Redis Commander](https://github.com/joeferner/redis-commander) - Interface web pour Redis
- [MySQL Workbench](https://www.mysql.com/products/workbench/) - Administration MySQL
- [PM2](https://pm2.keymetrics.io/) - Process Manager pour Node.js
- [Artillery](https://www.artillery.io/) - Load testing

---

**Dernière mise à jour**: 2025-12-06  
**Version**: 1.0  
**Contact**: Équipe technique Dashboard BCR
