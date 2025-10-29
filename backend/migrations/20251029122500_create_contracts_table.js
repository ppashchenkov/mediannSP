/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('contracts', function(table) {
      table.increments('id').primary();
      table.string('contract_number', 100).notNullable();
      table.date('contract_date').notNullable();
      table.integer('user_id').unsigned().notNullable();
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      // Добавляем внешний ключ на таблицу users
      table.foreign('user_id').references('id').inTable('users');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('contracts');
};