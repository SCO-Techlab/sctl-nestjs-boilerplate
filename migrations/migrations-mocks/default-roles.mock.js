const PERMISSIONS_MIGRATION = require('./default-permissions.mock');

const DEFAULT_ROLE = {
  extension: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  __v: 0
};

module.exports = [
  {
    name: 'SUPERADMIN',
    permissions: PERMISSIONS_MIGRATION,
    ...DEFAULT_ROLE
  },
  {
    name: 'ADMIN',
    permissions: PERMISSIONS_MIGRATION.filter(permission => permission.name === 'USERS'),
    ...DEFAULT_ROLE
  },
  {
    name: 'USER',
    permissions: PERMISSIONS_MIGRATION.filter(permission => permission.name === 'USERS' && permission.type === 'READ'),
    ...DEFAULT_ROLE
  },
  {
    name: 'GUEST',
    permissions: [],
    ...DEFAULT_ROLE
  }
];