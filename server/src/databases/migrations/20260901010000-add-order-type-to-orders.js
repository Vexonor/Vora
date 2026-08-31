'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'orders',
        'order_type',
        {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: 0,
          after: 'table_id',
        },
        { transaction },
      );

      // Take Away tidak punya meja. FK ke `tables` tetap dipertahankan —
      // MySQL mengizinkan NULL pada kolom ber-FK.
      await queryInterface.changeColumn(
        'orders',
        'table_id',
        {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        { transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Sengaja gagal bila sudah ada pesanan Take Away (table_id NULL).
      // Rollback tidak boleh menghapus pesanan pelanggan diam-diam; baris
      // tersebut harus ditangani manual lebih dulu.
      await queryInterface.changeColumn(
        'orders',
        'table_id',
        {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        { transaction },
      );

      await queryInterface.removeColumn('orders', 'order_type', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};