# Utilisation de la version spécifique demandée par le client
FROM node:22.20-alpine

# Définition du répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copie des fichiers package.json et package-lock.json
# Cela permet de mettre en cache l'étape d'installation des dépendances
COPY package*.json ./

# Installation des dépendances
# Utilisez --omit=dev ou --production pour éviter d'installer les devDependencies
RUN npm install --production

# Copie du reste des fichiers du projet
COPY . .

# Exposition du port utilisé par l'application (comme indiqué dans votre config)
EXPOSE 8071

# Commande de démarrage de l'application
CMD ["node", "app.js"]