#!/bin/bash
# Script pour appliquer les index MySQL de manière sécurisée
# Usage: ./apply_indexes.sh

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

echo "=========================================="
echo "🔧 APPLICATION DES INDEX MySQL"
echo "=========================================="
echo "Base de données: $DB_NAME"
echo "Hôte: $DB_HOST:$DB_PORT"
echo ""

# Construire la commande MySQL
if [ -n "$DB_PASSWORD" ]; then
    MYSQL_CMD="mysql -h$DB_HOST -P$DB_PORT -u$DB_USER -p$DB_PASSWORD $DB_NAME"
else
    MYSQL_CMD="mysql -h$DB_HOST -P$DB_PORT -u$DB_USER $DB_NAME"
fi

echo "📋 Exécution du script d'indexation..."
$MYSQL_CMD < migrations/01_create_indexes.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Index appliqués avec succès!"
    echo ""
    echo "📊 Vérification des index créés:"
    echo "SHOW INDEX FROM tmenage;" | $MYSQL_CMD
    echo ""
    echo "SHOW INDEX FROM tcaracteristique;" | $MYSQL_CMD
else
    echo ""
    echo "❌ Erreur lors de l'application des index"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ OPÉRATION TERMINÉE"
echo "=========================================="
