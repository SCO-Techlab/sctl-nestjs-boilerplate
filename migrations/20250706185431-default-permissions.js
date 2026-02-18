const PERMISSIONS_MIGRATION = require('./migrations-mocks/default-permissions.mock');

module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      for (const permission of PERMISSIONS_MIGRATION) {
        const existPermission = await db.collection('permissions').findOne({ name: permission.name, type: permission.type });
        if (existPermission) {
          await db.collection('permissions').deleteOne({ name: permission.name, type: permission.type });
        }
        await db.collection('permissions').insertOne(permission);
      }
    } catch (error) {
      console.error(`[MongoMigrations] Default Permissions UP -> Error: ${error}`);
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      for (const permission of PERMISSIONS_MIGRATION) {
        const existPermission = await db.collection('permissions').findOne({ name: permission.name, type: permission.type });
        if (existPermission) {
          await db.collection('permissions').deleteOne({ name: permission.name, type: permission.type });
        }
      }
    } catch (error) {
      console.error(`[MongoMigrations] Default Permissions DOWN -> Error: ${error}`);
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }
};
