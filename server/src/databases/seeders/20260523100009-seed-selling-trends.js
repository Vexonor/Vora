'use strict';

/**
 * Seeder dummy snapshot prediksi untuk tabel `selling_trends`.
 *
 * Untuk SETIAP laporan penjualan (seluruh data historis), dibuat satu snapshot
 * prediksi "H-1" (generated_date = target_date - 1 hari) dengan nilai =
 * realisasi ± noise. Dengan begitu halaman "Akurasi Prediksi" menampilkan
 * perbandingan prediksi vs realisasi yang bermakna (MAPE/MAE/RMSE tidak nol).
 *
 * Catatan:
 * - generated_date sengaja < target_date agar lolos aturan pickFreshestForecasts
 *   (forecast dibuat SEBELUM hari yang diprediksi).
 * - Nilai realisasi diambil langsung dari selling_reports (seeder 100007),
 *   sehingga selalu sinkron apa pun angkanya.
 * - RNG deterministik (seeded) agar hasil konsisten tiap dijalankan.
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

function toDateStr(value) {
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const rand = mulberry32(20260713);

    // Ambil SEMUA realisasi dari selling_reports (satu snapshot per laporan).
    const reports = await queryInterface.sequelize.query(
      `SELECT date, gross_revenue, net_profit, total_transaction, total_items_sold
         FROM selling_reports
        WHERE deleted_at IS NULL
        ORDER BY date ASC`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    if (!reports.length) return;

    const now = new Date();
    const jitter = () => 1 + (rand() - 0.5) * 0.2;

    // Dedupe per target_date: jika ada beberapa laporan bertanggal sama,
    // cukup satu snapshot agar tidak melanggar unique (generated_date, target_date).
    const byTarget = new Map();
    for (const r of reports) {
      const target = new Date(r.date);
      const generated = new Date(target);
      generated.setDate(generated.getDate() - 1);

      byTarget.set(toDateStr(target), {
        generated_date: toDateStr(generated),
        target_date: toDateStr(target),
        gross_revenue: Math.round(Number(r.gross_revenue) * jitter()),
        net_profit: Math.round(Number(r.net_profit) * jitter()),
        total_transaction: Math.round(Number(r.total_transaction) * jitter()),
        total_items_sold: Math.round(Number(r.total_items_sold) * jitter()),
        created_at: now,
        updated_at: now,
      });
    }

    const rows = [...byTarget.values()];
    if (!rows.length) return;

    await queryInterface.bulkInsert('selling_trends', rows, {});
  },

  async down(queryInterface) {
    // Dev seeder: kosongkan tabel snapshot.
    await queryInterface.bulkDelete('selling_trends', {}, {});
  },
};
