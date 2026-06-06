'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('order_items', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        menu_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: "menus",
            key: "id",
          },
        },
        order_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: "orders",
            key: "id",
          },
        },
        quantity: {
          type: Sequelize.BIGINT,
          allowNull: false,
          defaultValue: 0,
        },
        total_price: {
          type: Sequelize.DECIMAL(16, 3),
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
      await queryInterface.dropTable('order_items', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
