const sequelize = require('../config/database');
const ExcelJS = require('exceljs');
const exportDatasets = require('../config/exportDatasets');
const exportQueryBuilder = require('./exportQueryBuilder');

function escapeCsvValue(value) {
  if (value === null || value === undefined) return '';
  const stringValue = String(value).replace(/"/g, '""');
  return `"${stringValue}"`;
}

function toCsv(rows, columns) {
  const header = columns.map(escapeCsvValue).join(',');
  const lines = rows.map((row) =>
    columns.map((col) => escapeCsvValue(row[col])).join(',')
  );
  return [header, ...lines].join('\n');
}

async function toExcel(rows, columns, sheetName = 'Export') {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(String(sheetName || 'Export').substring(0, 31));

  worksheet.columns = columns.map((col) => ({
    header: col,
    key: col,
    width: 20
  }));

  rows.forEach((row) => {
    const normalizedRow = {};
    columns.forEach((col) => {
      normalizedRow[col] = row[col] ?? '';
    });
    worksheet.addRow(normalizedRow);
  });

  return workbook.xlsx.writeBuffer();
}

function getUserRoles(user) {
  if (!user) return [];
  if (Array.isArray(user.roles) && user.roles.length > 0) return user.roles;
  if (typeof user.role === 'string' && user.role.trim() !== '') return [user.role];
  return [];
}

function hasAccess(datasetConfig, user) {
  const roles = getUserRoles(user);
  return datasetConfig.roles.some((role) => roles.includes(role));
}

function normalizeRequestedColumns(rawColumns) {
  if (!rawColumns) return [];

  if (Array.isArray(rawColumns)) {
    return rawColumns.filter(Boolean);
  }

  if (typeof rawColumns === 'string') {
    return rawColumns
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
  }

  return [];
}

async function fetchRows({ datasetConfig, filters, user, selectedColumns, limit }) {
  const queryConfig = exportQueryBuilder.buildQuery({
    datasetConfig,
    filters,
    user,
    selectedColumns,
    limit
  });

  const [rows] = await sequelize.query(queryConfig.sql, {
    replacements: queryConfig.params
  });

  return {
    rows,
    selectedColumns: queryConfig.selectedColumns
  };
}

function getDatasetMeta(datasetKey) {
  const datasetConfig = exportDatasets[datasetKey];

  if (!datasetConfig) {
    throw new Error('Dataset non autorisé');
  }

  return {
    key: datasetKey,
    label: datasetConfig.label,
    columns: datasetConfig.columns,
    defaultPreviewColumns: datasetConfig.defaultPreviewColumns || datasetConfig.columns,
    allowedFormats: datasetConfig.allowedFormats,
    filters: datasetConfig.filters || []
  };
}

async function previewDataset({ datasetKey, filters, user, columns }) {
  const datasetConfig = exportDatasets[datasetKey];

  if (!datasetConfig) {
    throw new Error('Dataset non autorisé');
  }

  if (!hasAccess(datasetConfig, user)) {
    throw new Error('Accès refusé');
  }

  const selectedColumns = normalizeRequestedColumns(columns);

  const { rows, selectedColumns: effectiveColumns } = await fetchRows({
    datasetConfig,
    filters,
    user,
    selectedColumns,
    limit: datasetConfig.previewLimit || 20
  });

  return {
    totalRows: rows.length,
    columns: effectiveColumns,
    sample: rows
  };
}

async function exportDataset({ datasetKey, format, filters, user, columns }) {
  const datasetConfig = exportDatasets[datasetKey];

  if (!datasetConfig) {
    throw new Error('Dataset non autorisé');
  }

  if (!datasetConfig.allowedFormats.includes(format)) {
    throw new Error('Format non autorisé');
  }

  if (!hasAccess(datasetConfig, user)) {
    throw new Error('Accès refusé');
  }

  const selectedColumns = normalizeRequestedColumns(columns);

  const { rows, selectedColumns: effectiveColumns } = await fetchRows({
    datasetConfig,
    filters,
    user,
    selectedColumns,
    limit: datasetConfig.exportLimit || 50000
  });

  const datePart = new Date().toISOString().slice(0, 10);

  if (format === 'json') {
    return {
      filename: `${datasetKey}_${datePart}.json`,
      contentType: 'application/json; charset=utf-8',
      content: JSON.stringify(rows, null, 2)
    };
  }

  if (format === 'csv') {
    const csv = toCsv(rows, effectiveColumns);
    return {
      filename: `${datasetKey}_${datePart}.csv`,
      contentType: 'text/csv; charset=utf-8',
      content: csv
    };
  }

  if (format === 'excel') {
    const buffer = await toExcel(rows, effectiveColumns, datasetConfig.label);
    return {
      filename: `${datasetKey}_${datePart}.xlsx`,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer
    };
  }

  throw new Error('Format non pris en charge');
}

module.exports = {
  getDatasetMeta,
  previewDataset,
  exportDataset
};