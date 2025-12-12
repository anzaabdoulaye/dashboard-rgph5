// controllers/dashboardController.js
// Utiliser le service optimisé avec Redis cache
const menageService = require('../services/menageServiceUltraFast');

// Cache simple en mémoire pour stats (expire au bout de 5 minutes)
const statsCache = {};
const chartsCache = {};

// Générer une clé unique pour le cache selon les filtres ET l'utilisateur
function getCacheKey(filters, user = null) {
  const userKey = user ? `${user.id}-${user.role}` : 'no-user';
  return `${userKey}-${JSON.stringify(filters)}`;
}

// Page Dashboard
exports.showDashboard = async (req, res) => {
  try {
    // 1. Vérifier que l'utilisateur est connecté
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }

    const user = req.session.user;
    
    // 2. Récupérer les filtres de la requête
    let filters = {
      region: req.query.region || null,
      departement: req.query.departement || null,
      commune: req.query.commune || null,
      zd: req.query.zd || null
    };

    // 3. INITIALISATION DES FILTRES SELON LE RÔLE
    // Pour les rôles non-globaux, on initialise les filtres à leur territoire s'ils ne sont pas déjà définis
    filters = initializeFiltersForRole(user, filters);

    // 4. VALIDATION CRITIQUE : Vérifier que l'utilisateur a le droit d'accéder aux filtres demandés
    if (!hasAccessToFilters(user, filters)) {
      // Si l'utilisateur essaie d'accéder à un territoire non autorisé,
      // on réinitialise les filtres à son territoire assigné
      filters.region = getUserDefaultRegion(user);
      filters.departement = getUserDefaultDepartement(user);
      filters.commune = getUserDefaultCommune(user);
      filters.zd = null; // Toujours null par défaut
    }

    const cacheKey = getCacheKey(filters, user);

    let mainStats, populationStats, proportionAgricoles, averageEmigres;

    if (statsCache[cacheKey]) {
      ({ mainStats, populationStats, proportionAgricoles, averageEmigres } = statsCache[cacheKey]);
    } else {
      // 4. Exécuter les requêtes statistiques AVEC l'utilisateur pour filtrage automatique
      [mainStats, populationStats, proportionAgricoles, averageEmigres] = await Promise.all([
        menageService.getMainStats(filters, user),
        menageService.getPopulationStatsCombined(filters, user),
        menageService.getProportionMenagesAgricoles(filters, user),
        menageService.getAverageEmigresPerMenage(filters, user)
      ]);

      // Stocker dans le cache
      statsCache[cacheKey] = { mainStats, populationStats, proportionAgricoles, averageEmigres };
      setTimeout(() => delete statsCache[cacheKey], 5 * 60 * 1000); // 5 minutes
    }

    // 5. Récupérer les listes pour les filtres AVEC restriction par rôle
    const [regions, departements, communes, zds] = await Promise.all([
      menageService.getRegions(user),
      menageService.getDepartements(filters.region, user),
      menageService.getCommunes(filters.departement, user),
      menageService.getZds(filters.commune, user)
    ]);

    // 6. Déterminer quels sélecteurs doivent être actifs selon le rôle
    const userFlags = {
      ...user,
      role: user.role, // CRITIQUE : passer le rôle brut
      isGlobal: user.role === 'ROLE_GLOBAL',
      isRegional: user.role === 'ROLE_REGIONAL',
      isDepartemental: user.role === 'ROLE_DEPARTEMENTAL',
      isCommunal: user.role === 'ROLE_COMMUNAL',
      
      canChangeRegion: user.role === 'ROLE_GLOBAL',
      canChangeDepartement: ['ROLE_GLOBAL', 'ROLE_REGIONAL'].includes(user.role),
      canChangeCommune: ['ROLE_GLOBAL', 'ROLE_REGIONAL', 'ROLE_DEPARTEMENTAL'].includes(user.role),
      canChangeZD: true,
      
      // Valeurs de présélection
      preselectedRegion: getUserDefaultRegion(user),
      preselectedDepartement: getUserDefaultDepartement(user),
      preselectedCommune: getUserDefaultCommune(user),
      
      // Valeurs par défaut pour les filtres
      defaultRegion: getUserDefaultRegion(user),
      defaultDepartement: getUserDefaultDepartement(user),
      defaultCommune: getUserDefaultCommune(user)
    };

    // 7. Préparer les données pour la vue
    const viewData = {
      stats: {
        ...mainStats,
        ...populationStats,
        proportionAgricoles,
        averageEmigres
      },
      selects: { 
        regions: prepareSelectOptions(regions, 'region', filters.region, user),
        departements: prepareSelectOptions(departements, 'departement', filters.departement, user),
        communes: prepareSelectOptions(communes, 'commune', filters.commune, user),
        zds: prepareSelectOptions(zds, 'zd', filters.zd, user)
      },
      filters,
      user: userFlags
    };

    res.render('pages/dashboard', viewData);

  } catch (err) {
    console.error('Erreur showDashboard:', err);
    res.status(500).send('Erreur serveur');
  }
};

// GET /stats (API JSON)
exports.getStats = async (req, res) => {
  try {
    const user = req.session.user;
    const filters = {
      region: req.query.region || null,
      departement: req.query.departement || null,
      commune: req.query.commune || null,
      zd: req.query.zd || null
    };

    // Validation des filtres pour cet utilisateur
    if (!hasAccessToFilters(user, filters)) {
      return res.status(403).json({ error: 'Accès non autorisé à ce territoire' });
    }

    const cacheKey = getCacheKey(filters, user);

    let stats;

    if (statsCache[cacheKey]) {
      stats = statsCache[cacheKey];
    } else {
      // Exécuter toutes les requêtes lourdes en parallèle AVEC l'utilisateur
      const [mainStats, populationStats, proportionAgricoles, averageEmigres, pyramideAges] = await Promise.all([
        menageService.getMainStats(filters, user),
        menageService.getPopulationStatsCombined(filters, user),
        menageService.getProportionMenagesAgricoles(filters, user),
        menageService.getAverageEmigresPerMenage(filters, user),
        menageService.getPyramideAges(filters, user)
      ]);

      stats = {
        ...mainStats,
        ...populationStats,
        proportionAgricoles,
        averageEmigres,
        pyramideAges
      };

      // Stocker dans le cache
      statsCache[cacheKey] = stats;
      setTimeout(() => delete statsCache[cacheKey], 5 * 60 * 1000);
    }
    res.json(stats);
  } catch (err) {
    console.error('Erreur getStats:', err);
    res.status(500).json({ error: 'Erreur lors du calcul des statistiques.' });
  }
};

// Page Charts
exports.showCharts = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }

    const user = req.session.user;
    let filters = {
      region: req.query.region || null,
      departement: req.query.departement || null,
      commune: req.query.commune || null,
      zd: req.query.zd || null
    };

    // Initialisation des filtres selon le rôle
    filters = initializeFiltersForRole(user, filters);

    // Validation des filtres
    if (!hasAccessToFilters(user, filters)) {
      filters.region = getUserDefaultRegion(user);
      filters.departement = getUserDefaultDepartement(user);
      filters.commune = getUserDefaultCommune(user);
      filters.zd = null;
    }

    const cacheKey = getCacheKey(filters, user);

    let mainStats, populationStats, pyramideAges;

    if (chartsCache[cacheKey]) {
      ({ mainStats, populationStats, pyramideAges} = chartsCache[cacheKey]);
    } else {
      // Requêtes SQL lourdes en parallèle AVEC l'utilisateur
      [mainStats, populationStats, pyramideAges] = await Promise.all([
        menageService.getMainStats(filters, user),
        menageService.getPopulationStatsCombined(filters, user),
        menageService.getPyramideAges(filters, user)
      ]);

      // Stocker dans le cache
      chartsCache[cacheKey] = { mainStats, populationStats, pyramideAges };
      setTimeout(() => delete chartsCache[cacheKey], 5 * 60 * 1000);
    }

    // Sélects pour filtres AVEC restriction par rôle
    const [regions, departements, communes, zds] = await Promise.all([
      menageService.getRegions(user),
      menageService.getDepartements(filters.region, user),
      menageService.getCommunes(filters.departement, user),
      menageService.getZds(filters.commune, user)
    ]);

    const userFlags = {
      ...user,
      isGlobal: user.role === 'ROLE_GLOBAL',
      isRegional: user.role === 'ROLE_REGIONAL',
      isDepartemental: user.role === 'ROLE_DEPARTEMENTAL',
      isCommunal: user.role === 'ROLE_COMMUNAL',
      
      // Déterminer quels sélecteurs doivent être modifiables
      canChangeRegion: user.role === 'ROLE_GLOBAL',
      canChangeDepartement: ['ROLE_GLOBAL', 'ROLE_REGIONAL'].includes(user.role),
      canChangeCommune: ['ROLE_GLOBAL', 'ROLE_REGIONAL', 'ROLE_DEPARTEMENTAL'].includes(user.role),
      canChangeZD: true,
      
      // Valeurs présélectionnées
      preselectedRegion: getUserDefaultRegion(user),
      preselectedDepartement: getUserDefaultDepartement(user),
      preselectedCommune: getUserDefaultCommune(user)
    };

    res.render('pages/charts', {
      hommes: populationStats.hommes,
      femmes: populationStats.femmes,
      populationCarto: mainStats.cartographie,
      populationCollectee: mainStats.collectee,
      pyramideAges,
      selects: { 
        regions: prepareSelectOptions(regions, 'region', filters.region, user),
        departements: prepareSelectOptions(departements, 'departement', filters.departement, user),
        communes: prepareSelectOptions(communes, 'commune', filters.commune, user),
        zds: prepareSelectOptions(zds, 'zd', filters.zd, user)
      },
      filters,
      user: userFlags
    });
  } catch (err) {
    console.error('Erreur showCharts:', err);
    res.status(500).send('Erreur serveur');
  }
};


// ===== FONCTIONS HELPER =====

/**
 * Initialise les filtres selon le rôle de l'utilisateur
 * Pour les rôles non-globaux, on présélectionne automatiquement leur territoire
 */
function initializeFiltersForRole(user, filters) {
  if (!user) return filters;
  
  switch(user.role) {
    case 'ROLE_GLOBAL':
      // Pour le rôle global, on garde les filtres tels quels (peuvent être vides)
      return filters;
    
    case 'ROLE_REGIONAL':
      // Pour le rôle régional, on force la région et on garde les autres filtres
      return {
        region: filters.region || getUserDefaultRegion(user),
        departement: filters.departement,
        commune: filters.commune,
        zd: filters.zd
      };
    
    case 'ROLE_DEPARTEMENTAL':
      // Pour le rôle départemental, on force région et département
      return {
        region: filters.region || getUserDefaultRegion(user),
        departement: filters.departement || getUserDefaultDepartement(user),
        commune: filters.commune,
        zd: filters.zd
      };
    
    case 'ROLE_COMMUNAL':
      // Pour le rôle communal, on force région, département et commune
      return {
        region: filters.region || getUserDefaultRegion(user),
        departement: filters.departement || getUserDefaultDepartement(user),
        commune: filters.commune || getUserDefaultCommune(user),
        zd: filters.zd
      };
    
    default:
      return filters;
  }
}

/**
 * Vérifie si l'utilisateur a accès aux filtres demandés
 */
function hasAccessToFilters(user, filters) {
  if (!user) return false;
  
  switch(user.role) {
    case 'ROLE_GLOBAL':
      return true;
    
    case 'ROLE_REGIONAL':
      // Doit vérifier que la région demandée correspond à sa région
      if (filters.region && user.code && user.code.length >= 1) {
        return filters.region === user.code.substring(0, 1);
      }
      return true;
    
    case 'ROLE_DEPARTEMENTAL':
      // Doit vérifier que le département demandé correspond à son département
      if (filters.departement && user.code && user.code.length >= 3) {
        return filters.departement === user.code.substring(0, 3);
      }
      if (filters.region && user.code && user.code.length >= 1) {
        return filters.region === user.code.substring(0, 1);
      }
      return true;
    
    case 'ROLE_COMMUNAL':
      // Doit vérifier que la commune demandée correspond à sa commune
      if (filters.commune && user.code && user.code.length === 5) {
        return filters.commune === user.code;
      }
      if (filters.departement && user.code && user.code.length >= 3) {
        return filters.departement === user.code.substring(0, 3);
      }
      if (filters.region && user.code && user.code.length >= 1) {
        return filters.region === user.code.substring(0, 1);
      }
      return true;
    
    default:
      return false;
  }
}

function getUserDefaultRegion(user) {
  return (user.code && user.code.length >= 1) ? user.code.substring(0, 1) : null;
}

function getUserDefaultDepartement(user) {
  return (user.code && user.code.length >= 3) ? user.code.substring(0, 3) : null;
}

function getUserDefaultCommune(user) {
  return (user.code && user.code.length === 5) ? user.code : null;
}

/**
 * Prépare les options de sélecteurs selon le rôle et les filtres actuels
 */
function prepareSelectOptions(items, level, currentValue, user) {
  if (!items || items.length === 0) return [];
  
  // Pour les utilisateurs non-globaux, on peut forcer la sélection unique
  if (user.role !== 'ROLE_GLOBAL') {
    switch(level) {
      case 'region':
        if (user.code && user.code.length >= 1) {
          const regionCode = user.code.substring(0, 1);
          return items.filter(item => item.code_region === regionCode);
        }
        break;
      
      case 'departement':
        if (user.code && user.code.length >= 3) {
          const deptCode = user.code.substring(0, 3);
          return items.filter(item => item.code_departement === deptCode);
        }
        break;
      
      case 'commune':
        if (user.code && user.code.length === 5) {
          const communeCode = user.code;
          return items.filter(item => item.code_commune === communeCode);
        }
        break;
    }
  }
  
  return items;
}