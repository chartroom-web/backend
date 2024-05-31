'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user.init({
    id: DataTypes.INTEGER,
    email: DataTypes.STRING,
    password_hash: DataTypes.STRING,
    google_id: DataTypes.STRING,
    login_method: DataTypes.INTEGER,
    picture: DataTypes.STRING,
    is_email_verified: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};