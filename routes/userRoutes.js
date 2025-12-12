const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const requireAuth = require('../middleware/authMiddleware');

// Route pour traiter le formulaire
router.post('/register',requireAuth, userController.register);

router.get('/',requireAuth, userController.listUsers);

router.post('/edit/:id',requireAuth, userController.updateUser);
router.get('/desactivate/:id',requireAuth, userController.desactivateUser);

// Route pour la recherche
router.get('/search',requireAuth, userController.searchUsers);

function isAdmin(req, res, next) {
  if (req.user && req.user.roles.includes('ROLE_ADMIN')) return next();
  return res.status(403).send('Accès refusé');
}

router.post('/users/:id/reset-password', isAdmin,requireAuth, userController.resetPassword);

module.exports = router;
