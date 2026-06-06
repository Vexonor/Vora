'use strict';
const { QueryTypes } = require('sequelize');

/**
 * Stock status enum: 0=Habis, 1=Tersedia, 2=Menipis, 3=Tidak Aktif, 4=Menunggu Supplier
 * unit_id mengacu ke tabel units (di-resolve berdasarkan abbreviation).
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const units = await queryInterface.sequelize.query(
      'SELECT id, abbreviation FROM units',
      { type: QueryTypes.SELECT },
    );
    if (!units.length) {
      throw new Error('Seed units terlebih dahulu sebelum stocks.');
    }
    const unitId = (abbr) => {
      const u = units.find((x) => x.abbreviation === abbr);
      if (!u) throw new Error(`Unit "${abbr}" tidak ditemukan. Jalankan seeder units.`);
      return u.id;
    };

    const stocks = [
      { name: 'Beras', unit: 'kg', quantity: 50, minimum: 10, maximum: 100, status: 1 },
      { name: 'Ayam Potong', unit: 'kg', quantity: 30, minimum: 8, maximum: 60, status: 1 },
      { name: 'Telur Ayam', unit: 'pcs', quantity: 200, minimum: 50, maximum: 400, status: 1 },
      { name: 'Minyak Goreng', unit: 'L', quantity: 40, minimum: 10, maximum: 80, status: 1 },
      { name: 'Gula Pasir', unit: 'kg', quantity: 25, minimum: 5, maximum: 50, status: 1 },
      { name: 'Kopi Bubuk', unit: 'g', quantity: 5000, minimum: 1000, maximum: 10000, status: 1 },
      { name: 'Susu Cair', unit: 'ml', quantity: 8000, minimum: 2000, maximum: 15000, status: 1 },
      { name: 'Teh Celup', unit: 'pack', quantity: 30, minimum: 10, maximum: 60, status: 1 },
      { name: 'Kentang', unit: 'kg', quantity: 8, minimum: 10, maximum: 40, status: 2 }, // menipis
      { name: 'Cabai Merah', unit: 'kg', quantity: 0, minimum: 5, maximum: 20, status: 0 }, // habis
    ];

    await queryInterface.bulkInsert(
      'stocks',
      stocks.map((s) => ({
        unit_id: unitId(s.unit),
        name: s.name,
        status: s.status,
        quantity: s.quantity,
        minimum: s.minimum,
        maximum: s.maximum,
        created_at: now,
        updated_at: now,
      })),
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    const { Op } = Sequelize;
    const names = [
      'Beras', 'Ayam Potong', 'Telur Ayam', 'Minyak Goreng', 'Gula Pasir',
      'Kopi Bubuk', 'Susu Cair', 'Teh Celup', 'Kentang', 'Cabai Merah',
    ];
    await queryInterface.bulkDelete('stocks', { name: { [Op.in]: names } }, {});
  },
};
