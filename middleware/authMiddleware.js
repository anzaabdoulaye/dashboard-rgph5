module.exports = (req, res, next) => {
  if (!req.session || !req.session.user || !req.session.user.id) {
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    return res.redirect('/auth/login');
  }

  return next();
};