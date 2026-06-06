'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn('payments', 'midtrans_transaction_id', {
        type: Sequelize.STRING,
        allowNull: true,
      }, { transaction });
      
      await queryInterface.changeColumn('payments', 'paid', {
        type: Sequelize.DECIMAL(16, 3),
        allowNull: true,
        defaultValue: 0,
      }, { transaction });

      await queryInterface.changeColumn('payments', 'type', {
        type: Sequelize.TINYINT,
        allowNull: true,
      }, { transaction });

      await queryInterface.changeColumn('payments', 'qr_image_url', {
        type: Sequelize.STRING,
        allowNull: true,
      }, { transaction });

      await queryInterface.changeColumn('payments', 'payment_status', {
        type: Sequelize.STRING, 
        allowNull: true,
      }, { transaction });

      await queryInterface.addColumn('payments', 'snap_token', {
        type: Sequelize.STRING,
        allowNull: true,
      }, { transaction });

      await queryInterface.addColumn('payments', 'snap_redirect_url', {
        type: Sequelize.STRING,
        allowNull: true,
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('payments', 'snap_token', { transaction });
      await queryInterface.removeColumn('payments', 'snap_redirect_url', { transaction });
            
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
