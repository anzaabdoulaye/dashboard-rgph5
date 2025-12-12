const bcrypt = require('bcrypt');
const User = require('../models/User');

// Afficher le formulaire d'inscription
exports.showRegisterForm = (req, res) => {
    res.render('pages/registerForm', {
        title: 'Inscription utilisateur',
        users: [] // Assurez-vous de passer les utilisateurs si nécessaire
    });
};

// Liste des utilisateurs
exports.listUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.render('pages/registerForm', {
            title: 'Gestion des utilisateurs',
            users
        });
    } catch (error) {
        req.session.error = 'Erreur lors du chargement des utilisateurs : ' + error.message;
        res.redirect('/users');
    }
};

// Ajouter un utilisateur (via le formulaire modal)
exports.addUser = async (req, res) => {
    try {
        const { nom, prenom, email, password, roles, region_id, departement_id, commune_id } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            req.session.error = 'Cet email est déjà utilisé.';
            return res.redirect('/users');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            nom,
            prenom,
            email,
            password: hashedPassword,
            roles: Array.isArray(roles) ? roles : [roles],
            region_id: region_id || null,
            departement_id: departement_id || null,
            commune_id: commune_id || null
        });

        req.session.success = 'Utilisateur créé avec succès !';
        res.redirect('/users');
    } catch (error) {
        req.session.error = 'Erreur lors de la création de l\'utilisateur : ' + error.message;
        res.redirect('/users');
    }
};

// Modifier un utilisateur
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, prenom, email, code, roles, region_id, departement_id, commune_id } = req.body;
        
        // Récupérer l'utilisateur actuel
        const user = await User.findByPk(id);
        if (!user) {
            req.session.error = 'Utilisateur non trouvé';
            return res.redirect('/users');
        }
        
        // Mettre à jour les champs UNIQUEMENT s'ils ont changé
        // Cela permet au hook beforeUpdate de détecter les changements
        if (nom !== user.nom) user.nom = nom;
        if (prenom !== user.prenom) user.prenom = prenom;
        if (email !== user.email) user.email = email;
        if (code !== user.code) user.code = code;
        
        // Convertir les rôles en tableau pour la comparaison
        const newRoles = Array.isArray(roles) ? roles : [roles];
        const currentRoles = Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles || '[]');
        
        // Vérifier si les rôles ont changé
        const rolesChanged = JSON.stringify(newRoles.sort()) !== JSON.stringify(currentRoles.sort());
        if (rolesChanged) {
            user.roles = newRoles;
        }
        
        // Mettre à jour les localisations
        const regionChanged = parseInt(region_id) !== user.region_id;
        const departementChanged = parseInt(departement_id) !== user.departement_id;
        const communeChanged = parseInt(commune_id) !== user.commune_id;
        
        if (regionChanged) user.region_id = region_id || null;
        if (departementChanged) user.departement_id = departement_id || null;
        if (communeChanged) user.commune_id = commune_id || null;
        
        // Sauvegarder les modifications
        await user.save();
        
        req.session.success = 'Utilisateur modifié avec succès !';
        res.redirect('/users');
        
    } catch (error) {
        console.error('Erreur modification utilisateur:', error);
        req.session.error = 'Erreur lors de la mise à jour : ' + error.message;
        res.redirect('/users');
    }
};


// Désactiver (supprimer logiquement) un utilisateur
exports.desactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Mise à jour du statut à 0 (désactivé)
    const [updated] = await User.update(
      { statut: '0' },
      { where: { id } }
    );

    if (updated === 0) {
      req.session.error = "Utilisateur introuvable ou déjà désactivé.";
      return res.redirect('/users');
    }

    req.session.success = "Utilisateur désactivé avec succès !";
    res.redirect('/users');
  } catch (error) {
    console.error("Erreur lors de la désactivation :", error);
    req.session.error = "Erreur lors de la désactivation : " + error.message;
    res.redirect('/users');
  }
};

// Traiter l'inscription (ancienne méthode - gardez pour compatibilité)
exports.register = async (req, res) => {
    try {
        const { nom, prenom, email, password, roles, region_id, departement_id, commune_id, username } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            req.session.error = 'Cet email est déjà utilisé.';
            return res.redirect('/users');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            nom,
            prenom,
            email,
            username,
            password: hashedPassword,
            roles: Array.isArray(roles) ? roles : [roles],
            region_id: region_id || null,
            departement_id: departement_id || null,
            commune_id: commune_id || null
        });

        req.session.success = 'Utilisateur créé avec succès !';
        return res.redirect('/users');

    } catch (error) {
        req.session.error = 'Erreur lors de la création de l\'utilisateur : ' + error.message;
        res.redirect('/users');
    }
};
// Rechercher des utilisateurs
exports.searchUsers = async (req, res) => {
    try {
        const { search } = req.query;
        
        let users;
        if (search && search.trim() !== '') {
            // Recherche par nom, prénom ou email
            const { Op } = require('sequelize');
            users = await User.findAll({
                where: {
                    [Op.or]: [
                        { nom: { [Op.like]: `%${search}%` } },
                        { prenom: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } }
                    ]
                }
            });
        } else {
            // Si pas de recherche, retourner tous les utilisateurs
            users = await User.findAll();
        }
        
        res.render('pages/registerForm', { 
            title: 'Gestion des utilisateurs', 
            users,
            searchTerm: search || ''
        });
        
    } catch (error) {
        req.session.error = 'Erreur lors de la recherche : ' + error.message;
        res.redirect('/users');
    }
};

// Réinitialiser le mot de passe d’un utilisateur à "1234"
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params; // ID de l'utilisateur à réinitialiser

    // Générer le hash du mot de passe par défaut
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('1234', salt);

    // Mise à jour du mot de passe
    const [updated] = await User.update(
      { password: hashedPassword },
      { where: { id } }
    );

    if (updated === 0) {
      req.session.error = "Utilisateur introuvable pour la réinitialisation.";
      return res.redirect('/users');
    }

    req.session.success = "Le mot de passe a été réinitialisé à '1234'.";
    res.redirect('/users');
  } catch (error) {
    console.error("Erreur lors de la réinitialisation :", error);
    req.session.error = "Erreur lors de la réinitialisation : " + error.message;
    res.redirect('/users');
  }
};