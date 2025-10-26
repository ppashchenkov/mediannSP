const ComponentType = require('../../models/ComponentType');

describe('ComponentType Model', () => {
 // Создаем экземпляр ComponentType с mock Knex
  const mockKnex = {};
  const componentType = new ComponentType(mockKnex);

  // Тестируем методы, которые существуют в модели
 describe('getById', () => {
    it('should have getById method', () => {
      expect(typeof componentType.getById).toBe('function');
    });
  });

  describe('create', () => {
    it('should have create method', () => {
      expect(typeof componentType.create).toBe('function');
    });
  });

  describe('update', () => {
    it('should have update method', () => {
      expect(typeof componentType.update).toBe('function');
    });
  });

  describe('delete', () => {
    it('should have delete method', () => {
      expect(typeof componentType.delete).toBe('function');
    });
  });

  describe('getByName', () => {
    it('should have getByName method', () => {
      expect(typeof componentType.getByName).toBe('function');
    });
  });

  describe('getAll', () => {
    it('should have getAll method', () => {
      expect(typeof componentType.getAll).toBe('function');
    });
  });
});