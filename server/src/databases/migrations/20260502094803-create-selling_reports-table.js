'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('selling_reports', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        date: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        total_transaction: {
          type: Sequelize.BIGINT,
          allowNull: false,
          defaultValue: 0,
        },
        total_items_sold: {
          type: Sequelize.BIGINT,
          allowNull: false,
          defaultValue: 0,
        },
        unit_cost: {
          type: Sequelize.DECIMAL(16, 3),
          allowNull: false,
        },
        gross_revenue: {
          type: Sequelize.DECIMAL(16, 3),
          allowNull: false,
        },
        net_profit: {
          type: Sequelize.DECIMAL(16, 3),
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('selling_reports', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
