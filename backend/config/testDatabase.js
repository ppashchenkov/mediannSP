const path = require('path');

module.exports = {
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../test_database.sqlite')
  },
  useNullAsDefault: true,
 migrations: {
    directory: path.join(__dirname, '../migrations')
  }
};