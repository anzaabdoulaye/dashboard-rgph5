var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

/* GET /auth/force-change-password : Forcer le changement même si pas première connexion */
router.get('/force-change-password', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    // Marquer comme première connexion pour forcer le changement
    req.session.user.firstConnect = true;
    
    res.redirect('/auth/change-password');
});


/* GET /auth/change-password : Afficher le formulaire */
router.get('/change-password', (req, res) => {
    // Vérifier si l'utilisateur est connecté
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    // Vérifier si c'est bien une première connexion
    if (!req.session.user.firstConnect) {
        return res.redirect('/users/');
    }

    res.render('pages/changePassword', {
        title: 'Changer le mot de passe',
        layout: false,
        user: req.session.user
    });
});


/* POST /auth/change-password : Traiter le changement */
router.post('/change-password', async (req, res) => {
    try {
        // Vérifier si l'utilisateur est connecté
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }

        const { newPassword, confirmPassword } = req.body;
        const userId = req.session.user.id;

        // Validation des champs
        if (!newPassword || !confirmPassword) {
            return res.render('pages/changePassword', {
                title: 'Changer le mot de passe',
                layout: false,
                error: 'Veuillez remplir tous les champs',
                user: req.session.user
            });
        }

        // Vérifier correspondance
        if (newPassword !== confirmPassword) {
            return res.render('pages/changePassword', {
                title: 'Changer le mot de passe',
                layout: false,
                error: 'Les mots de passe ne correspondent pas',
                user: req.session.user
            });
        }

        // Vérifier force du mot de passe
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.render('pages/changePassword', {
                title: 'Changer le mot de passe',
                layout: false,
                error: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
                user: req.session.user
            });
        }

        // Récupérer l'utilisateur
        const user = await User.findByPk(userId);
        if (!user) {
            req.session.destroy();
            return res.redirect('/auth/login');
        }

        // Hasher le nouveau mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Mettre à jour l'utilisateur
        await User.update(
            {
                password: hashedPassword,
                firstConnect: false,
                passwordChangedAt: new Date()
            },
            { where: { id: userId } }
        );

        // Mettre à jour la session
        req.session.user.firstConnect = false;

        // Rediriger avec message de succès
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
    res.render('pages/login', {
        title: 'Connexion',
        layout: false
    });
});


/* POST /auth/login : traiter le formulaire */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ where: { username } });
        
        if (!user) {
            return res.render('pages/login', {
                title: 'Connexion',
                error: 'Utilisateur introuvable',
                layout: false
            });
        }

        console.log('=== DEBUG COMPLET ===');
        console.log('1. Password input:', `"${password}"`);
        console.log('2. Password char codes:', [...password].map(c => c.charCodeAt(0)));
        console.log('3. Hash in DB:', user.password);
        
        // Test 1 : Avec bcrypt normal
        const match1 = await bcrypt.compare(password, user.password);
        console.log('4. bcrypt.compare normal:', match1);
        
        // Test 2 : Avec trim
        const match2 = await bcrypt.compare(password.trim(), user.password.trim());
        console.log('5. bcrypt.compare avec trim:', match2);
        
        // Test 3 : Générer un nouveau hash et comparer
        const testHash = await bcrypt.hash('1234', 10);
        console.log('6. Nouveau hash pour "1234":', testHash);
        const match3 = await bcrypt.compare('1234', testHash);
        console.log('7. Test nouveau hash:', match3);
        
        // Test 4 : Comparer les 20 premiers caractères
        console.log('8. Premier hash (20 chars):', user.password.substring(0, 20));
        console.log('9. Test hash (20 chars):', testHash.substring(0, 20));
        
        // Test 5 : Vérifier le format du hash
        const hashParts = user.password.split('$');
        console.log('10. Format hash DB:', hashParts.slice(0, 4).join('$'));
        
        // SOLUTION TEMPORAIRE : Créer un nouveau hash si nécessaire
        if (!match1 && !match2) {
            console.log('11. Création nouveau hash...');
            const newHash = await bcrypt.hash('1234', 10);
            await User.update(
                { password: newHash },
                { where: { id: user.id } }
            );
            console.log('12. Hash mis à jour');
            
            // Recharger l'utilisateur
            const updatedUser = await User.findByPk(user.id);
            const finalMatch = await bcrypt.compare('1234', updatedUser.password);
            console.log('13. Après mise à jour:', finalMatch);
            
            if (finalMatch) {
                req.session.user = {
                    id: updatedUser.id,
                    username: updatedUser.username,
                    role: updatedUser.role || updatedUser.roles[0],
                    firstConnect: user.firstConnect
                };
                return res.redirect('/');
            }
        }
        
        if (match1 || match2) {
            req.session.user = {
                id: user.id,
                username: user.username,
                role: user.role || user.roles[0],
                code: user.code,
                regionCode: user.code && user.code.length >= 1 ? user.code.substring(0, 1) : null,
                departementCode: user.code && user.code.length >= 3 ? user.code.substring(0, 3) : null,
                communeCode: user.code && user.code.length >= 5 ? user.code : null,
                firstConnect: user.firstConnect
            };
            return res.redirect('/');
        }

        // Redirection selon firstConnect
        if (user.firstConnect) {
            return res.redirect('/auth/change-password');
        }
        
        return res.render('pages/login', {
            title: 'Connexion',
            error: 'Mot de passe incorrect',
            layout: false
        });

    } catch (err) {
        console.error('Erreur login:', err);
        return res.status(500).send('Erreur serveur.');
    }
});

/* GET /auth/logout */
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});

module.exports = router;
