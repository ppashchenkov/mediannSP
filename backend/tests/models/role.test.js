const Role = require('../../models/Role');

describe('Role Model', () => {
 // Создаем экземпляр Role с mock Knex
  const mockKnex = {};
  const role = new Role(mockKnex);

  // Тестируем методы, которые существуют в модели
 describe('getById', () => {
    it('should have getById method', () => {
      expect(typeof role.getById).toBe('function');
    });
  });

  describe('create', () => {
    it('should have create method', () => {
      expect(typeof role.create).toBe('function');
    });
  });

  describe('update', () => {
    it('should have update method', () => {
      expect(typeof role.update).toBe('function');
    });
  });

  describe('delete', () => {
    it('should have delete method', () => {
      expect(typeof role.delete).toBe('function');
    });
  });

  describe('getByName', () => {
    it('should have getByName method', () => {
      expect(typeof role.getByName).toBe('function');
    });
  });

  describe('getAll', () => {
    it('should have getAll method', () => {
      expect(typeof role.getAll).toBe('function');
    });
  });
});