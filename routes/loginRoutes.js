var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { buildSessionUser } = require('../utils/sessionUserBuilder');

/**
 * Petit helper pour créer la session puis rediriger une seule fois
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

/* GET /auth/force-change-password : Forcer le changement même si pas première connexion */
router.get('/force-change-password', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    req.session.user.firstConnect = true;
    return res.redirect('/auth/change-password');
});

/* GET /auth/change-password : Afficher le formulaire */
router.get('/change-password', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    if (!req.session.user.firstConnect) {
        return res.redirect('/users/');
    }

    return res.render('pages/changePassword', {
        title: 'Changer le mot de passe',
        layout: false,
        user: req.session.user
    });
});

/* POST /auth/change-password : Traiter le changement */
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

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.render('pages/changePassword', {
                title: 'Changer le mot de passe',
                layout: false,
                error: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
                user: req.session.user
            });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return req.session.destroy(() => res.redirect('/auth/login'));
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.update(
            {
                password: hashedPassword,
                firstConnect: false,
                passwordChangedAt: new Date()
            },
            { where: { id: userId } }
        );

        req.session.user.firstConnect = false;

        return res.render('pages/login', {
            title: 'Connexion',
            layout: false,
            success: 'Mot de passe changé avec succès ! Vous pouvez maintenant vous connecter.'
        });

    } catch (err) {
        console.error('Erreur changement mot de passe:', err);
        return res.render('pages/changePassword', {
            title: 'Changer le mot de passe',
            layout: false,
            error: 'Erreur lors du changement de mot de passe',
            user: req.session.user
        });
    }
});

/* GET /auth/login : afficher la page de connexion */
router.get('/login', (req, res) => {
    return res.render('pages/login', {
        title: 'Connexion',
        layout: false
    });
});

/* POST /auth/login : traiter le formulaire */
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
                error: 'Votre compte est désactivé. Contactez l\'administrateur.',
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
    req.session.destroy(() => {
        return res.redirect('/auth/login');
    });
});

module.exports = router;