const USERS_MIGRATION = require('./migrations-mocks/default-users.mock');

module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      for (const user of USERS_MIGRATION) {
        const existUser = await db.collection('users').findOne({ email: user.email });
        if (existUser) {
          await db.collection('users').deleteOne({ email: user.email });
        }

        if (user.role) {
          const existRole = await db.collection('roles').findOne({ name: user.role.name });
          if (existRole) {
            user.role = existRole._id;
          }
        }

        await db.collection('users').insertOne(user);
      }
    } catch (error) {
      console.error(`[MongoMigrations] Default Users UP -> Error: ${error}`);
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      for (const user of USERS_MIGRATION) {
        const existUser = await db.collection('users').findOne({ email: user.email });
        if (existUser) {
          await db.collection('users').deleteOne({ email: user.email });
        }
      }
    } catch (error) {
      console.error(`[MongoMigrations] Default Users DOWN -> Error: ${error}`);
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }
};
