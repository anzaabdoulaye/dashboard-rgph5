#!/bin/bash
# Script complet d'optimisation de la base de données
# Ce script exécute toutes les migrations dans l'ordre

set -e  # Arrêter en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Charger les variables d'environnement
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Variables de connexion
DB_HOST="${MENAGE_DB_HOST:-localhost}"
DB_PORT="${MENAGE_DB_PORT:-3306}"
DB_NAME="${MENAGE_DB_NAME:-menage}"
DB_USER="${MENAGE_DB_USER:-root}"
DB_PASSWORD="${MENAGE_DB_PASSWORD}"

echo -e "${BLUE}=========================================="
echo "🚀 OPTIMISATION COMPLÈTE DE LA BASE"
echo -e "==========================================${NC}"
echo ""
echo -e "${YELLOW}Base de données:${NC} $DB_NAME"
echo -e "${YELLOW}Hôte:${NC} $DB_HOST:$DB_PORT"
echo -e "${YELLOW}Utilisateur:${NC} $DB_USER"
echo ""

# Construire la commande MySQL
if [ -n "$DB_PASSWORD" ]; then
    MYSQL_CMD="mysql -h$DB_HOST -P$DB_PORT -u$DB_USER -p$DB_PASSWORD $DB_NAME"
else
    MYSQL_CMD="mysql -h$DB_HOST -P$DB_PORT -u$DB_USER $DB_NAME"
fi

# Test de connexion
echo -e "${BLUE}📡 Test de connexion à la base de données...${NC}"
if echo "SELECT 1;" | $MYSQL_CMD > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connexion réussie!${NC}"
else
    echo -e "${RED}❌ Impossible de se connecter à la base de données${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}=========================================="
echo "ÉTAPE 1/3: Création des index"
echo -e "==========================================${NC}"
echo ""

echo ""
echo -e "${BLUE}=========================================="
echo "ÉTAPE 2/3: Création des tables pré-agrégées"
echo -e "==========================================${NC}"
echo ""

if [ -f "migrations/02_create_aggregated_tables.sql" ]; then
    echo "📋 Création des tables de statistiques pré-calculées..."
    $MYSQL_CMD < migrations/02_create_aggregated_tables.sql
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Tables pré-agrégées créées avec succès!${NC}"
    else
        echo -e "${RED}❌ Erreur lors de la création des tables pré-agrégées${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Fichier migrations/02_create_aggregated_tables.sql introuvable${NC}"
fi

echo ""
echo -e "${BLUE}=========================================="
echo "ÉTAPE 3/3: Peuplement des tables pré-agrégées"
echo -e "==========================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  ATTENTION: Cette étape peut prendre plusieurs minutes!${NC}"
echo -e "${YELLOW}   Veuillez patienter...${NC}"
echo ""

if [ -f "migrations/03_populate_aggregated_tables.sql" ]; then
    echo "📊 Calcul et insertion des statistiques pré-calculées..."
    $MYSQL_CMD < migrations/03_populate_aggregated_tables.sql
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Tables pré-agrégées peuplées avec succès!${NC}"
    else
        echo -e "${RED}❌ Erreur lors du peuplement des tables${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Fichier migrations/03_populate_aggregated_tables.sql introuvable${NC}"
fi

echo ""
echo -e "${BLUE}=========================================="
echo "📊 STATISTIQUES FINALES"
echo -e "==========================================${NC}"
echo ""

echo "🔍 Vérification de la taille des tables:"
$MYSQL_CMD <<EOF
SELECT 
    TABLE_NAME,
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Size_MB',
    TABLE_ROWS AS 'Rows'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = '$DB_NAME'
    AND TABLE_NAME IN (
        'tmenage', 'tcaracteristique', 'tagriculture', 'temigration',
        'stats_nationales', 'stats_par_region', 'stats_par_departement', 'stats_par_commune',
        'pyramide_ages_nationale', 'pyramide_ages_region', 'pyramide_ages_departement', 'pyramide_ages_commune'
    )
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
EOF

echo ""
echo -e "${GREEN}=========================================="
echo "🎉 OPTIMISATION TERMINÉE AVEC SUCCÈS!"
echo -e "==========================================${NC}"
echo ""
echo -e "${YELLOW}📝 Prochaines étapes:${NC}"
echo "  1. Modifiez votre contrôleur pour utiliser 'menageServiceUltraFast'"
echo "  2. Redémarrez votre serveur Node.js"
echo "  3. Testez les performances améliorées"
echo ""
echo -e "${YELLOW}💡 Pour mettre à jour les statistiques plus tard:${NC}"
echo "  ./migrations/optimize_database.sh (étape 3 seulement)"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo "  - Les tables pré-agrégées doivent être mises à jour régulièrement"
echo "  - Créez un CRON job pour exécuter l'étape 3 automatiquement"
echo "  - Exemple: 0 */6 * * * (toutes les 6 heures)"
echo ""
