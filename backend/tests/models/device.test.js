const Device = require('../../models/Device');

describe('Device Model', () => {
  // Создаем экземпляр Device с mock Knex
  const mockKnex = {};
  const device = new Device(mockKnex);

  // Тестируем методы, которые существуют в модели
 describe('getById', () => {
    it('should have getById method', () => {
      expect(typeof device.getById).toBe('function');
    });
  });

  describe('create', () => {
    it('should have create method', () => {
      expect(typeof device.create).toBe('function');
    });
  });

  describe('update', () => {
    it('should have update method', () => {
      expect(typeof device.update).toBe('function');
    });
  });

  describe('delete', () => {
    it('should have delete method', () => {
      expect(typeof device.delete).toBe('function');
    });
  });

  describe('addComponent', () => {
    it('should have addComponent method', () => {
      expect(typeof device.addComponent).toBe('function');
    });
  });

  describe('removeComponent', () => {
    it('should have removeComponent method', () => {
      expect(typeof device.removeComponent).toBe('function');
    });
  });
});