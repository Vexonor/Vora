'use strict';
const bcrypt = require('bcrypt');
require('dotenv').config();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const password = process.env.CASHIER_PASSWORD || 'c';
    const hash = await bcrypt.hash(password, 10);

    await queryInterface.bulkInsert('users', [{
      username: 'Cashier',
      email: process.env.CASHIER_EMAIL || 'cashier@vora.com',
      password: hash,
      role: 0,
      created_at: now,
      updated_at: now,
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: process.env.CASHIER_EMAIL || 'cashier@vora.com'
    }, {});
  }
};
