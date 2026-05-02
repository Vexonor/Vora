'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('payments', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        order_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: "orders",
            key: "id",
          },
        },
        total: {
          type: Sequelize.DECIMAL(16, 3),
          allowNull: false,
        },
        paid: {
          type: Sequelize.DECIMAL(16, 3),
          allowNull: false,
        },
        type: {
          type: Sequelize.TINYINT,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
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
      await queryInterface.dropTable('payments', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
