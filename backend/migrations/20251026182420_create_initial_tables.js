/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // Create roles table
    .createTable('roles', function(table) {
      table.increments('id').primary();
      table.string('name', 50).unique().notNullable();
      table.text('description');
    })
    
    // Create device_types table
    .createTable('device_types', function(table) {
      table.increments('id').primary();
      table.string('name', 100).unique().notNullable();
      table.text('description');
    })
    
    // Create component_types table
    .createTable('component_types', function(table) {
      table.increments('id').primary();
      table.string('name', 100).unique().notNullable();
      table.text('description');
    })
    
    // Create users table
    .createTable('users', function(table) {
      table.increments('id').primary();
      table.string('username', 100).unique().notNullable();
      table.string('email', 255).unique().notNullable();
      table.string('password_hash', 255).notNullable();
      table.integer('role_id').unsigned().references('id').inTable('roles');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    
    // Create devices table
    .createTable('devices', function(table) {
      table.increments('id').primary();
      table.string('name', 25).notNullable();
      table.string('serial_number', 255).unique();
      table.integer('device_type_id').unsigned().references('id').inTable('device_types');
      table.string('manufacturer', 255);
      table.string('model', 255);
      table.json('specifications');
      table.string('location', 25);
      table.date('purchase_date');
      table.date('warranty_date');
      table.string('status', 50).defaultTo('active');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.integer('created_by').unsigned().references('id').inTable('users');
      table.integer('updated_by').unsigned().references('id').inTable('users');
    })
    
    // Create components table
    .createTable('components', function(table) {
      table.increments('id').primary();
      table.string('name', 25).notNullable();
      table.string('serial_number', 255).unique();
      table.integer('component_type_id').unsigned().references('id').inTable('component_types');
      table.string('manufacturer', 255);
      table.string('model', 255);
      table.json('specifications');
      table.date('purchase_date');
      table.date('warranty_date');
      table.string('status', 50).defaultTo('active');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.integer('created_by').unsigned().references('id').inTable('users');
      table.integer('updated_by').unsigned().references('id').inTable('users');
    })
    
    // Create device_components table
    .createTable('device_components', function(table) {
      table.increments('id').primary();
      table.integer('device_id').unsigned().references('id').inTable('devices').onDelete('CASCADE');
      table.integer('component_id').unsigned().references('id').inTable('components');
      table.timestamp('installed_at').defaultTo(knex.fn.now());
      table.integer('installed_by').unsigned().references('id').inTable('users');
      table.boolean('is_active').defaultTo(true);
      table.unique(['device_id', 'component_id']); // One component can't be twice in one device
    })
    
    // Create photos table
    .createTable('photos', function(table) {
      table.increments('id').primary();
      table.string('entity_type', 20).notNullable(); // 'device' or 'component'
      table.integer('entity_id').notNullable(); // ID of the device or component
      table.string('file_path', 500);
      table.string('file_name', 255);
      table.integer('file_size'); // Size in bytes
      table.string('mime_type', 100); // File type
      table.boolean('is_primary').defaultTo(false);
      table.timestamp('uploaded_at').defaultTo(knex.fn.now());
      table.integer('uploaded_by').unsigned().references('id').inTable('users');
      table.index(['entity_type', 'entity_id']); // Index for faster queries
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('photos')
    .dropTableIfExists('device_components')
    .dropTableIfExists('components')
    .dropTableIfExists('devices')
    .dropTableIfExists('component_types')
    .dropTableIfExists('device_types')
    .dropTableIfExists('users')
    .dropTableIfExists('roles');
};
