function hasColumn(datasetConfig, columnName) {
  return Array.isArray(datasetConfig.columns) && datasetConfig.columns.includes(columnName);
}

function getUserRegion(user) {
  return user?.region_id ?? user?.regionId ?? user?.region ?? user?.code_region ?? null;
}

function getUserDepartement(user) {
  return user?.departement_id ?? user?.departementId ?? user?.departement ?? user?.code_departement ?? null;
}

function getUserCommune(user) {
  return user?.commune_id ?? user?.communeId ?? user?.commune ?? user?.code_commune ?? null;
}

function getUserZd(user) {
  return user?.zd_id ?? user?.zdId ?? user?.zd ?? user?.code_zd ?? null;
}

function getFilterColumn(datasetConfig, logicalFilterName) {
  const filterColumns = datasetConfig.filterColumns || {};
  return filterColumns[logicalFilterName] || null;
}

function normalizeSelectedColumns(selectedColumns, datasetConfig) {
  if (!Array.isArray(selectedColumns) || selectedColumns.length === 0) {
    return datasetConfig.defaultPreviewColumns?.length
      ? datasetConfig.defaultPreviewColumns
      : datasetConfig.columns;
  }

  const safeColumns = selectedColumns.filter((col) => hasColumn(datasetConfig, col));

  if (safeColumns.length === 0) {
    return datasetConfig.defaultPreviewColumns?.length
      ? datasetConfig.defaultPreviewColumns
      : datasetConfig.columns;
  }

  return safeColumns;
}

function applyGeographicRestrictions({ where, params, user, datasetConfig }) {
  if (!user) return;

  const roles = Array.isArray(user.roles)
    ? user.roles
    : [user.role].filter(Boolean);

  if (roles.includes('ROLE_GLOBAL')) {
    return;
  }

  const regionColumn = getFilterColumn(datasetConfig, 'region');
  const departementColumn = getFilterColumn(datasetConfig, 'departement');
  const communeColumn = getFilterColumn(datasetConfig, 'commune');
  const zdColumn = getFilterColumn(datasetConfig, 'zd');

  const userRegion = getUserRegion(user);
  const userDepartement = getUserDepartement(user);
  const userCommune = getUserCommune(user);
  const userZd = getUserZd(user);

  if (roles.includes('ROLE_REGIONAL') && userRegion && regionColumn && hasColumn(datasetConfig, regionColumn)) {
    where.push(`\`${regionColumn}\` = :user_region`);
    params.user_region = userRegion;
  }

  if (roles.includes('ROLE_DEPARTEMENTAL') && userDepartement && departementColumn && hasColumn(datasetConfig, departementColumn)) {
    where.push(`\`${departementColumn}\` = :user_departement`);
    params.user_departement = userDepartement;
  }

  if (roles.includes('ROLE_COMMUNAL') && userCommune && communeColumn && hasColumn(datasetConfig, communeColumn)) {
    where.push(`\`${communeColumn}\` = :user_commune`);
    params.user_commune = userCommune;
  }

  if (roles.includes('ROLE_ZD') && userZd && zdColumn && hasColumn(datasetConfig, zdColumn)) {
    where.push(`\`${zdColumn}\` = :user_zd`);
    params.user_zd = userZd;
  }
}

function applyRequestedFilters({ where, params, filters, datasetConfig }) {
  const allowedFilters = datasetConfig.filters || [];

  if (allowedFilters.includes('region') && filters.region) {
    const column = getFilterColumn(datasetConfig, 'region');
    if (column && hasColumn(datasetConfig, column)) {
      where.push(`\`${column}\` = :region`);
      params.region = filters.region;
    }
  }

  if (allowedFilters.includes('departement') && filters.departement) {
    const column = getFilterColumn(datasetConfig, 'departement');
    if (column && hasColumn(datasetConfig, column)) {
      where.push(`\`${column}\` = :departement`);
      params.departement = filters.departement;
    }
  }

  if (allowedFilters.includes('commune') && filters.commune) {
    const column = getFilterColumn(datasetConfig, 'commune');
    if (column && hasColumn(datasetConfig, column)) {
      where.push(`\`${column}\` = :commune`);
      params.commune = filters.commune;
    }
  }

  if (allowedFilters.includes('zd') && filters.zd) {
    const column = getFilterColumn(datasetConfig, 'zd');
    if (column && hasColumn(datasetConfig, column)) {
      where.push(`\`${column}\` = :zd`);
      params.zd = filters.zd;
    }
  }
}

exports.buildQuery = ({
  datasetConfig,
  filters = {},
  user,
  selectedColumns = null,
  limit = null
}) => {
  if (!datasetConfig || !datasetConfig.table || !Array.isArray(datasetConfig.columns)) {
    throw new Error('Configuration dataset invalide');
  }

  const effectiveColumns = normalizeSelectedColumns(selectedColumns, datasetConfig);

  const columnsSql = effectiveColumns
    .map((col) => `\`${col}\``)
    .join(', ');

  const tableSql = `\`${datasetConfig.table}\``;
  const where = [];
  const params = {};

  applyGeographicRestrictions({ where, params, user, datasetConfig });
  applyRequestedFilters({ where, params, filters, datasetConfig });

  let sql = `SELECT ${columnsSql} FROM ${tableSql}`;

  if (where.length > 0) {
    sql += ` WHERE ${where.join(' AND ')}`;
  }

  const finalLimit = Number.isInteger(limit) && limit > 0
    ? limit
    : (datasetConfig.exportLimit || 50000);

  sql += ` LIMIT ${finalLimit}`;

  return {
    sql,
    params,
    selectedColumns: effectiveColumns
  };
};