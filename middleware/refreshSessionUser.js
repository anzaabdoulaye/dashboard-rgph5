// middleware/refreshSessionUser.js
const User = require('../models/User');
const { buildSessionUser } = require('../utils/sessionUserBuilder');

function isJsonRequest(req) {
    return req.xhr || req.headers.accept?.includes('application/json');
}

function destroyInvalidSession(req, res, statusCode, message) {
    if (!req.session) {
        if (isJsonRequest(req)) {
            return res.status(statusCode).json({ error: message });
        }
        return res.redirect('/auth/login');
    }

    return req.session.destroy(() => {
        if (isJsonRequest(req)) {
            return res.status(statusCode).json({ error: message });
        }
        return res.redirect('/auth/login');
    });
}

async function refreshSessionUser(req, res, next) {
    try {
        if (!req.session || !req.session.user || !req.session.user.id) {
            res.locals.user = null;
            return next();
        }

        const dbUser = await User.findByPk(req.session.user.id);

        if (!dbUser) {
            return destroyInvalidSession(
                req,
                res,
                401,
                'Session invalide. Utilisateur introuvable.'
            );
        }

        if (String(dbUser.statut) !== '1') {
            return destroyInvalidSession(
                req,
                res,
                403,
                'Compte désactivé.'
            );
        }

        const rebuiltSessionUser = buildSessionUser(dbUser);
        const previousSessionUser = JSON.stringify(req.session.user);
        const nextSessionUser = JSON.stringify(rebuiltSessionUser);

        req.session.user = rebuiltSessionUser;
        req.currentUser = dbUser;
        res.locals.user = rebuiltSessionUser;

        if (previousSessionUser !== nextSessionUser) {
            return req.session.save((saveErr) => {
                if (saveErr) {
                    console.error('Erreur save session refreshSessionUser:', saveErr);
                    return destroyInvalidSession(req, res, 401, 'Session invalide.');
                }
                return next();
            });
        }

        return next();
    } catch (error) {
        console.error('Erreur refreshSessionUser:', error);

        if (isJsonRequest(req)) {
            return res.status(500).json({
                error: 'Erreur lors du rechargement de la session.'
            });
        }

        return res.redirect('/auth/login');
    }
}

module.exports = refreshSessionUser;