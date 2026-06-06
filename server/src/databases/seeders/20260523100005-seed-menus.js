'use strict';

/**
 * Menu type enum: 1=Makanan, 2=Minuman Panas, 3=Minuman Dingin, 4=Cemilan
 * Menu status enum: 0=Tidak Aktif, 1=Tersedia, 2=Habis
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const menus = [
      // Makanan (type 1)
      { name: 'Nasi Goreng Spesial', type: 1, cost: 18000, price: 35000, description: 'Nasi goreng dengan ayam, telur, dan kerupuk.' },
      { name: 'Ayam Bakar Madu', type: 1, cost: 22000, price: 42000, description: 'Ayam bakar bumbu madu dengan lalapan.' },
      { name: 'Mie Goreng Jawa', type: 1, cost: 15000, price: 30000, description: 'Mie goreng khas Jawa dengan sayuran segar.' },
      { name: 'Sate Ayam', type: 1, cost: 20000, price: 38000, description: '10 tusuk sate ayam dengan bumbu kacang.' },
      { name: 'Soto Ayam', type: 1, cost: 14000, price: 28000, description: 'Soto ayam kuah bening dengan soun dan telur.' },
      { name: 'Ayam Geprek', type: 1, cost: 16000, price: 32000, description: 'Ayam geprek sambal dengan nasi hangat.' },
      // Minuman Panas (type 2)
      { name: 'Kopi Tubruk', type: 2, cost: 5000, price: 15000, description: 'Kopi hitam tubruk khas Nusantara.' },
      { name: 'Cappuccino', type: 2, cost: 8000, price: 25000, description: 'Espresso dengan foam susu lembut.' },
      { name: 'Teh Tarik', type: 2, cost: 6000, price: 18000, description: 'Teh susu tarik hangat.' },
      // Minuman Dingin (type 3)
      { name: 'Es Teh Manis', type: 3, cost: 3000, price: 10000, description: 'Teh manis dingin menyegarkan.' },
      { name: 'Es Jeruk', type: 3, cost: 5000, price: 15000, description: 'Perasan jeruk segar dengan es.' },
      { name: 'Iced Latte', type: 3, cost: 9000, price: 28000, description: 'Espresso dengan susu dingin.' },
      // Cemilan (type 4)
      { name: 'Kentang Goreng', type: 4, cost: 7000, price: 18000, description: 'Kentang goreng renyah dengan saus.' },
      { name: 'Pisang Goreng', type: 4, cost: 5000, price: 15000, description: 'Pisang goreng crispy dengan topping.' },
      { name: 'Roti Bakar Cokelat', type: 4, cost: 6000, price: 16000, description: 'Roti bakar isi cokelat dan keju.' },
    ];

    const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    await queryInterface.bulkInsert(
      'menus',
      menus.map((m) => ({
        name: m.name,
        cost: m.cost,
        price: m.price,
        status: 1,
        type: m.type,
        description: m.description,
        image_path: `seeds/menus/${slug(m.name)}.jpg`,
        image_url: `https://placehold.co/600x400/056A68/FFFFFF?text=${encodeURIComponent(m.name)}`,
        created_at: now,
        updated_at: now,
      })),
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    const { Op } = Sequelize;
    const names = [
      'Nasi Goreng Spesial', 'Ayam Bakar Madu', 'Mie Goreng Jawa', 'Sate Ayam',
      'Soto Ayam', 'Ayam Geprek', 'Kopi Tubruk', 'Cappuccino', 'Teh Tarik',
      'Es Teh Manis', 'Es Jeruk', 'Iced Latte', 'Kentang Goreng',
      'Pisang Goreng', 'Roti Bakar Cokelat',
    ];
    await queryInterface.bulkDelete('menus', { name: { [Op.in]: names } }, {});
  },
};
