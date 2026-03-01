'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'email_token_verify', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.addColumn('users', 'email_token_expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
    })
    await queryInterface.addColumn('users', 'email_verify_at', {
      type: Sequelize.DATE,
      allowNull: true,
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'email_token_verify')
    await queryInterface.removeColumn('users', 'email_token_expires_at')
    await queryInterface.removeColumn('users', 'email_verify_at')
  },
}
