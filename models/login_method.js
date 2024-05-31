'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class login_method extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  login_method.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'login_method',
  });
  return login_method;
};