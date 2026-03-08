const DEFAULT_PERMISSION = {
  createdAt: new Date(),
  updatedAt: new Date(),
  __v: 0
};

module.exports = [
  { name: 'PERMISSIONS', type: 'CREATE', ...DEFAULT_PERMISSION },
  { name: 'PERMISSIONS', type: 'READ', ...DEFAULT_PERMISSION },
  { name: 'PERMISSIONS', type: 'UPDATE', ...DEFAULT_PERMISSION },
  { name: 'PERMISSIONS', type: 'UPDATE_BULK', ...DEFAULT_PERMISSION },
  { name: 'PERMISSIONS', type: 'DELETE', ...DEFAULT_PERMISSION },
  { name: 'PERMISSIONS', type: 'DELETE_BULK', ...DEFAULT_PERMISSION },

  { name: 'ROLES', type: 'CREATE', ...DEFAULT_PERMISSION },
  { name: 'ROLES', type: 'READ', ...DEFAULT_PERMISSION },
  { name: 'ROLES', type: 'UPDATE', ...DEFAULT_PERMISSION },
  { name: 'ROLES', type: 'UPDATE_BULK', ...DEFAULT_PERMISSION },
  { name: 'ROLES', type: 'DELETE', ...DEFAULT_PERMISSION },
  { name: 'ROLES', type: 'DELETE_BULK', ...DEFAULT_PERMISSION },

  { name: 'USERS', type: 'CREATE', ...DEFAULT_PERMISSION },
  { name: 'USERS', type: 'READ', ...DEFAULT_PERMISSION },
  { name: 'USERS', type: 'UPDATE', ...DEFAULT_PERMISSION },
  { name: 'USERS', type: 'UPDATE_BULK', ...DEFAULT_PERMISSION },
  { name: 'USERS', type: 'DELETE', ...DEFAULT_PERMISSION },
  { name: 'USERS', type: 'DELETE_BULK', ...DEFAULT_PERMISSION },
];