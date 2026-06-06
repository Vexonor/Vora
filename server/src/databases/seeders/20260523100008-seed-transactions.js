'use strict';
const { QueryTypes } = require('sequelize');

/**
 * Seeder transaksi (orders + order_items + payments) untuk ~10 hari terakhir,
 * supaya halaman kasir, dapur, dan dashboard memiliki data contoh.
 *
 * Catatan FK: butuh tabel `menus` dan `tables` sudah terisi.
 * Order status enum: 0=Menunggu, 1=Diproses, 2=Siap, 3=Selesai, 4=Dibatalkan
 * Payment type enum: 0=Online, 1=Offline
 *
 * Setiap payment ditandai midtrans_transaction_id = 'SEED-<orderId>' agar
 * fungsi down() hanya menghapus data hasil seeder ini, bukan data asli.
 */

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const sequelize = queryInterface.sequelize;

    const menus = await sequelize.query('SELECT id, price FROM menus', {
      type: QueryTypes.SELECT,
    });
    const tables = await sequelize.query('SELECT id FROM tables', {
      type: QueryTypes.SELECT,
    });
    if (!menus.length || !tables.length) {
      throw new Error('Seed menus dan tables terlebih dahulu sebelum transactions.');
    }

    const rand = mulberry32(987654);
    const pick = (arr) => arr[Math.floor(rand() * arr.length)];
    const DAYS = 10;
    const today = new Date();

    for (let i = DAYS - 1; i >= 0; i--) {
      const ordersToday = 2 + Math.floor(rand() * 3); // 2-4 order/hari

      for (let o = 0; o < ordersToday; o++) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        day.setHours(10 + Math.floor(rand() * 11), Math.floor(rand() * 60), 0, 0); // 10:00-20:59

        const table = pick(tables);

        // 1-3 item unik per order
        const itemCount = 1 + Math.floor(rand() * 3);
        const used = new Set();
        const items = [];
        for (let c = 0; c < itemCount; c++) {
          let menu = pick(menus);
          let guard = 0;
          while (used.has(menu.id) && guard++ < 5) menu = pick(menus);
          used.add(menu.id);
          const quantity = 1 + Math.floor(rand() * 3);
          const price = Number(menu.price);
          items.push({ menu_id: menu.id, quantity, price, total_price: price * quantity });
        }
        const totalPrice = items.reduce((s, x) => s + x.total_price, 0);

        // Hari terbaru: status campur (ada yang masih berjalan). Lainnya: selesai.
        const status = i === 0 ? pick([0, 1, 2, 3]) : 3;

        const insertOrder = await sequelize.query(
          'INSERT INTO `orders` (`table_id`,`status`,`total_price`,`created_at`) VALUES (:t,:s,:tp,:c)',
          {
            replacements: { t: table.id, s: status, tp: totalPrice, c: day },
            type: QueryTypes.INSERT,
          },
        );
        const orderId = insertOrder[0];

        await queryInterface.bulkInsert(
          'order_items',
          items.map((x) => ({
            menu_id: x.menu_id,
            order_id: orderId,
            quantity: x.quantity,
            price: x.price,
            total_price: x.total_price,
            created_at: day,
          })),
          {},
        );

        // Order selesai/siap dianggap sudah dibayar
        const isPaid = status === 3 || status === 2;
        const type = rand() > 0.4 ? 1 : 0; // mayoritas offline (tunai)

        await sequelize.query(
          'INSERT INTO `payments` ' +
            '(`order_id`,`midtrans_transaction_id`,`total`,`paid`,`type`,`qr_image_url`,`payment_status`,`snap_token`,`snap_redirect_url`,`created_at`,`updated_at`) ' +
            'VALUES (:oid,:mid,:total,:paid,:type,:qr,:ps,:st,:sr,:c,:c)',
          {
            replacements: {
              oid: orderId,
              mid: `SEED-${orderId}`,
              total: totalPrice,
              paid: isPaid ? totalPrice : 0,
              type,
              qr: null,
              ps: isPaid ? 'settlement' : 'pending',
              st: null,
              sr: null,
              c: day,
            },
            type: QueryTypes.INSERT,
          },
        );
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const { Op } = Sequelize;
    const seeded = await queryInterface.sequelize.query(
      "SELECT order_id FROM payments WHERE midtrans_transaction_id LIKE 'SEED-%'",
      { type: QueryTypes.SELECT },
    );
    const ids = seeded.map((r) => r.order_id);
    if (!ids.length) return;

    await queryInterface.bulkDelete('order_items', { order_id: { [Op.in]: ids } }, {});
    await queryInterface.bulkDelete('payments', { order_id: { [Op.in]: ids } }, {});
    await queryInterface.bulkDelete('orders', { id: { [Op.in]: ids } }, {});
  },
};
