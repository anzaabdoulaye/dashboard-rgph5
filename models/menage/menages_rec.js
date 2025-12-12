const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('menages_rec', {
    'menages_rec-id': {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    'level-1-id': {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type_d_entite: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ca10t: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ca11n: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ca11p: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    men_cm_current_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ca13lat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ca13lon: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_owner: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    en02: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    en03: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    en05: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    en06: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    men_taille_enum: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_type: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_adress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    men_tel: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    en11: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    en12lat_agent: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    en12lon_agent: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_responsable: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    de04: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_taille: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_exist: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_raison: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_raison_autre: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    men_status: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_close_date: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_close_date_sort: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_controle: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_date_controle: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_user_is_inside: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_raison_ouverture: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    men_first_distance: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'men_visit_date(1)': {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'men_visit_date(2)': {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'men_visit_date(3)': {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'men_visit_date(4)': {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'men_visit_date(5)': {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'men_visit_date(6)': {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'men_visit_date(7)': {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'men_visit_date(8)': {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'men_visit_date(9)': {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'men_visit_date(10)': {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'men_open_by(1)': {
      type: DataTypes.TEXT,
      allowNull: true
    },
    'men_open_by(2)': {
      type: DataTypes.TEXT,
      allowNull: true
    },
    'men_open_by(3)': {
      type: DataTypes.TEXT,
      allowNull: true
    },
    'men_open_by(4)': {
      type: DataTypes.TEXT,
      allowNull: true
    },
    'men_open_by(5)': {
      type: DataTypes.TEXT,
      allowNull: true
    },
    'men_open_by(6)': {
      type: DataTypes.TEXT,
      allowNull: true
    },
    'men_open_by(7)': {
      type: DataTypes.TEXT,
      allowNull: true
    },
    'men_open_by(8)': {
      type: DataTypes.TEXT,
      allowNull: true
    },
    'men_open_by(9)': {
      type: DataTypes.TEXT,
      allowNull: true
    },
    'men_open_by(10)': {
      type: DataTypes.TEXT,
      allowNull: true
    },
    'men_open_distance(1)': {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'men_open_distance(2)': {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'men_open_distance(3)': {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'men_open_distance(4)': {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'men_open_distance(5)': {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'men_open_distance(6)': {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'men_open_distance(7)': {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'men_open_distance(8)': {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'men_open_distance(9)': {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    'men_open_distance(10)': {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_is_relocate: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_old_lat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_old_lon: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_nb_residents: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_nb_resident_presents: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_nb_rp_h: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_nb_rp_f: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_nb_rp: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_nb_rph: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_nb_ra: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_nb_rah: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_nb_raf: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_nb_v: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_nb_vh: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_nb_vf: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    men_nb_rv: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nom_men_collectif: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'menages_rec',
    timestamps: false
  });
};
