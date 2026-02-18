const ROLES_MIGRATION = require('./default-roles.mock');

const DEFAULT_USER = {
  pwdRecoveryToken: null,
  pwdRecoveryDate: null,
  extension: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  __v: 0
};

module.exports = [
  {
    email: 'superadmin@superadmin.com',
    password: '123456789Abc!',
    userName: 'superadmin',
    personalName: 'Super Admin',
    active: true,
    emailConfirmed: true,
    role: ROLES_MIGRATION.find(role => role.name === 'SUPERADMIN'),
    ...DEFAULT_USER
  },
  {
    email: 'admin@admin.com',
    password: '123456789Abc!',
    userName: 'admin',
    personalName: 'Administrator Admin',
    active: true,
    emailConfirmed: true,
    role: ROLES_MIGRATION.find(role => role.name === 'ADMIN'),
    ...DEFAULT_USER
  },
  {
    email: 'user@user.com',
    password: '123456789Abc!',
    userName: 'user',
    personalName: 'User User',
    active: true,
    emailConfirmed: true,
    role: ROLES_MIGRATION.find(role => role.name === 'USER'),
    ...DEFAULT_USER
  },
  {
    email: 'guest@guest.com',
    password: '123456789Abc!',
    userName: 'guest',
    personalName: 'Guest Guest',
    active: true,
    emailConfirmed: true,
    role: ROLES_MIGRATION.find(role => role.name === 'GUEST'),
    ...DEFAULT_USER
  }
];