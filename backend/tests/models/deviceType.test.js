const DeviceType = require('../../models/DeviceType');

describe('DeviceType Model', () => {
 // Создаем экземпляр DeviceType с mock Knex
  const mockKnex = {};
  const deviceType = new DeviceType(mockKnex);

  // Тестируем методы, которые существуют в модели
 describe('getById', () => {
    it('should have getById method', () => {
      expect(typeof deviceType.getById).toBe('function');
    });
  });

  describe('create', () => {
    it('should have create method', () => {
      expect(typeof deviceType.create).toBe('function');
    });
  });

  describe('update', () => {
    it('should have update method', () => {
      expect(typeof deviceType.update).toBe('function');
    });
  });

  describe('delete', () => {
    it('should have delete method', () => {
      expect(typeof deviceType.delete).toBe('function');
    });
  });

  describe('getByName', () => {
    it('should have getByName method', () => {
      expect(typeof deviceType.getByName).toBe('function');
    });
  });

  describe('getAll', () => {
    it('should have getAll method', () => {
      expect(typeof deviceType.getAll).toBe('function');
    });
  });
});