const dotenv = require('dotenv');
dotenv.config({ path: `./env/${process.env.NODE_ENV}.env` });

const mongodbHost = process.env.MONGODB_HOST || '127.0.0.1';
const mongodbPort = process.env.MONGODB_PORT || 27017;
const mongodbDatabase = process.env.MONGODB_DATABASE || 'sctl-nestjs-boilerplate-development';
const mongodbUser = process.env.MONGODB_USER || undefined;
const mongodbPassword = process.env.MONGODB_PASSWORD || undefined;
const mongodbAuthSource = process.env.MONGODB_AUTH_SOURCE || undefined;
const authSource = mongodbAuthSource ? `?authSource=${mongodbAuthSource}` : '';

const config = {
  mongodb: {
    url: !mongodbUser && !mongodbPassword
      ? `mongodb://${mongodbHost}:${mongodbPort}`
      : `mongodb://${mongodbUser}:${mongodbPassword}@${mongodbHost}:${mongodbPort}/${mongodbDatabase}${authSource}`,
    databaseName: mongodbDatabase,
    options: {
      //   useNewUrlParser: true, // removes a deprecation warning when connecting
      //   useUnifiedTopology: false, // removes a deprecating warning when connecting
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
    }
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: "migrations",

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: "changelog-migrations",

  // The file extension to create migrations and searc h for in migration dir 
  migrationFileExtension: ".js",

  // Enable the algorithm to create a checksum of the file contents and use that in the comparison to determine
  // if the file should be run.  Requires that scripts are coded to be run multiple times.
  useFileHash: false,

  // Don't change this, unless you know what you're doing
  moduleSystem: 'commonjs',
};

module.exports = config;