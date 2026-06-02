'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('stocks', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        unit_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: "units",
            key: "id",
          },
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        status: {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: 1,
        },
        quantity: {
          type: Sequelize.BIGINT,
          allowNull: false,
          defaultValue: 0,
        },
        minimum: {
          type: Sequelize.BIGINT,
          allowNull: false,
          defaultValue: 0,
        },
        maximum: {
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
      await queryInterface.dropTable('stocks', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
