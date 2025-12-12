# 🚀 Démarrage Rapide - Windows

## ⚡ Installation Express (5 minutes)

### 1️⃣ Prérequis
Installer dans l'ordre:
1. **Node.js** : https://nodejs.org/ (télécharger et installer)
2. **MySQL** : https://dev.mysql.com/downloads/installer/ (installer MySQL Server)
3. **Memurai** (Redis pour Windows) : https://www.memurai.com/get-memurai (version Developer gratuite)

### 2️⃣ Installation
Ouvrir PowerShell dans le dossier du projet et exécuter:

```powershell
# Installer les dépendances
npm install

# Lancer l'installation automatique
npm run install:optimizations
```

**OU** si PowerShell ne fonctionne pas, utiliser CMD:

```cmd
npm install
scripts\install-optimizations.bat
```

### 3️⃣ Créer les Index MySQL (30-60 min)

**Option A - MySQL Workbench (Facile):**
1. Ouvrir MySQL Workbench
2. Se connecter
3. Fichier → Open SQL Script
4. Sélectionner: `migrations\01_create_indexes.sql`
5. Cliquer sur ⚡ Execute
6. Attendre...

**Option B - Ligne de commande:**
```cmd
mysql -u root -p menage < migrations\01_create_indexes.sql
```

### 4️⃣ Configuration

Créer/éditer le fichier `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=db_carto_dashboard
PORT=3000

MENAGE_DB_HOST=localhost
MENAGE_DB_USER=root
MENAGE_DB_PASSWORD=votre_mot_de_passe
MENAGE_DB_NAME=menage
MENAGE_DB_PORT=3306

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

NODE_ENV=production
```

### 5️⃣ Démarrer

```cmd
npm start
```

Ouvrir: http://localhost:3000

---

## ✅ Vérifications

### Redis fonctionne?
```cmd
memurai-cli ping
```
Doit afficher: `PONG`

### MySQL fonctionne?
```cmd
mysql -u root -p -e "SHOW INDEX FROM tmenage;" menage
```
Doit afficher les index

### Application fonctionne?
```cmd
curl http://localhost:3000/
```
Ou ouvrir dans le navigateur

---

## ❌ Problèmes Fréquents

### Redis ne démarre pas
1. Services (Win + R → `services.msc`)
2. Chercher "Memurai"
3. Clic droit → Démarrer

### Port 3000 occupé
```cmd
# Trouver le processus
netstat -ano | findstr :3000

# Tuer le processus (remplacer <PID>)
taskkill /PID <PID> /F
```

### MySQL ne se connecte pas
- Vérifier le mot de passe dans `.env`
- Vérifier que MySQL est démarré (services.msc)

### npm install échoue
```cmd
# Nettoyer et réinstaller
npm cache clean --force
rmdir /s /q node_modules
del package-lock.json
npm install
```

---

## 📚 Documentation Complète

Pour plus de détails:
- **INSTALLATION_WINDOWS.md** - Guide complet Windows
- **OPTIMIZATIONS.md** - Guide technique
- **README_NASSER.md** - Vue d'ensemble

---

## 🆘 Aide Rapide

### Commandes Utiles

```cmd
npm start                    # Démarrer l'app
npm run dev                  # Mode développement
npm run test:performance     # Tests de perf

memurai-cli                  # Console Redis
mysql -u root -p             # Console MySQL

net start MySQL80            # Démarrer MySQL
net start Memurai            # Démarrer Memurai
```

### Logs
```cmd
# Voir les logs de performance
type logs\performance-2025-12-06.log
```

### Métriques
Ouvrir: http://localhost:3000/api/metrics?token=test

---

**Support**: Voir INSTALLATION_WINDOWS.md pour la résolution de problèmes détaillée
