'use strict';
const bcrypt = require('bcrypt');
require('dotenv').config();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const password = process.env.ADMIN_PASSWORD || 'Admin123!';
    const hash = await bcrypt.hash(password, 10);

    await queryInterface.bulkInsert('users', [{
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: hash,
      roles: 1,
      created_at: now,
      updated_at: now,
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: process.env.ADMIN_EMAIL || 'admin@example.com'
    }, {});
  }
};
