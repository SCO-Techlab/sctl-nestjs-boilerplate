const MENU_FRONT_MIGRATION = require('./migrations-mocks/default-menu-front.mock');

module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      for (const menuFront of MENU_FRONT_MIGRATION) {
        const existMenuFront = await db.collection('menu-front').findOne({ order: menuFront.order });
        if (existMenuFront) {
          await db.collection('menu-front').deleteOne({ order: menuFront.order });
        }
        await db.collection('menu-front').insertOne(menuFront);
      }
    } catch (error) {
      console.error(`[MongoMigrations] Default Menu Front UP -> Error: ${error}`);
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      for (const menuFront of MENU_FRONT_MIGRATION) {
        const existMenuFront = await db.collection('menu-front').findOne({ order: menuFront.order });
        if (existMenuFront) {
          await db.collection('menu-front').deleteOne({ order: menuFront.order });
        }
      }
    } catch (error) {
      console.error(`[MongoMigrations] Default Menu Front DOWN -> Error: ${error}`);
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }
};
