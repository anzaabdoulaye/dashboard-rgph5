function normalizeRole(user) {
  if (user.role) return user.role;

  if (Array.isArray(user.roles) && user.roles.length > 0) {
    return user.roles[0];
  }

  if (typeof user.roles === 'string') {
    try {
      const parsed = JSON.parse(user.roles);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
    } catch (_) {
      return user.roles;
    }
  }

  return null;
}

function buildCodesFromUser(user, role) {
  const code = user.code || null;

  return {
    code,
    regionCode: code && code.length >= 1 ? code.substring(0, 1) : null,
    departementCode: code && code.length >= 3 ? code.substring(0, 3) : null,
    communeCode: code && code.length >= 5 ? code.substring(0, 5) : null,
    role
  };
}

function buildSessionUser(user) {
  const role = normalizeRole(user);
  const codes = buildCodesFromUser(user, role);

  return {
    id: user.id,
    username: user.username,
    nom: user.nom,
    prenom: user.prenom,
    statut: user.statut,
    firstConnect: !!user.firstConnect,

    role: codes.role,
    code: codes.code,
    regionCode: codes.regionCode,
    departementCode: codes.departementCode,
    communeCode: codes.communeCode,

    region_id: user.region_id || null,
    departement_id: user.departement_id || null,
    commune_id: user.commune_id || null
  };
}

module.exports = {
  buildSessionUser
};