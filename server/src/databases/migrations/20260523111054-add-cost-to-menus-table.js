'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('menus', 'cost', {
      type: Sequelize.DECIMAL(16, 3),
      allowNull: false,
      defaultValue: 0,
      after: 'price'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('menus', 'cost');
  }
};
