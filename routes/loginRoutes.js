var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { buildSessionUser } = require('../utils/sessionUserBuilder');

/**
 * Crée une session utilisateur propre et persistée avant redirection.
 */
function createUserSession(req, res, user) {
    req.session.regenerate((err) => {
        if (err) {
            console.error('Erreur regenerate session:', err);
            return res.status(500).send('Erreur serveur.');
        }

        try {
            req.session.user = buildSessionUser(user);

            req.session.save((saveErr) => {
                if (saveErr) {
                    console.error('Erreur save session:', saveErr);
                    return res.status(500).send('Erreur serveur.');
                }

                if (req.session.user.firstConnect) {
                    return res.redirect('/auth/change-password');
                }

                return res.redirect('/');
            });
        } catch (sessionBuildError) {
            console.error('Erreur buildSessionUser:', sessionBuildError);
            return res.status(500).send('Erreur lors de la création de la session.');
        }
    });
}

/**
 * Détruit proprement la session puis redirige.
 */
function destroySession(req, callback) {
    if (!req.session) {
        return callback();
    }

    req.session.destroy((err) => {
        if (err) {
            console.error('Erreur destroy session:', err);
            return callback(err);
        }
        return callback();
    });
}

/* GET /auth/force-change-password */
router.get('/force-change-password', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    req.session.user.firstConnect = true;

    req.session.save((err) => {
        if (err) {
            console.error('Erreur save session force-change-password:', err);
            return res.status(500).send('Erreur serveur.');
        }
        return res.redirect('/auth/change-password');
    });
});

/* GET /auth/change-password */
router.get('/change-password', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    if (!req.session.user.firstConnect) {
        return res.redirect('/');
    }

    return res.render('pages/changePassword', {
        title: 'Changer le mot de passe',
        layout: false,
        user: req.session.user
    });
});

/* POST /auth/change-password */
router.post('/change-password', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }

        const { newPassword, confirmPassword } = req.body;
        const userId = req.session.user.id;

        if (!newPassword || !confirmPassword) {
            return res.render('pages/changePassword', {
                title: 'Changer le mot de passe',
                layout: false,
                error: 'Veuillez remplir tous les champs',
                user: req.session.user
            });
        }

        if (newPassword !== confirmPassword) {
            return res.render('pages/changePassword', {
                title: 'Changer le mot de passe',
                layout: false,
                error: 'Les mots de passe ne correspondent pas',
                user: req.session.user
            });
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.render('pages/changePassword', {
                title: 'Changer le mot de passe',
                layout: false,
                error: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
                user: req.session.user
            });
        }

        const dbUser = await User.findByPk(userId);

        if (!dbUser) {
            return destroySession(req, () => res.redirect('/auth/login'));
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await dbUser.update({
            password: hashedPassword,
            firstConnect: false,
            passwordChangedAt: new Date()
        });

        // Important :
        // on recharge l'utilisateur à jour puis on recrée une session complète
        const freshUser = await User.findByPk(userId);

        if (!freshUser) {
            return destroySession(req, () => res.redirect('/auth/login'));
        }

        return createUserSession(req, res, freshUser);
    } catch (err) {
        console.error('Erreur changement mot de passe:', err);

        return res.render('pages/changePassword', {
            title: 'Changer le mot de passe',
            layout: false,
            error: 'Erreur lors du changement de mot de passe',
            user: req.session.user || null
        });
    }
});

/* GET /auth/login */
router.get('/login', (req, res) => {
    if (req.session && req.session.user && !req.session.user.firstConnect) {
        return res.redirect('/');
    }

    return res.render('pages/login', {
        title: 'Connexion',
        layout: false
    });
});

/* POST /auth/login */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.render('pages/login', {
                title: 'Connexion',
                error: 'Veuillez renseigner le nom d’utilisateur et le mot de passe',
                layout: false
            });
        }

        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.render('pages/login', {
                title: 'Connexion',
                error: 'Utilisateur introuvable',
                layout: false
            });
        }

        if (user.statut !== '1' && user.statut !== 1) {
            return res.render('pages/login', {
                title: 'Connexion',
                error: 'Votre compte est désactivé. Contactez l’administrateur.',
                layout: false
            });
        }

        const rawPassword = String(password);
        const dbHash = String(user.password || '');

        let passwordMatches = false;

        try {
            passwordMatches = await bcrypt.compare(rawPassword, dbHash);
        } catch (bcryptError) {
            console.error('Erreur bcrypt.compare:', bcryptError);
            passwordMatches = false;
        }

        if (!passwordMatches) {
            const trimmedInput = rawPassword.trim();
            const trimmedHash = dbHash.trim();

            if (trimmedInput !== rawPassword || trimmedHash !== dbHash) {
                try {
                    passwordMatches = await bcrypt.compare(trimmedInput, trimmedHash);
                } catch (trimmedBcryptError) {
                    console.error('Erreur bcrypt.compare trim:', trimmedBcryptError);
                    passwordMatches = false;
                }
            }
        }

        if (!passwordMatches) {
            return res.render('pages/login', {
                title: 'Connexion',
                error: 'Mot de passe incorrect',
                layout: false
            });
        }

        return createUserSession(req, res, user);
    } catch (err) {
        console.error('Erreur login:', err);
        return res.status(500).send('Erreur serveur.');
    }
});

/* GET /auth/logout */
router.get('/logout', (req, res) => {
    return destroySession(req, () => res.redirect('/auth/login'));
});

module.exports = router;