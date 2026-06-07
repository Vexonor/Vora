'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'avatar_path', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'email',
    });
    await queryInterface.addColumn('users', 'avatar_url', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'avatar_path',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'avatar_url');
    await queryInterface.removeColumn('users', 'avatar_path');
  },
};
