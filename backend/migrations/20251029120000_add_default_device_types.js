/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex('device_types').insert([
    { name: 'Сервер', description: 'Серверное оборудование' },
    { name: 'СХД', description: 'Система хранения данных' },
    { name: 'Ноутбук', description: 'Портативный компьютер' },
    { name: 'Настольный ПК', description: 'Персональный компьютер стационарный' },
    { name: 'Моноблок', description: 'Компьютер с интегрированным монитором' },
    { name: 'Планшет', description: 'Портативное сенсорное устройство' },
    { name: 'Тонкий клиент', description: 'Устройство для доступа к удаленным ресурсам' },
    { name: 'Маршрутизатор', description: 'Сетевое устройство для передачи данных' },
    { name: 'Коммутатор', description: 'Сетевое оборудование для соединения устройств' },
    { name: 'Принтер', description: 'Устройство печати' },
    { name: 'Сканер', description: 'Устройство сканирования' },
    { name: 'МФУ', description: 'Многофункциональное устройство' }
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex('device_types')
    .whereIn('name', ['Сервер', 'СХД', 'Ноутбук', 'Настольный ПК', 'Моноблок', 'Планшет', 'Тонкий клиент', 'Маршрутизатор', 'Коммутатор', 'Принтер', 'Сканер', 'МФУ'])
    .del();
};