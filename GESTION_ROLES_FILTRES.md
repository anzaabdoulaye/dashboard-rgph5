# 🔐 Gestion des Rôles et Filtres Géographiques

## 📋 Vue d'ensemble

Ce document décrit le système de gestion des accès basé sur les rôles pour les filtres géographiques du dashboard BCR.

---

## 🎯 Objectif

Permettre aux utilisateurs d'accéder uniquement aux données de leur territoire selon leur rôle :
- **ROLE_GLOBAL** : Accès à toutes les données
- **ROLE_REGIONAL** : Accès limité à une région
- **ROLE_DEPARTEMENTAL** : Accès limité à un département
- **ROLE_COMMUNAL** : Accès limité à une commune

---

## 🏗️ Architecture

### 1. Modèle de données (`models/User.js`)

Chaque utilisateur possède :
```javascript
{
  roles: ['ROLE_GLOBAL' | 'ROLE_REGIONAL' | 'ROLE_DEPARTEMENTAL' | 'ROLE_COMMUNAL'],
  region_id: INTEGER,
  departement_id: INTEGER,
  commune_id: INTEGER,
  code: STRING // Code géographique généré automatiquement
}
```

**Génération automatique du code** :
- `ROLE_REGIONAL` : code = code de la région (1 caractère)
- `ROLE_DEPARTEMENTAL` : code = code du département (3 caractères)
- `ROLE_COMMUNAL` : code = code de la commune (5 caractères)
- `ROLE_GLOBAL` : code = 'GLOBAL'

---

## 🔒 Comportement par Rôle

### ROLE_GLOBAL 👑
**Accès** : Toutes les données du pays

**Interface** :
- ✅ Select **Région** : Actif et vide par défaut
- ✅ Select **Département** : S'active après sélection d'une région
- ✅ Select **Commune** : S'active après sélection d'un département
- ✅ Select **ZD** : S'active après sélection d'une commune

**Comportement** :
- Au chargement : Affiche les stats globaux (tous les filtres vides)
- Lors de la sélection d'une région : Recalcule les stats pour cette région
- Peut naviguer librement dans toute la hiérarchie géographique

---

### ROLE_REGIONAL 🌍
**Accès** : Uniquement les données de SA région

**Interface** :
- 🔒 Select **Région** : Verrouillé sur sa région (non modifiable)
- ✅ Select **Département** : Actif, liste les départements de SA région
- ✅ Select **Commune** : S'active après sélection d'un département
- ✅ Select **ZD** : S'active après sélection d'une commune

**Comportement** :
- Au chargement : Affiche les stats de sa région
- Peut naviguer entre les départements et communes de SA région uniquement
- Ne peut pas accéder aux données d'autres régions

---

### ROLE_DEPARTEMENTAL 🏙️
**Accès** : Uniquement les données de SON département

**Interface** :
- 🔒 Select **Région** : Verrouillé sur sa région (non modifiable)
- 🔒 Select **Département** : Verrouillé sur son département (non modifiable)
- ✅ Select **Commune** : Actif, liste les communes de SON département
- ✅ Select **ZD** : S'active après sélection d'une commune

**Comportement** :
- Au chargement : Affiche les stats de son département
- Peut naviguer entre les communes de SON département uniquement
- Ne peut pas accéder aux données d'autres départements

---

### ROLE_COMMUNAL 🏘️
**Accès** : Uniquement les données de SA commune

**Interface** :
- 🔒 Select **Région** : Verrouillé sur sa région (non modifiable)
- 🔒 Select **Département** : Verrouillé sur son département (non modifiable)
- 🔒 Select **Commune** : Verrouillé sur sa commune (non modifiable)
- ✅ Select **ZD** : Actif, liste les ZD de SA commune

**Comportement** :
- Au chargement : Affiche les stats de sa commune
- Peut naviguer entre les ZD de SA commune uniquement
- Ne peut pas accéder aux données d'autres communes

---

## 🔧 Implémentation Technique

### Côté Serveur (`controllers/dashboardController.js`)

#### 1. Initialisation des filtres selon le rôle

```javascript
function initializeFiltersForRole(user, filters) {
  switch(user.role) {
    case 'ROLE_GLOBAL':
      return filters; // Pas de modification
    
    case 'ROLE_REGIONAL':
      return {
        region: filters.region || getUserDefaultRegion(user),
        departement: filters.departement,
        commune: filters.commune,
        zd: filters.zd
      };
    
    case 'ROLE_DEPARTEMENTAL':
      return {
        region: filters.region || getUserDefaultRegion(user),
        departement: filters.departement || getUserDefaultDepartement(user),
        commune: filters.commune,
        zd: filters.zd
      };
    
    case 'ROLE_COMMUNAL':
      return {
        region: filters.region || getUserDefaultRegion(user),
        departement: filters.departement || getUserDefaultDepartement(user),
        commune: filters.commune || getUserDefaultCommune(user),
        zd: filters.zd
      };
  }
}
```

#### 2. Validation d'accès

```javascript
function hasAccessToFilters(user, filters) {
  switch(user.role) {
    case 'ROLE_GLOBAL':
      return true;
    
    case 'ROLE_REGIONAL':
      // Vérifier que la région demandée correspond à sa région
      if (filters.region && user.code) {
        return filters.region === user.code.substring(0, 1);
      }
      return true;
    
    // ... autres rôles
  }
}
```

#### 3. Passage des infos à la vue

```javascript
const userFlags = {
  ...user,
  isGlobal: user.role === 'ROLE_GLOBAL',
  isRegional: user.role === 'ROLE_REGIONAL',
  isDepartemental: user.role === 'ROLE_DEPARTEMENTAL',
  isCommunal: user.role === 'ROLE_COMMUNAL',
  
  // Permissions de modification
  canChangeRegion: user.role === 'ROLE_GLOBAL',
  canChangeDepartement: ['ROLE_GLOBAL', 'ROLE_REGIONAL'].includes(user.role),
  canChangeCommune: ['ROLE_GLOBAL', 'ROLE_REGIONAL', 'ROLE_DEPARTEMENTAL'].includes(user.role),
  canChangeZD: true,
  
  // Valeurs présélectionnées
  preselectedRegion: getUserDefaultRegion(user),
  preselectedDepartement: getUserDefaultDepartement(user),
  preselectedCommune: getUserDefaultCommune(user)
};
```

---

### Côté Client (`views/pages/dashboard.ejs` et `charts.ejs`)

#### 1. Rendu conditionnel des selects

```ejs
<div class="col-3">
  <label>Région</label>
  <% if (user.canChangeRegion) { %>
    <!-- Rôle GLOBAL : Select actif et vide -->
    <select id="region" class="form-select" data-role="<%= user.role %>">
      <option value="">-- Sélectionner --</option>
    </select>
  <% } else { %>
    <!-- Autres rôles : Select présélectionné et verrouillé -->
    <select id="region" class="form-select" data-role="<%= user.role %>" data-locked="true">
      <option value="<%= user.preselectedRegion %>" selected>Ma région</option>
    </select>
  <% } %>
</div>
```

#### 2. Verrouillage JavaScript

```javascript
const isLocked = (select) => select.getAttribute('data-locked') === 'true';

// Empêcher la modification des selects verrouillés
Object.values(selects).forEach(select => {
  if (isLocked(select)) {
    select.addEventListener('mousedown', (e) => {
      e.preventDefault();
      select.blur();
    });
    select.style.cursor = 'not-allowed';
    select.style.backgroundColor = '#f0f0f0';
  }
});
```

#### 3. Initialisation selon le rôle

```javascript
if (userRole === 'ROLE_GLOBAL') {
  // Charger les régions
  loadOptions('/api/location/regions', selects.region, 'code_region', 'region');
} 
else if (userRole === 'ROLE_REGIONAL') {
  // Charger les départements de la région présélectionnée
  const preselectedRegion = '<%= user.preselectedRegion %>';
  loadOptions(`/api/location/departements?region=${preselectedRegion}`, 
              selects.departement, 'code_departement', 'departement');
}
// ... autres rôles
```

---

## 🔐 Sécurité

### Protection côté serveur

1. **Validation systématique** : Tous les filtres sont validés dans `hasAccessToFilters()`
2. **Réinitialisation automatique** : Si un utilisateur essaie d'accéder à un territoire non autorisé, les filtres sont réinitialisés à son territoire
3. **Filtrage des requêtes SQL** : Le service `menageServiceUltraFast.js` applique automatiquement les filtres selon l'utilisateur

### Protection côté client

1. **Verrouillage visuel** : Les selects sont désactivés et stylés pour indiquer qu'ils ne sont pas modifiables
2. **Prévention des événements** : Les événements `mousedown` sont interceptés sur les selects verrouillés
3. **Validation à chaque changement** : Les stats ne sont recalculées que si les filtres sont valides

---

## 📊 Exemples de Cas d'Usage

### Utilisateur Global : Alice

**Profil** :
```javascript
{
  nom: "Alice",
  role: "ROLE_GLOBAL",
  code: "GLOBAL"
}
```

**Scénario 1** : Alice ouvre le dashboard
- ✅ Tous les selects sont vides
- ✅ Les stats globaux s'affichent (tout le pays)

**Scénario 2** : Alice sélectionne la région "1"
- ✅ Les stats se recalculent pour la région 1
- ✅ Le select département se remplit avec les départements de la région 1
- ✅ Alice peut ensuite sélectionner un département, une commune, une ZD

---

### Utilisateur Régional : Bob

**Profil** :
```javascript
{
  nom: "Bob",
  role: "ROLE_REGIONAL",
  region_id: 2,
  code: "2"
}
```

**Scénario 1** : Bob ouvre le dashboard
- 🔒 Le select région est verrouillé sur "Région 2"
- ✅ Les stats de la région 2 s'affichent
- ✅ Le select département liste les départements de la région 2

**Scénario 2** : Bob sélectionne un département
- ✅ Les stats se recalculent pour ce département
- ✅ Le select commune se remplit avec les communes du département sélectionné
- 🔒 Bob ne peut PAS changer de région

---

### Utilisateur Départemental : Charlie

**Profil** :
```javascript
{
  nom: "Charlie",
  role: "ROLE_DEPARTEMENTAL",
  region_id: 1,
  departement_id: 3,
  code: "103"
}
```

**Scénario 1** : Charlie ouvre le dashboard
- 🔒 Le select région est verrouillé sur "Région 1"
- 🔒 Le select département est verrouillé sur "Département 103"
- ✅ Les stats du département 103 s'affichent
- ✅ Le select commune liste les communes du département 103

**Scénario 2** : Charlie sélectionne une commune
- ✅ Les stats se recalculent pour cette commune
- ✅ Le select ZD se remplit avec les ZD de la commune sélectionnée
- 🔒 Charlie ne peut PAS changer de région ou de département

---

### Utilisatrice Communale : Diana

**Profil** :
```javascript
{
  nom: "Diana",
  role: "ROLE_COMMUNAL",
  region_id: 2,
  departement_id: 5,
  commune_id: 12,
  code: "21205"
}
```

**Scénario 1** : Diana ouvre le dashboard
- 🔒 Le select région est verrouillé sur "Région 2"
- 🔒 Le select département est verrouillé sur "Département 205"
- 🔒 Le select commune est verrouillé sur "Commune 21205"
- ✅ Les stats de la commune 21205 s'affichent
- ✅ Le select ZD liste les ZD de la commune 21205

**Scénario 2** : Diana sélectionne une ZD
- ✅ Les stats se recalculent pour cette ZD
- 🔒 Diana ne peut PAS changer de région, département ou commune

---

## 🧪 Tests

### Tests manuels recommandés

1. **Test ROLE_GLOBAL**
   - [ ] Vérifier que tous les selects sont actifs et vides au chargement
   - [ ] Vérifier que les stats globaux s'affichent
   - [ ] Sélectionner une région → vérifier recalcul des stats
   - [ ] Naviguer dans toute la hiérarchie

2. **Test ROLE_REGIONAL**
   - [ ] Vérifier que le select région est verrouillé
   - [ ] Vérifier que les stats de la région s'affichent
   - [ ] Essayer de modifier le select région (doit être impossible)
   - [ ] Naviguer dans les départements et communes de la région

3. **Test ROLE_DEPARTEMENTAL**
   - [ ] Vérifier que région et département sont verrouillés
   - [ ] Vérifier que les stats du département s'affichent
   - [ ] Naviguer dans les communes du département

4. **Test ROLE_COMMUNAL**
   - [ ] Vérifier que région, département et commune sont verrouillés
   - [ ] Vérifier que les stats de la commune s'affichent
   - [ ] Naviguer dans les ZD de la commune

### Tests de sécurité

1. **Tentative d'accès non autorisé**
   - Tester en modifiant manuellement l'URL avec des paramètres non autorisés
   - Exemple : utilisateur régional essayant `?region=2` alors que sa région est "1"
   - Résultat attendu : Réinitialisation automatique aux filtres autorisés

2. **Validation des API**
   - Tester les appels API directs sans passer par l'interface
   - Vérifier que les données renvoyées sont bien filtrées selon le rôle

---

## 📝 Maintenance

### Ajout d'un nouveau rôle

1. Ajouter le rôle dans `models/User.js` (hook de génération du code)
2. Mettre à jour `initializeFiltersForRole()` dans `dashboardController.js`
3. Mettre à jour `hasAccessToFilters()` dans `dashboardController.js`
4. Ajouter les conditions dans les vues EJS
5. Mettre à jour ce document

### Modification de la hiérarchie géographique

Si vous ajoutez un niveau (ex: "District" entre Commune et ZD) :
1. Mettre à jour le modèle User
2. Ajouter le champ dans les filtres
3. Mettre à jour toutes les fonctions de validation
4. Ajouter le select dans les vues
5. Mettre à jour l'initialisation JavaScript

---

## 🐛 Dépannage

### Problème : Le select reste actif alors qu'il devrait être verrouillé

**Cause** : Les données `user.canChange*` ne sont pas correctement passées à la vue

**Solution** : Vérifier que `userFlags` contient bien toutes les propriétés dans le contrôleur

---

### Problème : Les stats ne se recalculent pas après sélection

**Cause** : Les event listeners ne sont pas attachés ou sont bloqués

**Solution** : Vérifier dans la console que les événements `change` se déclenchent

---

### Problème : Un utilisateur voit des données hors de son territoire

**Cause** : La validation serveur échoue ou les filtres SQL ne sont pas appliqués

**Solution** : Vérifier `hasAccessToFilters()` et les requêtes dans `menageServiceUltraFast.js`

---

## 📚 Références

- **Modèle User** : `models/User.js`
- **Contrôleur Dashboard** : `controllers/dashboardController.js`
- **Vues** : `views/pages/dashboard.ejs`, `views/pages/charts.ejs`
- **Middleware d'authentification** : `middleware/authMiddleware.js`
- **Service de données** : `services/menageServiceUltraFast.js`

---

**Version** : 1.0  
**Date** : 2025-12-11  
**Auteur** : Équipe Dashboard BCR  
**Status** : ✅ Implémenté et testé
