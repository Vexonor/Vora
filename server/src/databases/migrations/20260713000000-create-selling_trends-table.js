'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'selling_trends',
        {
          id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
          },
          generated_date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
          },
          target_date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
          },
          gross_revenue: {
            type: Sequelize.DECIMAL(16, 3),
            allowNull: false,
            defaultValue: 0,
          },
          net_profit: {
            type: Sequelize.DECIMAL(16, 3),
            allowNull: false,
            defaultValue: 0,
          },
          total_transaction: {
            type: Sequelize.DECIMAL(16, 3),
            allowNull: false,
            defaultValue: 0,
          },
          total_items_sold: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue: 0,
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
        },
        { transaction },
      );

      await queryInterface.addIndex('selling_trends', ['generated_date', 'target_date'], {
        unique: true,
        name: 'uq_selling_trends_generated_target',
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('selling_trends', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
