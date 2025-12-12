# 🪟 Guide d'Installation Windows - Dashboard BCR

## 📋 Prérequis Windows

Avant de commencer, assurez-vous d'avoir installé :

### 1. Node.js
- **Télécharger** : https://nodejs.org/ (version LTS recommandée)
- **Vérifier l'installation** :
  ```cmd
  node -v
  npm -v
  ```

### 2. MySQL
- **Télécharger** : https://dev.mysql.com/downloads/installer/
- **Installer** : MySQL Community Server + MySQL Workbench
- **Configurer** : Notez le mot de passe root pendant l'installation

### 3. Git (optionnel mais recommandé)
- **Télécharger** : https://git-scm.com/download/win
- **Installer** : Avec Git Bash

---

## 🚀 Installation Rapide

### Option 1 : Script PowerShell (Recommandé)

1. **Ouvrir PowerShell en tant qu'Administrateur**
   - Clic droit sur l'icône PowerShell
   - Sélectionner "Exécuter en tant qu'administrateur"

2. **Naviguer vers le projet**
   ```powershell
   cd C:\chemin\vers\votre\projet\dashboard-bcr
   ```

3. **Autoriser l'exécution de scripts** (si nécessaire)
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

4. **Exécuter le script d'installation**
   ```powershell
   .\scripts\install-optimizations.ps1
   ```

### Option 2 : Script Batch

1. **Ouvrir l'Invite de commandes (CMD)**
   - Appuyer sur `Win + R`
   - Taper `cmd` et appuyer sur Entrée

2. **Naviguer vers le projet**
   ```cmd
   cd C:\chemin\vers\votre\projet\dashboard-bcr
   ```

3. **Exécuter le script**
   ```cmd
   scripts\install-optimizations.bat
   ```

---

## 💾 Installation de Redis sur Windows

Redis n'est pas nativement supporté sur Windows. Voici 3 options :

### ✅ Option 1 : Memurai (RECOMMANDÉ pour Windows)

**Memurai est une version de Redis optimisée pour Windows**

1. **Télécharger Memurai**
   - Site : https://www.memurai.com/get-memurai
   - Télécharger : **Memurai Developer** (gratuit)

2. **Installer Memurai**
   - Exécuter le fichier `.msi` téléchargé
   - Suivre l'assistant d'installation
   - Cocher "Install as Windows Service"
   - Cocher "Start Memurai automatically"

3. **Vérifier l'installation**
   ```cmd
   memurai-cli ping
   ```
   Devrait retourner : `PONG`

4. **Configuration**
   - Par défaut : `localhost:6379`
   - Service Windows : Démarre automatiquement
   - Fichier de config : `C:\Program Files\Memurai\memurai.conf`

### ✅ Option 2 : WSL (Windows Subsystem for Linux)

**Utiliser Redis dans un environnement Linux sous Windows**

1. **Installer WSL**
   ```powershell
   wsl --install
   ```
   Redémarrer l'ordinateur si demandé

2. **Installer Redis dans WSL**
   ```bash
   # Dans WSL (Ubuntu)
   sudo apt-get update
   sudo apt-get install redis-server
   ```

3. **Démarrer Redis**
   ```bash
   sudo service redis-server start
   ```

4. **Vérifier**
   ```bash
   redis-cli ping
   ```

5. **Démarrage automatique**
   Créer un fichier `start-redis.bat` :
   ```batch
   @echo off
   wsl sudo service redis-server start
   ```

### ✅ Option 3 : Docker Desktop

**Utiliser Redis dans un conteneur Docker**

1. **Installer Docker Desktop**
   - Télécharger : https://www.docker.com/products/docker-desktop/
   - Installer et démarrer Docker Desktop

2. **Démarrer Redis**
   ```cmd
   docker run -d --name redis-bcr -p 6379:6379 redis:latest
   ```

3. **Vérifier**
   ```cmd
   docker ps
   ```

4. **Commandes utiles**
   ```cmd
   REM Démarrer Redis
   docker start redis-bcr
   
   REM Arrêter Redis
   docker stop redis-bcr
   
   REM Voir les logs
   docker logs redis-bcr
   
   REM Ligne de commande Redis
   docker exec -it redis-bcr redis-cli
   ```

---

## 🗄️ Configuration MySQL sur Windows

### 1. Créer les Index (CRITIQUE)

**Via MySQL Workbench (Interface graphique) :**

1. Ouvrir MySQL Workbench
2. Se connecter à votre serveur MySQL
3. Ouvrir un nouvel onglet SQL
4. Ouvrir le fichier `migrations\01_create_indexes.sql`
5. Cliquer sur l'icône éclair (Execute)
6. Attendre 30-60 minutes

**Via ligne de commande :**

```cmd
cd C:\chemin\vers\votre\projet\dashboard-bcr

mysql -u root -p menage < migrations\01_create_indexes.sql
```

### 2. Configuration MySQL Optimale (my.ini)

**Localisation du fichier** : 
- Par défaut : `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini`
- Ou : `C:\Program Files\MySQL\MySQL Server 8.0\my.ini`

**Ouvrir avec un éditeur de texte en tant qu'Administrateur**

**Ajouter/Modifier ces paramètres** :

```ini
[mysqld]
# Buffer Pool (allouer 50-70% de la RAM)
# Si vous avez 16 GB de RAM, mettre 8-10 GB
innodb_buffer_pool_size = 8G
innodb_buffer_pool_instances = 8

# Logs
innodb_log_file_size = 512M
innodb_log_buffer_size = 16M

# I/O Performance
innodb_flush_method = unbuffered
innodb_io_capacity = 2000
innodb_io_capacity_max = 4000

# Connections
max_connections = 200
max_connect_errors = 10000

# Temporary tables
tmp_table_size = 256M
max_heap_table_size = 256M

# Sort & Join buffers
sort_buffer_size = 4M
read_rnd_buffer_size = 4M
join_buffer_size = 4M

# Table cache
table_open_cache = 4000
table_definition_cache = 2000

# Thread cache
thread_cache_size = 100

# Slow query log
slow_query_log = 1
slow_query_log_file = "C:/ProgramData/MySQL/MySQL Server 8.0/Logs/slow-query.log"
long_query_time = 2
```

**Redémarrer MySQL** :
1. Ouvrir "Services" (services.msc)
2. Trouver "MySQL80" ou "MySQL"
3. Clic droit → Redémarrer

---

## ⚙️ Configuration de l'Application

### 1. Fichier .env

Vérifier/créer le fichier `.env` à la racine du projet :

```env
# Base de données carto
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=db_carto_dashboard
PORT=3000

# Base de données menage
MENAGE_DB_HOST=localhost
MENAGE_DB_USER=root
MENAGE_DB_PASSWORD=votre_mot_de_passe
MENAGE_DB_NAME=menage
MENAGE_DB_PORT=3306

# Configuration Redis
# Si vous utilisez Memurai ou Redis local
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Configuration Node
NODE_ENV=production

# Monitoring (optionnel)
METRICS_TOKEN=votre_token_secret
PERFORMANCE_LOG=true
```

### 2. Installer les dépendances

```cmd
npm install
```

---

## 🧪 Tests et Vérification

### 1. Vérifier Redis

**Si Memurai :**
```cmd
memurai-cli ping
```

**Si WSL :**
```bash
wsl redis-cli ping
```

**Si Docker :**
```cmd
docker exec -it redis-bcr redis-cli ping
```

**Résultat attendu** : `PONG`

### 2. Vérifier MySQL

```cmd
mysql -u root -p -e "SHOW INDEX FROM tmenage;" menage
```

Devrait afficher les index créés, notamment `idx_menage_geo_filters`

### 3. Démarrer l'application

```cmd
npm start
```

**Ou en mode développement :**
```cmd
npm run dev
```

### 4. Tester l'application

Ouvrir un navigateur : http://localhost:3000

### 5. Tester les performances

**Dans un autre terminal :**
```cmd
npm run test:performance
```

### 6. Vérifier la compression

```cmd
curl -I http://localhost:3000/
```

Devrait afficher : `Content-Encoding: gzip`

**Si curl n'est pas installé**, utiliser PowerShell :
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/" -Method Head | Select-Object -ExpandProperty Headers
```

---

## 🔧 Résolution de Problèmes Windows

### ❌ Problème : Redis ne se connecte pas

**Solution 1 - Vérifier le service** :
1. Ouvrir "Services" (Win + R, taper `services.msc`)
2. Chercher "Memurai" ou "Redis"
3. Vérifier qu'il est démarré
4. Si arrêté, clic droit → Démarrer

**Solution 2 - Vérifier le port** :
```cmd
netstat -an | findstr :6379
```
Devrait afficher une ligne avec `LISTENING`

**Solution 3 - Firewall** :
- Vérifier que le port 6379 n'est pas bloqué
- Panneau de configuration → Pare-feu Windows → Règles entrantes
- Ajouter une règle pour le port 6379 si nécessaire

### ❌ Problème : MySQL lent

**Solution - Vérifier la configuration** :
```cmd
mysql -u root -p -e "SHOW VARIABLES LIKE 'innodb_buffer_pool_size';"
```

Si la valeur est trop faible (< 1GB), modifier `my.ini` et redémarrer MySQL.

### ❌ Problème : npm install échoue

**Solution 1 - Nettoyer le cache** :
```cmd
npm cache clean --force
npm install
```

**Solution 2 - Supprimer node_modules** :
```cmd
rmdir /s /q node_modules
del package-lock.json
npm install
```

**Solution 3 - Utiliser un autre registry** :
```cmd
npm config set registry https://registry.npmjs.org/
npm install
```

### ❌ Problème : Permission denied (PowerShell)

**Solution** :
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### ❌ Problème : Port 3000 déjà utilisé

**Trouver le processus** :
```cmd
netstat -ano | findstr :3000
```

**Tuer le processus** :
```cmd
taskkill /PID <PID> /F
```

**Ou changer le port dans .env** :
```env
PORT=3001
```

---

## 📂 Structure des Fichiers Windows

```
C:\votre\projet\dashboard-bcr\
│
├── config\
│   ├── redis.js              ← Configuration Redis
│   ├── menageDB.js            ← Configuration MySQL
│   └── database.js
│
├── services\
│   └── menageServiceOptimized.js
│
├── middleware\
│   └── performanceMonitor.js
│
├── migrations\
│   └── 01_create_indexes.sql  ← Script SQL pour les index
│
├── scripts\
│   ├── install-optimizations.ps1   ← Script PowerShell
│   ├── install-optimizations.bat   ← Script Batch
│   └── test-performance.js
│
├── .env                       ← Configuration (créer ce fichier)
├── package.json
└── app.js
```

---

## 🚀 Démarrage Automatique (Windows)

### Option 1 : PM2 (Recommandé)

```cmd
npm install -g pm2
pm2 install pm2-windows-service
pm2-service-install
```

**Démarrer l'application** :
```cmd
pm2 start npm --name "dashboard-bcr" -- start
pm2 save
```

**L'application démarrera automatiquement au démarrage de Windows**

### Option 2 : Task Scheduler

1. Ouvrir "Planificateur de tâches"
2. Créer une tâche de base
3. Déclencheur : Au démarrage de l'ordinateur
4. Action : Démarrer un programme
5. Programme : `C:\Program Files\nodejs\node.exe`
6. Arguments : `C:\chemin\vers\projet\bin\www`

---

## 📊 Monitoring sur Windows

### Ouvrir les métriques

```cmd
start http://localhost:3000/api/metrics?token=test
```

### Logs de performance

Les logs sont dans : `logs\performance-YYYY-MM-DD.log`

**Visualiser en temps réel** :
```powershell
Get-Content logs\performance-2025-12-06.log -Wait -Tail 50
```

---

## 📚 Commandes Utiles Windows

### NPM
```cmd
npm start              REM Démarrer en production
npm run dev            REM Démarrer en développement
npm run test:performance   REM Tests de performance
```

### MySQL
```cmd
mysql -u root -p                          REM Se connecter
mysql -u root -p menage                   REM Se connecter à la base menage
mysql -u root -p menage < fichier.sql     REM Importer un fichier SQL
```

### Redis (Memurai)
```cmd
memurai-cli                  REM Ligne de commande Redis
memurai-cli ping             REM Test de connexion
memurai-cli KEYS "*"         REM Voir toutes les clés
memurai-cli FLUSHDB          REM Vider le cache
```

### Services Windows
```cmd
net start MySQL80            REM Démarrer MySQL
net stop MySQL80             REM Arrêter MySQL
net start Memurai            REM Démarrer Memurai
net stop Memurai             REM Arrêter Memurai
```

---

## ✅ Checklist d'Installation Windows

- [ ] Node.js installé et testé (`node -v`)
- [ ] MySQL installé et configuré
- [ ] Redis/Memurai installé et démarré
- [ ] Projet cloné/téléchargé
- [ ] Fichier `.env` créé et configuré
- [ ] Dépendances installées (`npm install`)
- [ ] Index MySQL créés (30-60 min)
- [ ] Redis accessible (`memurai-cli ping`)
- [ ] Application démarre (`npm start`)
- [ ] Tests de performance passés
- [ ] Firewall configuré si nécessaire

---

## 🎓 Ressources Windows

- **Node.js** : https://nodejs.org/
- **MySQL** : https://dev.mysql.com/downloads/installer/
- **Memurai (Redis)** : https://www.memurai.com/
- **Docker Desktop** : https://www.docker.com/products/docker-desktop/
- **Git for Windows** : https://git-scm.com/download/win
- **Visual Studio Code** : https://code.visualstudio.com/

---

## 💡 Conseils Windows

1. **Utiliser PowerShell** plutôt que CMD pour de meilleures fonctionnalités
2. **Exécuter en tant qu'Administrateur** pour éviter les problèmes de permissions
3. **Ajouter au PATH** : Node.js, MySQL, Git si pas déjà fait
4. **Désactiver l'antivirus temporairement** si npm install est très lent
5. **Utiliser Windows Terminal** pour une meilleure expérience

---

**Version Windows** : 1.0  
**Date** : 2025-12-06  
**Testé sur** : Windows 10/11
