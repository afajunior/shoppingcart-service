'use strict'

const { DataTypes } = require('sequelize')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.changeColumn('products', 'price', {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    })
    await queryInterface.changeColumn('products', 'quantity', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    })
    await queryInterface.changeColumn('orders', 'totalAmount', {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    })
  },

  async down(queryInterface) {
    await queryInterface.changeColumn('products', 'price', {
      type: DataTypes.DOUBLE,
      allowNull: true,
    })
    await queryInterface.changeColumn('products', 'quantity', {
      allowNull: true,
      defaultValue: null,
    })
    await queryInterface.changeColumn('orders', 'totalAmount', {
      type: DataTypes.DOUBLE,
      allowNull: true,
    })
  },
}
