'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const units = [
      { name: 'Kilogram', abbreviation: 'kg' },
      { name: 'Gram', abbreviation: 'g' },
      { name: 'Liter', abbreviation: 'L' },
      { name: 'Mililiter', abbreviation: 'ml' },
      { name: 'Pieces', abbreviation: 'pcs' },
      { name: 'Pack', abbreviation: 'pack' },
      { name: 'Botol', abbreviation: 'btl' },
    ];

    await queryInterface.bulkInsert(
      'units',
      units.map((u) => ({ ...u, created_at: now, updated_at: now })),
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    const { Op } = Sequelize;
    await queryInterface.bulkDelete(
      'units',
      { abbreviation: { [Op.in]: ['kg', 'g', 'L', 'ml', 'pcs', 'pack', 'btl'] } },
      {},
    );
  },
};
