/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .table('devices', function(table) {
      table.integer('contract_id').unsigned();
      table.foreign('contract_id').references('id').inTable('contracts');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .table('devices', function(table) {
      table.dropForeign('contract_id');
      table.dropColumn('contract_id');
    });
};