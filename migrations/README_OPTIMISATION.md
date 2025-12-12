# 🚀 Guide d'Optimisation de la Base de Données

Ce guide explique comment optimiser votre application de tableau de bord pour gérer efficacement 35 millions d'habitants.

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Installation rapide](#installation-rapide)
3. [Optimisations appliquées](#optimisations-appliquées)
4. [Utilisation](#utilisation)
5. [Maintenance](#maintenance)
6. [Résolution de problèmes](#résolution-de-problèmes)

## 🎯 Vue d'ensemble

### Problème Initial
- Base de données: 5 GB pour 2 millions d'habitants
- Temps de chargement: 50-105 secondes pour certaines requêtes
- Projection: ~87.5 GB pour 35 millions d'habitants

### Solution Implémentée
- **Index MySQL optimisés** pour accélérer les jointures
- **Tables pré-agrégées** (materialized views) pour des statistiques instantanées
- **Cache Redis** pour éviter les requêtes répétitives
- **Service ultra-rapide** utilisant les tables pré-calculées

### Résultats Attendus
- ⚡ Temps de réponse: **< 100ms** (au lieu de 50-105 secondes)
- 📊 Requêtes complexes: **< 500ms** (au lieu de 13-33 secondes)
- 💾 Utilisation du cache: **80-90%** de hits après warm-up
- 🚀 Amélioration globale: **500-1000x plus rapide**

## 🔧 Installation Rapide

### Option 1: Script Automatique (Recommandé)

```bash
# 1. Rendez le script exécutable
chmod +x migrations/optimize_database.sh

# 2. Exécutez le script complet d'optimisation
./migrations/optimize_database.sh
```

Ce script va automatiquement:
1. Créer tous les index nécessaires
2. Créer les tables pré-agrégées
3. Peupler ces tables avec les statistiques

⚠️ **ATTENTION**: L'étape 3 peut prendre **15-30 minutes** sur une grosse base!

### Option 2: Étape par Étape

```bash
# Étape 1: Créer les index (2-5 minutes)
./migrations/apply_indexes.sh

# Étape 2: Créer les tables pré-agrégées (< 1 minute)
mysql -u root -p menage < migrations/02_create_aggregated_tables.sql

# Étape 3: Peupler les tables (15-30 minutes)
mysql -u root -p menage < migrations/03_populate_aggregated_tables.sql
```

## 📊 Optimisations Appliquées

### 1. Index MySQL (`01_create_indexes.sql`)

**Tables indexées:**
- `tmenage`: index géographiques, statistiques
- `tcaracteristique`: index sur sexe, âge, niveau
- `tagriculture`: index de jointure
- `temigration`: index de jointure

**Impact:**
- Jointures: 10-50x plus rapides
- Filtres géographiques: 5-20x plus rapides

### 2. Tables Pré-agrégées (`02_create_aggregated_tables.sql`)

**Tables créées:**
- `stats_nationales`: statistiques globales
- `stats_par_region`: stats par région
- `stats_par_departement`: stats par département
- `stats_par_commune`: stats par commune
- `pyramide_ages_*`: pyramides des âges pré-calculées

**Avantages:**
- Pas de calcul à la volée
- Requêtes SELECT simples
- Temps de réponse: < 50ms

### 3. Peuplement Automatique (`03_populate_aggregated_tables.sql`)

**Calculs effectués:**
- Statistiques ménages (total, taille, type)
- Statistiques population (hommes, femmes, âges)
- Statistiques agricoles
- Statistiques émigration
- Pyramides des âges par niveau géographique

### 4. Service Ultra-Rapide (`menageServiceUltraFast.js`)

**Fonctionnalités:**
- Utilise les tables pré-agrégées
- Cache Redis intégré (TTL: 10-30 minutes)
- Détection automatique du niveau géographique
- Fallback en cas de données manquantes

## 🚀 Utilisation

### 1. Mettre à Jour le Contrôleur

Remplacez l'ancien service par le nouveau:

```javascript
// ANCIEN (lent)
// const menageService = require('../services/menageService');

// NOUVEAU (ultra-rapide)
const menageService = require('../services/menageServiceUltraFast');

// L'API reste identique, aucun autre changement nécessaire!
```

### 2. Redémarrer le Serveur

```bash
npm restart
# ou
pm2 restart app
```

### 3. Warm-up du Cache (Optionnel mais Recommandé)

```bash
# Préchauffer le cache au démarrage
node scripts/warmupCache.js
```

Vous pouvez l'intégrer dans votre script de démarrage:

```json
// package.json
{
  "scripts": {
    "start": "node scripts/warmupCache.js && node app.js",
    "dev": "node scripts/warmupCache.js && nodemon app.js"
  }
}
```

## 🔄 Maintenance

### Mise à Jour des Statistiques

Les tables pré-agrégées doivent être mises à jour régulièrement:

#### Option 1: Script Node.js

```bash
node scripts/updateAggregatedStats.js
```

#### Option 2: Script Shell

```bash
mysql -u root -p menage < migrations/03_populate_aggregated_tables.sql
```

#### Option 3: CRON Job (Recommandé en Production)

```bash
# Ouvrir le crontab
crontab -e

# Ajouter une ligne pour mise à jour toutes les 6 heures
0 */6 * * * cd /path/to/app && node scripts/updateAggregatedStats.js >> /var/log/stats-update.log 2>&1

# Ou toutes les nuits à 2h00
0 2 * * * cd /path/to/app && node scripts/updateAggregatedStats.js >> /var/log/stats-update.log 2>&1
```

### Invalidation du Cache Redis

Si vous avez mis à jour les statistiques:

```bash
# Vider tout le cache
redis-cli FLUSHDB

# Ou via Node.js
node -e "require('./config/redis').cacheHelper.flushAll()"

# Puis réchauffer le cache
node scripts/warmupCache.js
```

## 🔍 Monitoring des Performances

### 1. Temps de Réponse des Requêtes

Les logs affichent automatiquement les temps d'exécution:

```
⚡ getMainStats (ULTRA-FAST) exécutée en 15ms
⚡ getPopulationStatsCombined (ULTRA-FAST) exécutée en 12ms
```

### 2. Taux de Hit du Cache

Surveillez les logs Redis:

```
📦 Cache HIT pour: stats_main_ultra:u35_ROLE_REGIONAL:all
🔍 Cache MISS pour: stats_population_ultra:u35_ROLE_REGIONAL:region:3
```

**Taux de hit souhaité:** > 80%

### 3. Taille des Tables

```sql
SELECT 
    TABLE_NAME,
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Size_MB',
    TABLE_ROWS
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'menage'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
```

## ⚠️ Résolution de Problèmes

### Problème: "Aucune donnée trouvée dans les tables pré-agrégées"

**Solution:**
```bash
# Vérifier que les tables existent
mysql -u root -p menage -e "SHOW TABLES LIKE 'stats_%';"

# Si elles existent mais sont vides, les peupler
mysql -u root -p menage < migrations/03_populate_aggregated_tables.sql
```

### Problème: "Cache MISS systématique"

**Causes possibles:**
1. Redis n'est pas démarré: `sudo systemctl start redis`
2. Clé de cache différente à chaque requête
3. TTL trop court

**Vérification:**
```bash
# Vérifier que Redis fonctionne
redis-cli PING  # Devrait répondre "PONG"

# Voir les clés en cache
redis-cli KEYS "stats_*"
```

### Problème: "Requêtes toujours lentes"

**Vérifications:**
1. Les index sont-ils créés?
   ```sql
   SHOW INDEX FROM tmenage;
   SHOW INDEX FROM tcaracteristique;
   ```

2. Le service ultra-rapide est-il utilisé?
   ```javascript
   // Vérifier dans le contrôleur
   const menageService = require('../services/menageServiceUltraFast');
   ```

3. Les tables pré-agrégées sont-elles peuplées?
   ```sql
   SELECT COUNT(*) FROM stats_par_region;
   SELECT COUNT(*) FROM stats_par_departement;
   ```

### Problème: "Erreur lors du peuplement des tables"

**Causes possibles:**
- Manque de mémoire MySQL
- Timeout trop court
- Données corrompues

**Solutions:**
```bash
# Augmenter les timeouts MySQL
mysql -u root -p menage -e "SET SESSION max_execution_time = 0;"

# Exécuter avec plus de mémoire
mysql --max_allowed_packet=512M -u root -p menage < migrations/03_populate_aggregated_tables.sql
```

## 📈 Benchmarks Attendus

### Avant Optimisation
```
Login + Dashboard: 58-105 secondes
Stats population:  50-105 secondes
Stats émigration:  13-33 secondes
Stats agricoles:   2-22 secondes
```

### Après Optimisation
```
Login + Dashboard: < 2 secondes
Stats population:  < 100ms
Stats émigration:  < 50ms
Stats agricoles:   < 50ms
```

**Amélioration globale: 500-1000x plus rapide!** ⚡

## 🎓 Concepts Utilisés

1. **Index Covering**: Index contenant toutes les colonnes nécessaires
2. **Materialized Views**: Tables précalculées (tables pré-agrégées)
3. **Cache Invalidation**: Stratégie TTL (Time To Live)
4. **Query Optimization**: Hints d'index, requêtes simplifiées
5. **Connection Pooling**: Pool de connexions MySQL optimisé

## 📞 Support

Pour toute question ou problème:
1. Vérifier ce README
2. Consulter les logs: `/var/log/app.log`
3. Vérifier les logs MySQL: `/var/log/mysql/slow-query.log`
4. Vérifier Redis: `redis-cli MONITOR`

---

**Date de création:** $(date)  
**Version:** 1.0.0  
**Auteur:** Équipe de Développement BCR
