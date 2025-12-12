#!/bin/bash

# =====================================================
# Script d'installation des optimisations
# Dashboard BCR - Recensement Général
# =====================================================

set -e  # Arrêter en cas d'erreur

echo "=================================================="
echo "🚀 Installation des Optimisations - Dashboard BCR"
echo "=================================================="
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher un message de succès
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction pour afficher un avertissement
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Fonction pour afficher une erreur
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    error "Erreur: Ce script doit être exécuté depuis le répertoire racine de l'application"
    exit 1
fi

echo "📦 Étape 1/5: Vérification des prérequis..."
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé"
    exit 1
fi
success "Node.js installé: $(node -v)"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    error "npm n'est pas installé"
    exit 1
fi
success "npm installé: $(npm -v)"

# Vérifier MySQL
if ! command -v mysql &> /dev/null; then
    warning "MySQL client n'est pas trouvé dans PATH"
    echo "   Vous devrez créer les index manuellement"
else
    success "MySQL client trouvé"
fi

echo ""
echo "📦 Étape 2/5: Installation de Redis..."
echo ""

# Vérifier si Redis est déjà installé
if command -v redis-server &> /dev/null; then
    success "Redis est déjà installé: $(redis-server --version | head -n1)"
else
    warning "Redis n'est pas installé. Installation en cours..."
    
    # Détecter le système d'exploitation
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get &> /dev/null; then
            # Ubuntu/Debian
            sudo apt-get update
            sudo apt-get install -y redis-server
            sudo systemctl start redis
            sudo systemctl enable redis
            success "Redis installé avec succès"
        elif command -v yum &> /dev/null; then
            # CentOS/RHEL
            sudo yum install -y redis
            sudo systemctl start redis
            sudo systemctl enable redis
            success "Redis installé avec succès"
        else
            warning "Système non supporté pour l'installation automatique de Redis"
            echo "   Veuillez installer Redis manuellement: https://redis.io/docs/getting-started/"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install redis
            brew services start redis
            success "Redis installé avec succès"
        else
            warning "Homebrew n'est pas installé"
            echo "   Veuillez installer Redis manuellement: brew install redis"
        fi
    else
        warning "Système non supporté pour l'installation automatique de Redis"
        echo "   Veuillez installer Redis manuellement"
    fi
fi

# Tester la connexion à Redis
echo ""
echo "🔍 Test de connexion à Redis..."
if redis-cli ping &> /dev/null; then
    success "Redis fonctionne correctement"
else
    warning "Redis ne répond pas au ping"
    echo "   Vérifiez que Redis est démarré: sudo systemctl status redis"
fi

echo ""
echo "📦 Étape 3/5: Installation des dépendances Node.js..."
echo ""

npm install

success "Dépendances installées"

echo ""
echo "📦 Étape 4/5: Configuration de la base de données..."
echo ""

# Demander les informations de connexion MySQL
read -p "Hôte MySQL (défaut: localhost): " MYSQL_HOST
MYSQL_HOST=${MYSQL_HOST:-localhost}

read -p "Utilisateur MySQL (défaut: root): " MYSQL_USER
MYSQL_USER=${MYSQL_USER:-root}

read -sp "Mot de passe MySQL: " MYSQL_PASSWORD
echo ""

read -p "Nom de la base de données (défaut: menage): " MYSQL_DB
MYSQL_DB=${MYSQL_DB:-menage}

# Tester la connexion
echo ""
echo "🔍 Test de connexion à MySQL..."
if mysql -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "USE $MYSQL_DB;" &> /dev/null; then
    success "Connexion MySQL réussie"
    
    # Proposer de créer les index
    echo ""
    read -p "Voulez-vous créer les index maintenant? (o/N): " CREATE_INDEXES
    
    if [[ "$CREATE_INDEXES" =~ ^[Oo]$ ]]; then
        echo "⏳ Création des index en cours... (cela peut prendre 30-60 minutes)"
        
        if mysql -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DB" < migrations/01_create_indexes.sql; then
            success "Index créés avec succès"
        else
            error "Erreur lors de la création des index"
            echo "   Vous pouvez les créer manuellement avec:"
            echo "   mysql -h $MYSQL_HOST -u $MYSQL_USER -p $MYSQL_DB < migrations/01_create_indexes.sql"
        fi
    else
        warning "Index non créés. N'oubliez pas de les créer plus tard!"
        echo "   Commande: mysql -h $MYSQL_HOST -u $MYSQL_USER -p $MYSQL_DB < migrations/01_create_indexes.sql"
    fi
else
    error "Impossible de se connecter à MySQL"
    echo "   Vérifiez vos identifiants et réessayez"
fi

echo ""
echo "📦 Étape 5/5: Vérification finale..."
echo ""

# Vérifier que tous les fichiers nécessaires existent
FILES=(
    "config/redis.js"
    "config/menageDB.js"
    "services/menageServiceOptimized.js"
    "migrations/01_create_indexes.sql"
    "OPTIMIZATIONS.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        success "Fichier présent: $file"
    else
        error "Fichier manquant: $file"
    fi
done

echo ""
echo "=================================================="
echo "✅ Installation terminée!"
echo "=================================================="
echo ""
echo "📋 Prochaines étapes:"
echo ""
echo "1. Vérifier le fichier .env et ajuster les paramètres si nécessaire"
echo "2. Si vous n'avez pas créé les index, exécutez:"
echo "   mysql -u $MYSQL_USER -p $MYSQL_DB < migrations/01_create_indexes.sql"
echo ""
echo "3. Démarrer l'application:"
echo "   npm start (production)"
echo "   npm run dev (développement)"
echo ""
echo "4. Consulter OPTIMIZATIONS.md pour plus de détails"
echo ""
echo "🎉 Votre application est maintenant optimisée pour gérer 35 millions d'habitants!"
echo ""
