module.exports = function checkFirstConnect(req, res, next) {
    // Si l'utilisateur n'est pas connecté, next()
    if (!req.session.user) {
        return next();
    }

    // Si première connexion et pas déjà sur la page de changement
    if (req.session.user.firstConnect && 
        !req.path.startsWith('/auth/change-password') &&
        req.path !== '/auth/logout') {
        return res.redirect('/auth/change-password');
    }

    next();
};