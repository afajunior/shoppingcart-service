const { hash } = require('bcrypt')

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('roles', [
      { name: 'ADMIN', createdAt: new Date(), updatedAt: new Date() },
      { name: 'USER', createdAt: new Date(), updatedAt: new Date() },
    ])

    const [roles] = await queryInterface.sequelize.query(`SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1`)
    const adminRoleId = roles[0].id

    const password = await hash('root', 10)
    await queryInterface.bulkInsert('users', [
      {
        username: 'root',
        email: 'root@root.com',
        password,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const [users] = await queryInterface.sequelize.query(`SELECT id FROM users WHERE username = 'root' LIMIT 1`)
    const rootUserId = users[0].id

    await queryInterface.bulkInsert('users_roles', [
      {
        user_id: rootUserId,
        role_id: adminRoleId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users_roles', null, {})
    await queryInterface.bulkDelete('users', { username: 'root' }, {})
    await queryInterface.bulkDelete('roles', { name: ['ADMIN', 'USER'] }, {})
  },
}
