'use strict';
const bcrypt = require('bcrypt');
require('dotenv').config();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const password = process.env.KITCHEN_PASSWORD || 'Kitchen@1234';
    const hash = await bcrypt.hash(password, 10);

    await queryInterface.bulkInsert('users', [{
      username: 'Kitchen',
      email: process.env.KITCHEN_EMAIL || 'kitchen@vora.com',
      password: hash,
      role: 1,
      created_at: now,
      updated_at: now,
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: process.env.KITCHEN_EMAIL || 'kitchen@vora.com'
    }, {});
  }
};
