const Component = require('../../models/Component');

describe('Component Model', () => {
  // Создаем экземпляр Component с mock Knex
  const mockKnex = {};
 const component = new Component(mockKnex);

  // Тестируем методы, которые существуют в модели
  describe('getById', () => {
    it('should have getById method', () => {
      expect(typeof component.getById).toBe('function');
    });
  });

  describe('create', () => {
    it('should have create method', () => {
      expect(typeof component.create).toBe('function');
    });
  });

  describe('update', () => {
    it('should have update method', () => {
      expect(typeof component.update).toBe('function');
    });
  });

  describe('delete', () => {
    it('should have delete method', () => {
      expect(typeof component.delete).toBe('function');
    });
  });
});