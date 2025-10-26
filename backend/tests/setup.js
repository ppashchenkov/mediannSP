const { execSync } = require('child_process');
const path = require('path');

// Установка переменных окружения для тестовой базы данных
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'sqlite://./test_database.sqlite';

// Удаление тестовой базы данных перед запуском тестов
const testDbPath = path.join(__dirname, '../test_database.sqlite');
try {
  require('fs').unlinkSync(testDbPath);
} catch (err) {
  // Файл может не существовать, это нормально
}

console.log('Тестовая среда настроена');