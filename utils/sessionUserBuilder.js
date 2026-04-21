function normalizeRole(user) {
    if (user.role) {
        return String(user.role).trim();
    }

    if (Array.isArray(user.roles) && user.roles.length > 0) {
        return String(user.roles[0]).trim();
    }

    if (typeof user.roles === 'string') {
        try {
            const parsed = JSON.parse(user.roles);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return String(parsed[0]).trim();
            }
        } catch (_) {
            return String(user.roles).trim();
        }
    }

    return null;
}

function normalizeCode(code) {
    if (code === null || code === undefined) {
        return null;
    }

    const normalized = String(code).trim();
    return normalized.length ? normalized : null;
}

function buildCodesFromUser(user, role) {
    const code = normalizeCode(user.code);

    return {
        role,
        code,
        regionCode: code && code.length >= 1 ? code.substring(0, 1) : null,
        departementCode: code && code.length >= 3 ? code.substring(0, 3) : null,
        communeCode: code && code.length >= 5 ? code.substring(0, 5) : null
    };
}

function buildSessionUser(user) {
    const role = normalizeRole(user);
    const codes = buildCodesFromUser(user, role);

    return {
        id: user.id,
        username: user.username ? String(user.username).trim() : null,
        nom: user.nom ? String(user.nom).trim() : null,
        prenom: user.prenom ? String(user.prenom).trim() : null,
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

module.exports = { buildSessionUser };