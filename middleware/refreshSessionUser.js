// middleware/refreshSessionUser.js

const User = require('../models/User');
const { buildSessionUser } = require('../utils/sessionUserBuilder');

async function refreshSessionUser(req, res, next) {
  try {
    if (!req.session || !req.session.user || !req.session.user.id) {
      return next();
    }

    const dbUser = await User.findByPk(req.session.user.id);

    if (!dbUser) {
      return req.session.destroy(() => {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
          return res.status(401).json({
            error: 'Session invalide. Utilisateur introuvable.'
          });
        }

        return res.redirect('/auth/login');
      });
    }

    if (String(dbUser.statut) !== '1') {
      return req.session.destroy(() => {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
          return res.status(403).json({
            error: 'Compte désactivé.'
          });
        }

        return res.redirect('/auth/login');
      });
    }

    req.session.user = buildSessionUser(dbUser);
    req.currentUser = dbUser;
    res.locals.user = req.session.user;

    return next();
  } catch (error) {
    console.error('Erreur refreshSessionUser:', error);

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({
        error: 'Erreur lors du rechargement de la session.'
      });
    }

    return res.redirect('/auth/login');
  }
}

module.exports = refreshSessionUser;