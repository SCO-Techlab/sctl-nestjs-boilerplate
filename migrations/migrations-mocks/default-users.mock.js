const ROLES_MIGRATION = require('./default-roles.mock');

const dateNow = new Date();

const DEFAULT_USER = {
  pwdRecoveryToken: null,
  pwdRecoveryDate: null,
  createdAt: dateNow,
  updatedAt: dateNow,
  __v: 0
};

module.exports = [
  {
    email: 'superadmin@superadmin.com',
    password: '$2a$10$AT4Soj6Upx0oeedUtnfx6u9WiYzq3bbDuAKrGSJa2dC8nkkZlsvAC',
    userName: 'superadmin',
    personalName: 'Super Admin',
    active: true,
    emailConfirmed: true,
    emailConfirmedAt: dateNow,
    role: ROLES_MIGRATION.find(role => role.name === 'SUPERADMIN'),
    ...DEFAULT_USER
  },
  {
    email: 'admin@admin.com',
    password: '$2a$10$AT4Soj6Upx0oeedUtnfx6u9WiYzq3bbDuAKrGSJa2dC8nkkZlsvAC',
    userName: 'admin',
    personalName: 'Administrator Admin',
    active: true,
    emailConfirmed: true,
    emailConfirmedAt: dateNow,
    role: ROLES_MIGRATION.find(role => role.name === 'ADMIN'),
    ...DEFAULT_USER
  },
  {
    email: 'user@user.com',
    password: '$2a$10$AT4Soj6Upx0oeedUtnfx6u9WiYzq3bbDuAKrGSJa2dC8nkkZlsvAC',
    userName: 'user',
    personalName: 'User User',
    active: true,
    emailConfirmed: true,
    emailConfirmedAt: dateNow,
    role: ROLES_MIGRATION.find(role => role.name === 'USER'),
    ...DEFAULT_USER
  },
  {
    email: 'guest@guest.com',
    password: '$2a$10$AT4Soj6Upx0oeedUtnfx6u9WiYzq3bbDuAKrGSJa2dC8nkkZlsvAC',
    userName: 'guest',
    personalName: 'Guest Guest',
    active: true,
    emailConfirmed: true,
    emailConfirmedAt: dateNow,
    role: ROLES_MIGRATION.find(role => role.name === 'GUEST'),
    ...DEFAULT_USER
  }
];