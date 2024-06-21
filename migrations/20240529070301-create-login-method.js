'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('login_methods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      }
    });
    await queryInterface.bulkInsert('login_methods', [
      { name: 'mail' },
      { name: 'google'},
      { name: 'temp'}
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('login_methods');
  }
};