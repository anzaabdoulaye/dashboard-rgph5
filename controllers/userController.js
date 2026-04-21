const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const User = require('../models/User');

// Helper commun pour la liste paginée
async function renderUsersPage(req, res) {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim();

    const where = {};

    if (search) {
        where[Op.or] = [
            { nom: { [Op.like]: `%${search}%` } },
            { prenom: { [Op.like]: `%${search}%` } },
            { username: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
        ];
    }

    const { count, rows } = await User.findAndCountAll({
        where,
        order: [['id', 'DESC']],
        limit,
        offset
    });

    const totalPages = Math.max(Math.ceil(count / limit), 1);

    return res.render('pages/registerForm', {
        title: 'Gestion des utilisateurs',
        users: rows,
        user: req.session.user,
        success: req.session.success || null,
        error: req.session.error || null,
        currentPage: page,
        totalPages,
        totalUsers: count,
        limit,
        search
    });
}

// Afficher le formulaire d'inscription
exports.showRegisterForm = async (req, res) => {
    try {
        return await renderUsersPage(req, res);
    } catch (error) {
        req.session.error = 'Erreur lors du chargement des utilisateurs : ' + error.message;
        return res.redirect('/users');
    }
};

// Liste des utilisateurs
exports.listUsers = async (req, res) => {
    try {
        return await renderUsersPage(req, res);
    } catch (error) {
        req.session.error = 'Erreur lors du chargement des utilisateurs : ' + error.message;
        return res.redirect('/users');
    }
};

// Ajouter un utilisateur
exports.addUser = async (req, res) => {
    try {
        const { nom, prenom, email, roles, region_id, departement_id, commune_id } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            req.session.error = 'Cet email est déjà utilisé.';
            return res.redirect('/users');
        }

        await User.create({
            nom,
            prenom,
            email,
            password: '1234', // mot de passe par défaut forcé côté serveur
            roles: Array.isArray(roles) ? roles : [roles],
            region_id: region_id || null,
            departement_id: departement_id || null,
            commune_id: commune_id || null,
            firstConnect: true
        });

        req.session.success = 'Utilisateur créé avec succès ! Mot de passe initial : 1234';
        return res.redirect('/users');
    } catch (error) {
        console.error('Erreur lors de la création de l’utilisateur :', error);
        req.session.error = 'Erreur lors de la création de l\'utilisateur : ' + error.message;
        return res.redirect('/users');
    }
};

// Modifier un utilisateur
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, prenom, email, code, roles, region_id, departement_id, commune_id } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            req.session.error = 'Utilisateur non trouvé';
            return res.redirect('/users');
        }

        if (nom !== user.nom) user.nom = nom;
        if (prenom !== user.prenom) user.prenom = prenom;
        if (email !== user.email) user.email = email;
        if (code !== user.code) user.code = code;

        const newRoles = Array.isArray(roles) ? roles : [roles];
        const currentRoles = Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles || '[]');

        const rolesChanged =
            JSON.stringify([...newRoles].sort()) !== JSON.stringify([...currentRoles].sort());

        if (rolesChanged) {
            user.roles = newRoles;
        }

        const parsedRegionId = region_id ? parseInt(region_id, 10) : null;
        const parsedDepartementId = departement_id ? parseInt(departement_id, 10) : null;
        const parsedCommuneId = commune_id ? parseInt(commune_id, 10) : null;

        if (parsedRegionId !== user.region_id) user.region_id = parsedRegionId;
        if (parsedDepartementId !== user.departement_id) user.departement_id = parsedDepartementId;
        if (parsedCommuneId !== user.commune_id) user.commune_id = parsedCommuneId;

        await user.save();

        req.session.success = 'Utilisateur modifié avec succès !';
        return res.redirect('/users');
    } catch (error) {
        console.error('Erreur modification utilisateur:', error);
        req.session.error = 'Erreur lors de la mise à jour : ' + error.message;
        return res.redirect('/users');
    }
};

// Désactiver
exports.desactivateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const [updated] = await User.update(
            { statut: '0' },
            { where: { id } }
        );

        if (updated === 0) {
            req.session.error = "Utilisateur introuvable ou déjà désactivé.";
            return res.redirect('/users');
        }

        req.session.success = "Utilisateur désactivé avec succès !";
        return res.redirect('/users');
    } catch (error) {
        console.error("Erreur lors de la désactivation :", error);
        req.session.error = "Erreur lors de la désactivation : " + error.message;
        return res.redirect('/users');
    }
};

// Réactiver
exports.activateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const [updated] = await User.update(
            { statut: '1' },
            { where: { id } }
        );

        if (updated === 0) {
            req.session.error = "Utilisateur introuvable ou déjà activé.";
            return res.redirect('/users');
        }

        req.session.success = "Utilisateur réactivé avec succès !";
        return res.redirect('/users');
    } catch (error) {
        console.error("Erreur lors de l'activation :", error);
        req.session.error = "Erreur lors de la réactivation : " + error.message;
        return res.redirect('/users');
    }
};

// Ancienne méthode compatibilité
exports.register = async (req, res) => {
    try {
        const { nom, prenom, email, roles, region_id, departement_id, commune_id, username } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            req.session.error = 'Cet email est déjà utilisé.';
            return res.redirect('/users');
        }

        await User.create({
            nom,
            prenom,
            email,
            username,
            password: '1234',
            roles: Array.isArray(roles) ? roles : [roles],
            region_id: region_id || null,
            departement_id: departement_id || null,
            commune_id: commune_id || null,
            firstConnect: true
        });

        req.session.success = 'Utilisateur créé avec succès ! Mot de passe initial : 1234';
        return res.redirect('/users');

    } catch (error) {
        console.error('Erreur lors de la création de l’utilisateur :', error);
        req.session.error = 'Erreur lors de la création de l\'utilisateur : ' + error.message;
        return res.redirect('/users');
    }
};

// Recherche utilisateurs
exports.searchUsers = async (req, res) => {
    try {
        return await renderUsersPage(req, res);
    } catch (error) {
        req.session.error = 'Erreur lors de la recherche : ' + error.message;
        return res.redirect('/users');
    }
};

// Réinitialiser mot de passe
exports.resetPassword = async (req, res) => {
    try {
        const { id } = req.params;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('1234', salt);

        const [updated] = await User.update(
            {
                password: hashedPassword,
                firstConnect: '1'
            },
            { where: { id } }
        );

        if (updated === 0) {
            req.session.error = "Utilisateur introuvable pour la réinitialisation.";
            return res.redirect('/users');
        }

        req.session.success = "Le mot de passe a été réinitialisé à '1234'.";
        return res.redirect('/users');
    } catch (error) {
        console.error("Erreur lors de la réinitialisation :", error);
        req.session.error = "Erreur lors de la réinitialisation : " + error.message;
        return res.redirect('/users');
    }
};