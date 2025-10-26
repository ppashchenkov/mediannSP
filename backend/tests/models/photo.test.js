const Photo = require('../../models/Photo');

describe('Photo Model', () => {
  // Создаем экземпляр Photo с mock Knex
  const mockKnex = {};
  const photo = new Photo(mockKnex);

  // Тестируем методы, которые существуют в модели
  describe('getById', () => {
    it('should have getById method', () => {
      expect(typeof photo.getById).toBe('function');
    });
  });

  describe('create', () => {
    it('should have create method', () => {
      expect(typeof photo.create).toBe('function');
    });
  });

  describe('update', () => {
    it('should have update method', () => {
      expect(typeof photo.update).toBe('function');
    });
  });

  describe('delete', () => {
    it('should have delete method', () => {
      expect(typeof photo.delete).toBe('function');
    });
  });

  describe('getAllByEntity', () => {
    it('should have getAllByEntity method', () => {
      expect(typeof photo.getAllByEntity).toBe('function');
    });
  });

  describe('setAsPrimary', () => {
    it('should have setAsPrimary method', () => {
      expect(typeof photo.setAsPrimary).toBe('function');
    });
  });

  describe('getPrimaryPhoto', () => {
    it('should have getPrimaryPhoto method', () => {
      expect(typeof photo.getPrimaryPhoto).toBe('function');
    });
  });
});