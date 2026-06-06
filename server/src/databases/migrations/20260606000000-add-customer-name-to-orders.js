'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'customer_name', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'table_id',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'customer_name');
  },
};
