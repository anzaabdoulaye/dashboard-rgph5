const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');
const Region = require('./Region');
const Departement = require('./Departement');
const Commune = require('./Commune');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  region_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Region,
      key: 'id',
    },
  },
  departement_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Departement,
      key: 'id',
    },
  },
  commune_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Commune,
      key: 'id',
    },
  },
  nom: {
    type: DataTypes.STRING(180),
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
  },
  roles: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  statut: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: '1', // Actif par défaut
  },
   firstConnect: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true, // true = première connexion, doit changer mdp
  },
  
  passwordChangedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'user',
  timestamps: false,

  hooks: {
    beforeCreate: async (user) => {
 
      if (!user.username && user.nom && user.prenom) {
        user.username = `${user.nom.charAt(0).toLowerCase()}${user.prenom.toLowerCase()}`;
      }

      if (!user.password) {
        user.password = '1234';
      }



       // Si password pas fourni → mettre 1234
      if (!user.password) user.password = '1234';

      // NE HASHER QUE SI NON HASHÉ
      if (!user.password.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }

      if (user.firstConnect === undefined) {
      user.firstConnect = true;
    }

      await generateUserCode(user);
    },

    beforeUpdate: async (user) => {

      if (user.changed('password')) {
      user.firstConnect = false;
      user.passwordChangedAt = new Date();
    }
    
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }

      // Regénération du code si certains champs changent
      if (user.changed('region_id') || user.changed('departement_id') ||
          user.changed('commune_id') || user.changed('roles')) {
        await generateUserCode(user);
      }
    },
  },
});

// Fonction pour générer le code utilisateur selon le rôle
async function generateUserCode(user) {
  const roles = user.roles || [];
  const role = Array.isArray(roles) ? roles[0] : roles;
  let code = null;

  try {
    switch (role) {
      case 'ROLE_REGIONAL': {
        if (user.region_id) {
          const region = await Region.findByPk(user.region_id);
          if (region) code = region.code;
        }
        break;
      }

      case 'ROLE_DEPARTEMENTAL': {
        if (user.departement_id) {
          const departement = await Departement.findByPk(user.departement_id);
          if (departement) code = departement.code;
        }
        break;
      }

      case 'ROLE_COMMUNAL': {
        if (user.commune_id) {
          const commune = await Commune.findByPk(user.commune_id);
          if (commune) code = commune.code;
        }
        break;
      }

      case 'ROLE_GLOBAL':
      case 'ROLE_ADMIN':
        code = 'GLOBAL';
        break;

      default:
        code = null;
        break;
    }

    user.code = code;
  } catch (error) {
    console.error('Erreur lors de la génération du code:', error);
    user.code = 'ERROR';
  }
}

// Associations
User.belongsTo(Region, { foreignKey: 'region_id' });
User.belongsTo(Departement, { foreignKey: 'departement_id' });
User.belongsTo(Commune, { foreignKey: 'commune_id' });

Region.hasMany(User, { foreignKey: 'region_id' });
Departement.hasMany(User, { foreignKey: 'departement_id' });
Commune.hasMany(User, { foreignKey: 'commune_id' });

module.exports = User;