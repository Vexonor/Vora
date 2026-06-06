'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const TOTAL_TABLES = 12;

    const rows = Array.from({ length: TOTAL_TABLES }, (_, i) => ({
      number: i + 1,
      created_at: now,
      updated_at: now,
    }));

    await queryInterface.bulkInsert('tables', rows, {});
  },

  async down(queryInterface, Sequelize) {
    const { Op } = Sequelize;
    await queryInterface.bulkDelete(
      'tables',
      { number: { [Op.between]: [1, 12] } },
      {},
    );
  },
};
