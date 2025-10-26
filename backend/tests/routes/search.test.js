const request = require('supertest');
const express = require('express');
const Device = require('../../models/Device');
const Component = require('../../models/Component');

// Создаем отдельное приложение для тестов
const app = express();
app.use(express.json());
// Мокируем middleware и зависимости
jest.mock('../../models/Device');
jest.mock('../../models/Component');

// Мокирование JWT middleware
jest.mock('../../middleware/auth', () => (req, res, next) => {
 req.user = { id: 1, role_id: 1 }; // Мокируем пользователя с правами администратора
  next();
}));
;
;


describe('Search Routes', () => {
  const mockDeviceResults = {
    devices: [
      {
        id: 1,
        name: 'Test Device',
        type_id: 1,
        serial_number: 'SN123456',
        specifications: { key: 'value' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    totalCount: 1,
    page: 1,
    limit: 10,
    totalPages: 1
  };

  const mockComponentResults = {
    components: [
      {
        id: 1,
        name: 'Test Component',
        type_id: 1,
        specifications: { key: 'value' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    totalCount: 1,
    page: 1,
    limit: 10,
    totalPages: 1
  };

  // Мокируем методы моделей
  const mockDeviceInstance = new Device();
  const mockComponentInstance = new Component();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/search', () => {
    it('should return search results for devices and components', async () => {
      mockDeviceInstance.getAll = jest.fn().mockResolvedValue(mockDeviceResults);
      mockComponentInstance.getAll = jest.fn().mockResolvedValue(mockComponentResults);

      // Заменяем конструкторы моделей на моки
      Device.mockImplementation(() => mockDeviceInstance);
      Component.mockImplementation(() => mockComponentInstance);

      // Импортируем маршруты после мокирования
      const searchRoutes = require('../../routes/search');
      app.use('/api/search', searchRoutes);

      const response = await request(app)
        .get('/api/search')
        .query({ query: 'test' })
        .expect(200);

      expect(response.body).toEqual({
        results: [
          { ...mockDeviceResults.devices[0], entity_type: 'device' },
          { ...mockComponentResults.components[0], entity_type: 'component' }
        ],
        totalCount: mockDeviceResults.totalCount + mockComponentResults.totalCount,
        page: 1,
        limit: 10,
        totalPages: Math.ceil((mockDeviceResults.totalCount + mockComponentResults.totalCount) / 10)
      });
    });

    it('should return empty results for no matches', async () => {
      mockDeviceInstance.getAll = jest.fn().mockResolvedValue({
        ...mockDeviceResults,
        devices: [],
        totalCount: 0
      });
      mockComponentInstance.getAll = jest.fn().mockResolvedValue({
        ...mockComponentResults,
        components: [],
        totalCount: 0
      });

      // Заменяем конструкторы моделей на моки
      Device.mockImplementation(() => mockDeviceInstance);
      Component.mockImplementation(() => mockComponentInstance);

      // Импортируем маршруты после мокирования
      const searchRoutes = require('../../routes/search');
      app.use('/api/search', searchRoutes);

      const response = await request(app)
        .get('/api/search')
        .query({ query: 'nonexistent' })
        .expect(200);

      expect(response.body).toEqual({
        results: [],
        totalCount: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      });
    });
  });
});