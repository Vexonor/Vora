'use strict';
const bcrypt = require('bcrypt');
require('dotenv').config();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const password = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!';
    const hash = await bcrypt.hash(password, 10);

    await queryInterface.bulkInsert('users', [{
      username: 'Super Admin',
      email: process.env.SUPERADMIN_EMAIL || 'superadmin@example.com',
      password: hash,
      role: 2, 
      created_at: now,
      updated_at: now,
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: process.env.SUPERADMIN_EMAIL || 'superadmin@example.com'
    }, {});
  }
};
