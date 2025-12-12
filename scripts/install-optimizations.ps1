# =====================================================
# Script d'installation des optimisations - WINDOWS
# Dashboard BCR - Recensement Général
# PowerShell Script
# =====================================================

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Installation des Optimisations - Dashboard BCR" -ForegroundColor Cyan
Write-Host "                   WINDOWS" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour afficher un message de succès
function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

# Fonction pour afficher un avertissement
function Write-Warning-Custom {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# Fonction pour afficher une erreur
function Write-Error-Custom {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Vérifier si on est dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Error-Custom "Erreur: Ce script doit être exécuté depuis le répertoire racine de l'application"
    exit 1
}

Write-Host "📦 Étape 1/5: Vérification des prérequis..." -ForegroundColor Cyan
Write-Host ""

# Vérifier Node.js
try {
    $nodeVersion = node -v
    Write-Success "Node.js installé: $nodeVersion"
} catch {
    Write-Error-Custom "Node.js n'est pas installé"
    Write-Host "   Téléchargez Node.js depuis: https://nodejs.org/"
    exit 1
}

# Vérifier npm
try {
    $npmVersion = npm -v
    Write-Success "npm installé: $npmVersion"
} catch {
    Write-Error-Custom "npm n'est pas installé"
    exit 1
}

# Vérifier MySQL
$mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue
if ($mysqlPath) {
    Write-Success "MySQL client trouvé"
} else {
    Write-Warning-Custom "MySQL client n'est pas trouvé dans PATH"
    Write-Host "   Vous devrez créer les index manuellement" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Étape 2/5: Installation de Redis sur Windows..." -ForegroundColor Cyan
Write-Host ""

# Vérifier si Redis est déjà installé
$redisService = Get-Service -Name Redis -ErrorAction SilentlyContinue
if ($redisService) {
    Write-Success "Redis est déjà installé"
    if ($redisService.Status -eq "Running") {
        Write-Success "Redis est en cours d'exécution"
    } else {
        Write-Host "   Démarrage de Redis..." -ForegroundColor Yellow
        Start-Service Redis
        Write-Success "Redis démarré"
    }
} else {
    Write-Warning-Custom "Redis n'est pas installé sur Windows"
    Write-Host ""
    Write-Host "   📋 OPTIONS D'INSTALLATION REDIS POUR WINDOWS:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Option 1 - Memurai (Redis pour Windows - RECOMMANDÉ):" -ForegroundColor White
    Write-Host "      1. Télécharger: https://www.memurai.com/get-memurai" -ForegroundColor Gray
    Write-Host "      2. Installer Memurai Developer (gratuit)" -ForegroundColor Gray
    Write-Host "      3. Redis sera disponible sur localhost:6379" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Option 2 - Redis via WSL (Windows Subsystem for Linux):" -ForegroundColor White
    Write-Host "      1. Installer WSL: wsl --install" -ForegroundColor Gray
    Write-Host "      2. Dans WSL: sudo apt-get install redis-server" -ForegroundColor Gray
    Write-Host "      3. Démarrer: sudo service redis-server start" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Option 3 - Docker Desktop:" -ForegroundColor White
    Write-Host "      1. Installer Docker Desktop" -ForegroundColor Gray
    Write-Host "      2. Exécuter: docker run -d -p 6379:6379 redis" -ForegroundColor Gray
    Write-Host ""
    
    $installChoice = Read-Host "Voulez-vous continuer sans Redis? (o/N)"
    if ($installChoice -ne "o" -and $installChoice -ne "O") {
        Write-Host "Installation annulée. Installez Redis et relancez le script." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "📦 Étape 3/5: Installation des dépendances Node.js..." -ForegroundColor Cyan
Write-Host ""

npm install
if ($LASTEXITCODE -eq 0) {
    Write-Success "Dépendances installées"
} else {
    Write-Error-Custom "Erreur lors de l'installation des dépendances"
    exit 1
}

Write-Host ""
Write-Host "📦 Étape 4/5: Configuration de la base de données..." -ForegroundColor Cyan
Write-Host ""

# Demander les informations de connexion MySQL
$mysqlHost = Read-Host "Hôte MySQL (défaut: localhost)"
if ([string]::IsNullOrWhiteSpace($mysqlHost)) { $mysqlHost = "localhost" }

$mysqlUser = Read-Host "Utilisateur MySQL (défaut: root)"
if ([string]::IsNullOrWhiteSpace($mysqlUser)) { $mysqlUser = "root" }

$mysqlPassword = Read-Host "Mot de passe MySQL" -AsSecureString
$mysqlPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysqlPassword)
)

$mysqlDb = Read-Host "Nom de la base de données (défaut: menage)"
if ([string]::IsNullOrWhiteSpace($mysqlDb)) { $mysqlDb = "menage" }

# Tester la connexion
Write-Host ""
Write-Host "🔍 Test de connexion à MySQL..." -ForegroundColor Cyan

$testQuery = "USE $mysqlDb;"
$mysqlArgs = @(
    "-h", $mysqlHost,
    "-u", $mysqlUser,
    "-p$mysqlPasswordPlain",
    "-e", $testQuery
)

try {
    $null = & mysql @mysqlArgs 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Connexion MySQL réussie"
        
        # Proposer de créer les index
        Write-Host ""
        $createIndexes = Read-Host "Voulez-vous créer les index maintenant? (o/N)"
        
        if ($createIndexes -eq "o" -or $createIndexes -eq "O") {
            Write-Host "⏳ Création des index en cours... (cela peut prendre 30-60 minutes)" -ForegroundColor Yellow
            
            $sqlFile = "migrations\01_create_indexes.sql"
            if (Test-Path $sqlFile) {
                $mysqlImportArgs = @(
                    "-h", $mysqlHost,
                    "-u", $mysqlUser,
                    "-p$mysqlPasswordPlain",
                    $mysqlDb
                )
                
                Get-Content $sqlFile | & mysql @mysqlImportArgs
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Index créés avec succès"
                } else {
                    Write-Error-Custom "Erreur lors de la création des index"
                    Write-Host "   Vous pouvez les créer manuellement avec:" -ForegroundColor Yellow
                    Write-Host "   mysql -h $mysqlHost -u $mysqlUser -p $mysqlDb < migrations\01_create_indexes.sql" -ForegroundColor Gray
                }
            } else {
                Write-Error-Custom "Fichier migrations\01_create_indexes.sql introuvable"
            }
        } else {
            Write-Warning-Custom "Index non créés. N'oubliez pas de les créer plus tard!"
            Write-Host "   Commande: mysql -h $mysqlHost -u $mysqlUser -p $mysqlDb < migrations\01_create_indexes.sql" -ForegroundColor Gray
        }
    } else {
        throw "Connection failed"
    }
} catch {
    Write-Error-Custom "Impossible de se connecter à MySQL"
    Write-Host "   Vérifiez vos identifiants et réessayez" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Étape 5/5: Vérification finale..." -ForegroundColor Cyan
Write-Host ""

# Vérifier que tous les fichiers nécessaires existent
$files = @(
    "config\redis.js",
    "config\menageDB.js",
    "services\menageServiceOptimized.js",
    "migrations\01_create_indexes.sql",
    "OPTIMIZATIONS.md"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Success "Fichier présent: $file"
    } else {
        Write-Error-Custom "Fichier manquant: $file"
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "✅ Installation terminée!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Vérifier le fichier .env et ajuster les paramètres si nécessaire" -ForegroundColor White
Write-Host ""
Write-Host "2. Si vous n'avez pas créé les index, exécutez:" -ForegroundColor White
Write-Host "   mysql -h $mysqlHost -u $mysqlUser -p $mysqlDb < migrations\01_create_indexes.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Démarrer l'application:" -ForegroundColor White
Write-Host "   npm start        (production)" -ForegroundColor Gray
Write-Host "   npm run dev      (développement)" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Consulter OPTIMIZATIONS.md pour plus de détails" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Votre application est maintenant optimisée pour gérer 35 millions d'habitants!" -ForegroundColor Green
Write-Host ""
