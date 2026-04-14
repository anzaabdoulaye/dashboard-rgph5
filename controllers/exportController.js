const exportService = require('../services/exportService');
const exportDatasets = require('../config/exportDatasets');

exports.index = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }

    const user = req.session.user;

    const datasets = Object.entries(exportDatasets).map(([key, value]) => ({
      key,
      label: value.label,
      formats: value.allowedFormats,
      filters: value.filters,
      columns: value.columns,
      defaultPreviewColumns: value.defaultPreviewColumns || value.columns
    }));

    res.render('pages/exports', {
      title: 'Téléchargements',
      datasets,
      user,
      currentPage: 'exports'
    });
  } catch (error) {
    next(error);
  }
};

exports.meta = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const meta = exportService.getDatasetMeta(req.query.dataset);

    res.json({
      success: true,
      ...meta
    });
  } catch (error) {
    next(error);
  }
};

exports.preview = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const user = req.session.user;
    const { dataset, columns } = req.query;

    const preview = await exportService.previewDataset({
      datasetKey: dataset,
      filters: req.query,
      user,
      columns
    });

    res.json({
      success: true,
      ...preview
    });
  } catch (error) {
    next(error);
  }
};

exports.download = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }

    const user = req.session.user;
    const { dataset, format = 'csv', columns } = req.query;

    const result = await exportService.exportDataset({
      datasetKey: dataset,
      format,
      filters: req.query,
      user,
      columns
    });

    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Content-Type', result.contentType);

    if (result.buffer) return res.send(result.buffer);
    if (result.content) return res.send(result.content);

    return res.status(500).send('Export invalide');
  } catch (error) {
    next(error);
  }
};