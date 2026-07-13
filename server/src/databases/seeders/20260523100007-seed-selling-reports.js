'use strict';

/**
 * Seeder data historis penjualan harian (90 hari terakhir) untuk melatih &
 * mengevaluasi model prediksi AI (Random Forest Regression).
 *
 * Pola yang dibangun secara sengaja agar model punya sinyal yang bisa dipelajari
 * dan metrik evaluasi (RMSE/MAE/R²) menjadi bermakna:
 *   - Tren naik perlahan sepanjang 90 hari (bisnis bertumbuh)
 *   - Musiman mingguan: akhir pekan (Sabtu/Minggu) lebih ramai, Jumat sedang
 *   - Noise acak ±15% + sesekali lonjakan/penurunan (event / hari sepi)
 *
 * RNG dibuat deterministik (seeded) agar hasil seed konsisten setiap dijalankan.
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
    const rand = mulberry32(20260523);
    const DAYS = 100;
    // Jumlah laporan TERBARU yang sengaja dibiarkan tanpa modal operasional
    // (operational_cost = NULL) untuk mendemokan banner "belum diisi modal".
    const UNFILLED_RECENT_DAYS = 2;

    const today = new Date();
    today.setHours(12, 0, 0, 0); // siang hari, hindari edge-case timezone

    const rows = [];

    for (let i = DAYS - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const dow = date.getDay(); // 0=Minggu ... 6=Sabtu
      const isWeekend = dow === 0 || dow === 6;
      const isFriday = dow === 5;

      // Tren: bertambah perlahan seiring waktu (index 0 = paling lama)
      const dayIndex = DAYS - 1 - i;
      const trend = dayIndex * 0.25; // hingga ~22 transaksi ekstra di akhir periode

      let baseTx = 40 + trend;
      if (isWeekend) baseTx += 28;
      else if (isFriday) baseTx += 14;

      // Noise ±15%
      const noise = 1 + (rand() - 0.5) * 0.3;
      let totalTransaction = Math.max(8, Math.round(baseTx * noise));

      // Lonjakan / penurunan sesekali
      const spike = rand();
      if (spike > 0.96) totalTransaction = Math.round(totalTransaction * 1.4);
      else if (spike < 0.04) totalTransaction = Math.round(totalTransaction * 0.6);

      // Rata-rata item per transaksi 2.2 - 3.0
      const itemsPerTx = 2.2 + rand() * 0.8;
      const totalItemsSold = Math.round(totalTransaction * itemsPerTx);

      // Rata-rata nilai transaksi Rp 38.000 - 50.000
      const avgTicket = 38000 + rand() * 12000;
      const grossRevenue = Math.round(totalTransaction * avgTicket);

      // HPP 55% - 63% dari pendapatan
      const costRatio = 0.55 + rand() * 0.08;
      const unitCost = Math.round(grossRevenue * costRatio);

      // Laba bersih dasar 26% - 34% dari pendapatan (sisanya opex)
      const baseNetProfit = Math.round(grossRevenue * (0.26 + rand() * 0.08));

      // Laporan terbaru (i kecil = paling baru) dibiarkan tanpa modal operasional.
      // Untuk laporan terisi: operational_cost = sisa opex, net_profit tetap.
      // Untuk laporan kosong : operational_cost = NULL, net_profit = gross - HPP
      //   (opex dianggap 0), persis seperti generate() otomatis yang belum diisi.
      const isUnfilled = i < UNFILLED_RECENT_DAYS;
      const operationalCost = isUnfilled ? null : grossRevenue - unitCost - baseNetProfit;
      const netProfit = isUnfilled ? grossRevenue - unitCost : baseNetProfit;

      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');

      rows.push({
        title: `Laporan Penjualan ${y}-${m}-${d}`,
        date,
        total_transaction: totalTransaction,
        total_items_sold: totalItemsSold,
        unit_cost: unitCost,
        operational_cost: operationalCost,
        gross_revenue: grossRevenue,
        net_profit: netProfit,
        created_at: date,
        updated_at: date,
      });
    }

    await queryInterface.bulkInsert('selling_reports', rows, {});
  },

  async down(queryInterface, Sequelize) {
    const { Op } = Sequelize;
    await queryInterface.bulkDelete(
      'selling_reports',
      { title: { [Op.like]: 'Laporan Penjualan %' } },
      {},
    );
  },
};
