// controllers/dashboardController.js
// Utiliser le service optimisé avec Redis cache
const menageService = require('../services/menageServiceUltraFast');
const fs = require('fs');
const path = require('path');
function deriveRole(user) {
  const role = user?.role || null;
  console.log('[deriveRole] role =', role);
  return role;
}

function getUserDefaultRegion(user) {
  if (!user) {
    console.log('[getUserDefaultRegion] user absent');
    return null;
  }

  let value = null;
  let source = 'none';

  if (user.regionCode) {
    value = String(user.regionCode);
    source = 'regionCode';
  } else if (user.code && String(user.code).length >= 1) {
    value = String(user.code).substring(0, 1);
    source = 'code.substring(0,1)';
  }

  console.log('[getUserDefaultRegion]', {
    userId: user.id || null,
    username: user.username || null,
    role: user.role || null,
    code: user.code || null,
    regionCode: user.regionCode || null,
    result: value,
    source
  });

  return value;
}

function getUserDefaultDepartement(user) {
  if (!user) {
    console.log('[getUserDefaultDepartement] user absent');
    return null;
  }

  let value = null;
  let source = 'none';

  if (user.departementCode) {
    value = String(user.departementCode);
    source = 'departementCode';
  } else if (user.code && String(user.code).length >= 3) {
    value = String(user.code).substring(0, 3);
    source = 'code.substring(0,3)';
  }

  console.log('[getUserDefaultDepartement]', {
    userId: user.id || null,
    username: user.username || null,
    role: user.role || null,
    code: user.code || null,
    departementCode: user.departementCode || null,
    result: value,
    source
  });

  return value;
}

function getUserDefaultCommune(user) {
  if (!user) {
    console.log('[getUserDefaultCommune] user absent');
    return null;
  }

  let value = null;
  let source = 'none';

  if (user.communeCode) {
    value = String(user.communeCode);
    source = 'communeCode';
  } else if (user.code && String(user.code).length >= 5) {
    value = String(user.code).substring(0, 5);
    source = 'code.substring(0,5)';
  }

  console.log('[getUserDefaultCommune]', {
    userId: user.id || null,
    username: user.username || null,
    role: user.role || null,
    code: user.code || null,
    communeCode: user.communeCode || null,
    result: value,
    source
  });

  return value;
}

function initializeFiltersForRole(user, filters) {
  const role = deriveRole(user);

  const nextFilters = {
    region: filters.region || null,
    departement: filters.departement || null,
    commune: filters.commune || null,
    zd: filters.zd || null
  };

  console.log('[initializeFiltersForRole] BEFORE', {
    role,
    inputFilters: filters,
    sessionUser: {
      id: user?.id || null,
      username: user?.username || null,
      role: user?.role || null,
      code: user?.code || null,
      regionCode: user?.regionCode || null,
      departementCode: user?.departementCode || null,
      communeCode: user?.communeCode || null
    }
  });

  if (role === 'ROLE_REGIONAL') {
    nextFilters.region = getUserDefaultRegion(user);
  }

  if (role === 'ROLE_DEPARTEMENTAL') {
    nextFilters.region = getUserDefaultRegion(user);
    nextFilters.departement = getUserDefaultDepartement(user);
  }

  if (role === 'ROLE_COMMUNAL') {
    nextFilters.region = getUserDefaultRegion(user);
    nextFilters.departement = getUserDefaultDepartement(user);
    nextFilters.commune = getUserDefaultCommune(user);
  }

  console.log('[initializeFiltersForRole] AFTER', {
    role,
    resultFilters: nextFilters
  });

  return nextFilters;
}

function hasAccessToFilters(user, filters) {
  const role = deriveRole(user);

  if (!role) {
    console.log('[hasAccessToFilters] REFUS: role absent', { filters });
    return false;
  }

  if (role === 'ROLE_GLOBAL' || role === 'ROLE_ADMIN') {
    console.log('[hasAccessToFilters] OK global/admin', { role, filters });
    return true;
  }

  const allowedRegion = getUserDefaultRegion(user);
  const allowedDepartement = getUserDefaultDepartement(user);
  const allowedCommune = getUserDefaultCommune(user);

  console.log('[hasAccessToFilters] CHECK', {
    role,
    requested: filters,
    allowed: {
      region: allowedRegion,
      departement: allowedDepartement,
      commune: allowedCommune
    }
  });

  if (role === 'ROLE_REGIONAL') {
    const ok = !filters.region || String(filters.region) === String(allowedRegion);
    console.log('[hasAccessToFilters] ROLE_REGIONAL', { ok });
    return ok;
  }

  if (role === 'ROLE_DEPARTEMENTAL') {
    if (filters.region && String(filters.region) !== String(allowedRegion)) {
      console.log('[hasAccessToFilters] REFUS départemental sur region', {
        requested: filters.region,
        allowed: allowedRegion
      });
      return false;
    }

    if (filters.departement && String(filters.departement) !== String(allowedDepartement)) {
      console.log('[hasAccessToFilters] REFUS départemental sur departement', {
        requested: filters.departement,
        allowed: allowedDepartement
      });
      return false;
    }

    console.log('[hasAccessToFilters] OK ROLE_DEPARTEMENTAL');
    return true;
  }

  if (role === 'ROLE_COMMUNAL') {
    if (filters.region && String(filters.region) !== String(allowedRegion)) {
      console.log('[hasAccessToFilters] REFUS communal sur region', {
        requested: filters.region,
        allowed: allowedRegion
      });
      return false;
    }

    if (filters.departement && String(filters.departement) !== String(allowedDepartement)) {
      console.log('[hasAccessToFilters] REFUS communal sur departement', {
        requested: filters.departement,
        allowed: allowedDepartement
      });
      return false;
    }

    if (filters.commune && String(filters.commune) !== String(allowedCommune)) {
      console.log('[hasAccessToFilters] REFUS communal sur commune', {
        requested: filters.commune,
        allowed: allowedCommune
      });
      return false;
    }

    console.log('[hasAccessToFilters] OK ROLE_COMMUNAL');
    return true;
  }

  console.log('[hasAccessToFilters] REFUS final par défaut', { role, filters });
  return false;
}

function normalizeFilterValue(value) {
    if (value === null || value === undefined) {
        return null;
    }
    const trimmed = String(value).trim();
    return trimmed === '' ? null : trimmed;
}

// Nouvelle fonction pour nettoyer l'objet filtres
function cleanFilters(filters) {
    const cleaned = {};
    for (const [key, value] of Object.entries(filters)) {
        const normalized = normalizeFilterValue(value);
        if (normalized !== null) {
            cleaned[key] = normalized;
        }
    }
    return cleaned;
}

// Cache simple en mémoire pour stats (expire au bout de 5 minutes)
const statsCache = {};
const chartsCache = {};

// Générer une clé unique pour le cache selon les filtres ET l'utilisateur
function getCacheKey(filters, user = null) {
  const userKey = user ? `${user.id}_${user.role}` : 'nouser';
  
  // 💡 ÉTAPE 1 : Nettoyer les filtres ici aussi pour assurer la cohérence
  const cleanedFilters = cleanFilters(filters);
  
  // Pour ROLE_GLOBAL sans filtres, créer une clé spécifique "national"
  const isGlobalView = user && user.role === 'ROLE_GLOBAL' && 
    !cleanedFilters.region && !cleanedFilters.departement && !cleanedFilters.commune && !cleanedFilters.zd;
    
  if (isGlobalView) {
    return `global:national:${userKey}`;
  }
  
  // 💡 ÉTAPE 2 : Générer la clé à partir des filtres nettoyés
  const filterKey = Object.entries(cleanedFilters) // Utilisation de cleanedFilters
    // Note: Plus besoin de filtrer les null/undefined/'' car cleanFilters le fait déjà
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('_') || 'all';
  
  return `filters:${userKey}:${filterKey}`;
}

// Page Dashboard
exports.showDashboard = async (req, res) => {
  try {
    // 1. Vérifier que l'utilisateur est connecté
    if (!req.session || !req.session.user) {
      return res.redirect('/auth/login');
    }

    const user = req.session.user;

    console.log('================ SHOW DASHBOARD ================');
console.log('[showDashboard] session user =', {
  id: user?.id || null,
  username: user?.username || null,
  nom: user?.nom || null,
  prenom: user?.prenom || null,
  role: user?.role || null,
  code: user?.code || null,
  regionCode: user?.regionCode || null,
  departementCode: user?.departementCode || null,
  communeCode: user?.communeCode || null,
  region_id: user?.region_id || null,
  departement_id: user?.departement_id || null,
  commune_id: user?.commune_id || null
});
console.log('[showDashboard] raw query =', req.query);

    // 2. Vérifier que le rôle est bien disponible
    if (!user.role) {
      return req.session.destroy(() => res.redirect('/auth/login'));
    }

    // 3. Récupérer les filtres de la requête
    let filters = {
      region: req.query.region || null,
      departement: req.query.departement || null,
      commune: req.query.commune || null,
      zd: req.query.zd || null
    };

    // 4. Initialiser les filtres selon le rôle
    filters = initializeFiltersForRole(user, filters);

    console.log('[showDashboard] filters after initialize =', filters);

    // 5. Sécuriser l'accès aux filtres
    if (!hasAccessToFilters(user, filters)) {
      console.log('[showDashboard] accès refusé, réinitialisation des filtres');
      filters = {
        region: getUserDefaultRegion(user),
        departement: getUserDefaultDepartement(user),
        commune: getUserDefaultCommune(user),
        zd: null
      };
    }

    // 6. Sécuriser les cas où un utilisateur territorial perdrait un niveau de filtre
    if (user.role === 'ROLE_DEPARTEMENTAL') {
      filters.region = getUserDefaultRegion(user);
      filters.departement = getUserDefaultDepartement(user);

      // commune reste libre si l'utilisateur filtre à l'intérieur de son département
      if (filters.commune && !String(filters.commune).startsWith(String(filters.departement))) {
        filters.commune = null;
      }
    }

    if (user.role === 'ROLE_COMMUNAL') {
      filters.region = getUserDefaultRegion(user);
      filters.departement = getUserDefaultDepartement(user);
      filters.commune = getUserDefaultCommune(user);
    }

    

    // 7. Préparer la clé de cache
    const cacheKey = getCacheKey(filters, user);

    let mainStats;
    let populationStats;
    let proportionAgricoles;
    let averageEmigres;

    if (statsCache[cacheKey]) {
      ({
        mainStats,
        populationStats,
        proportionAgricoles,
        averageEmigres
      } = statsCache[cacheKey]);

      console.log(`📦 Stats chargées depuis le cache mémoire (clé: ${cacheKey})`);
    } else {
      // Pour ROLE_GLOBAL sans filtre explicite : vue nationale
      const filtersForQuery =
        user.role === 'ROLE_GLOBAL'
          ? {
              region: null,
              departement: null,
              commune: null,
              zd: null
            }
          : filters;

      [mainStats, populationStats, proportionAgricoles, averageEmigres] =
        await Promise.all([
          menageService.getMainStats(filtersForQuery, user),
          menageService.getPopulationStatsCombined(filtersForQuery, user),
          menageService.getProportionMenagesAgricoles(filtersForQuery, user),
          menageService.getAverageEmigresPerMenage(filtersForQuery, user)
        ]);

      statsCache[cacheKey] = {
        mainStats,
        populationStats,
        proportionAgricoles,
        averageEmigres
      };

      setTimeout(() => {
        delete statsCache[cacheKey];
      }, 5 * 60 * 1000);
    }

    // 8. Charger les listes de filtres selon le rôle et les filtres déjà sécurisés
    const [regions, departements, communes, zds] = await Promise.all([
      menageService.getRegions(user),
      menageService.getDepartements(filters.region, user),
      menageService.getCommunes(filters.departement, user),
      menageService.getZds(filters.commune, user)
    ]);

    // 9. Préparer les indicateurs utilisateur pour la vue
    const userFlags = {
      ...user,

      role: user.role,

      isGlobal: user.role === 'ROLE_GLOBAL',
      isRegional: user.role === 'ROLE_REGIONAL',
      isDepartemental: user.role === 'ROLE_DEPARTEMENTAL',
      isCommunal: user.role === 'ROLE_COMMUNAL',

      canChangeRegion: user.role === 'ROLE_GLOBAL',
      canChangeDepartement: ['ROLE_GLOBAL', 'ROLE_REGIONAL'].includes(user.role),
      canChangeCommune: ['ROLE_GLOBAL', 'ROLE_REGIONAL', 'ROLE_DEPARTEMENTAL'].includes(user.role),
      canChangeZD: true,

      preselectedRegion: getUserDefaultRegion(user),
      preselectedDepartement: getUserDefaultDepartement(user),
      preselectedCommune: getUserDefaultCommune(user),

      defaultRegion: getUserDefaultRegion(user),
      defaultDepartement: getUserDefaultDepartement(user),
      defaultCommune: getUserDefaultCommune(user)
    };

    // 10. Préparer les données pour la vue
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

    return res.render('pages/dashboard', viewData);
  } catch (err) {
    console.error('Erreur showDashboard:', err);
    return res.status(500).send('Erreur serveur');
  }
};

// GET /stats (API JSON)
exports.getStats = async (req, res) => {
  try {
    const user = req.session.user;
    
    // 1. Gestion du cache-buster client (_cb, _t)
    // Si le client demande un rafraîchissement forcé, on peut ignorer le cache ici (optionnel)
    
    // 2. Initialiser et nettoyer les filtres
    let filters = {
      region: req.query.region,
      departement: req.query.departement,
      commune: req.query.commune,
      zd: req.query.zd
    };
    let cleanedFilters = cleanFilters(filters);
    const finalFilters = initializeFiltersForRole(user, cleanedFilters);

    if (!hasAccessToFilters(user, finalFilters)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const cacheKey = getCacheKey(finalFilters, user);
    let stats;

    // 3. VÉRIFICATION ROBUSTE DU CACHE
    // On vérifie si le cache existe ET s'il est complet (contient pyramideAges)
    // C'est crucial car showDashboard peut avoir rempli le cache partiellement (sans pyramide)
    const cachedData = statsCache[cacheKey];
    
    if (cachedData && cachedData.pyramideAges && cachedData.populationStats) {
      console.log(`📦 Cache HIT (API Stats) - Clé: ${cacheKey}`);
      stats = cachedData;
    } else {
      console.log(`🔄 Cache MISS ou INCOMPLET (Recalcul total) - Clé: ${cacheKey}`);
      
      const [mainStats, populationStats, proportionAgricoles, averageEmigres, pyramideAges, regionStats] = await Promise.all([
        menageService.getMainStats(finalFilters, user),
        menageService.getPopulationStatsCombined(finalFilters, user),
        menageService.getProportionMenagesAgricoles(finalFilters, user),
        menageService.getAverageEmigresPerMenage(finalFilters, user),
        menageService.getPyramideAges(finalFilters, user),
        menageService.getPopulationByRegion()
      ]);

      stats = {
        mainStats,
        populationStats,
        proportionAgricoles,
        averageEmigres,
        pyramideAges,
        regionStats
      };

      // Mise à jour du cache
      statsCache[cacheKey] = stats;
      // Expiration 5 min
      setTimeout(() => { 
          if(statsCache[cacheKey]) delete statsCache[cacheKey]; 
      }, 5 * 60 * 1000); 
    }
    
    res.json(stats);

  } catch (err) {
    console.error('❌ Erreur getStats:', err);
    res.status(500).json({ error: 'Erreur serveur lors du calcul des statistiques.' });
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
      [mainStats, populationStats, pyramideAges, regionStats] = await Promise.all([
        menageService.getMainStats(filters, user),
        menageService.getPopulationStatsCombined(filters, user),
        menageService.getPyramideAges(filters, user),
        menageService.getPopulationByRegion()
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
      regionStats,
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

exports.dashboard = (req, res, next) => {
  try {
    const regionsPath = path.join(__dirname, '../geoJSON/RegionNiger.geojson');
    const departementsPath = path.join(__dirname, '../geoJSON/DepartementNiger.geojson');

    const regionsGeoJSON = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));
    const departementsGeoJSON = JSON.parse(fs.readFileSync(departementsPath, 'utf8'));

    res.render('pages/', {
      regions: regionsGeoJSON,
      departements: departementsGeoJSON
    });
  } catch (err) {
    next(err);
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