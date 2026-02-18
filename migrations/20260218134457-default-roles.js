const ROLES_MIGRATION = require('./migrations-mocks/default-roles.mock');

module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      for (const role of ROLES_MIGRATION) {
        const existRole = await db.collection('roles').findOne({ name: role.name });
        if (existRole) {
          await db.collection('roles').deleteOne({ name: role.name });
        }

        let rolePermissions = [];
        if (role.permissions?.length > 0) {
          for (const permission of role.permissions) {
            const existPermission = await db.collection('permissions').findOne({ name: permission.name, type: permission.type });
            if (existPermission) {
              rolePermissions.push(existPermission._id);
            }
          }
        }

        role.permissions = rolePermissions;
        await db.collection('roles').insertOne(role);
      }
    } catch (error) {
      console.error(`[MongoMigrations] Default Roles UP -> Error: ${error}`);
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      for (const role of ROLES_MIGRATION) {
        const existRole = await db.collection('roles').findOne({ name: role.name });
        if (existRole) {
          await db.collection('roles').deleteOne({ name: role.name });
        }
      }
    } catch (error) {
      console.error(`[MongoMigrations] Default Roles DOWN -> Error: ${error}`);
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }
};
