const path = require('path');
require('dotenv').config();

const environment = process.env.NODE_ENV || 'development';

let dbConfig;

if (environment === 'production') {
  // Production configuration uses PostgreSQL
  dbConfig = {
    client: process.env.DB_CLIENT || 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'mediannsp',
    },
    migrations: {
      directory: path.join(__dirname, '../migrations'),
    },
    seeds: {
      directory: path.join(__dirname, '../seeds'),
    },
  };
} else {
  // Development configuration uses SQLite
  dbConfig = {
    client: 'sqlite3',
    connection: {
      filename: process.env.DB_FILENAME || './database.sqlite',
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, '../migrations'),
    },
    seeds: {
      directory: path.join(__dirname, '../seeds'),
    },
  };
}

module.exports = {
  environment,
  dbConfig,
};