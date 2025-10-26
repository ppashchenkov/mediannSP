const request = require('supertest');
const express = require('express');
const Device = require('../../models/Device');

// Создаем отдельное приложение для тестов
const app = express();
app.use(express.json());

// Мокируем middleware и зависимости
jest.mock('../../models/Device');

// Мокирование JWT middleware
jest.mock('../../middleware/auth', () => (req, res, next) => {
 req.user = { id: 1, role_id: 1 }; // Мокируем пользователя с правами администратора
  next();
}));
;
;


describe('Devices Routes', () => {

  const mockDevice = {
    id: 1,
    name: 'Test Device',
    type_id: 1,
    serial_number: 'SN123456',
    specifications: '{"key": "value"}',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const mockDeviceList = [
    mockDevice,
    {
      id: 2,
      name: 'Second Device',
      type_id: 2,
      serial_number: 'SN789012',
      specifications: '{"another": "property"}',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Мокируем методы модели Device
  const mockDeviceInstance = new Device();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/devices', () => {
    it('should return list of devices', async () => {
      mockDeviceInstance.getAll = jest.fn().mockResolvedValue({
        devices: mockDeviceList,
        totalCount: mockDeviceList.length,
        page: 1,
        limit: 10,
        totalPages: 1
      });

      // Заменяем конструктор Device на мок
      Device.mockImplementation(() => mockDeviceInstance);

      // Импортируем маршруты после мокирования
      const devicesRoutes = require('../../routes/devices');
      app.use('/api/devices', devicesRoutes);

      const response = await request(app)
        .get('/api/devices')
        .expect(200);

      expect(response.body).toEqual({
        devices: mockDeviceList,
        totalCount: mockDeviceList.length,
        page: 1,
        limit: 10,
        totalPages: 1
      });
    });
  });

  describe('GET /api/devices/:id', () => {
    it('should return a single device by ID', async () => {
      mockDeviceInstance.getById = jest.fn().mockResolvedValue(mockDevice);

      // Заменяем конструктор Device на мок
      Device.mockImplementation(() => mockDeviceInstance);

      // Импортируем маршруты после мокирования
      const devicesRoutes = require('../../routes/devices');
      app.use('/api/devices', devicesRoutes);

      const response = await request(app)
        .get('/api/devices/1')
        .expect(200);

      expect(response.body).toEqual({
        device: mockDevice
      });
    });

    it('should return 404 for non-existent device', async () => {
      mockDeviceInstance.getById = jest.fn().mockResolvedValue(null);

      // Заменяем конструктор Device на мок
      Device.mockImplementation(() => mockDeviceInstance);

      // Импортируем маршруты после мокирования
      const devicesRoutes = require('../../routes/devices');
      app.use('/api/devices', devicesRoutes);

      const response = await request(app)
        .get('/api/devices/999')
        .expect(404);

      expect(response.body).toEqual({
        message: 'Device not found'
      });
    });
  });

  describe('POST /api/devices', () => {
    it('should create a new device', async () => {
      const deviceData = {
        name: 'New Device',
        type_id: 1,
        serial_number: 'SN456789',
        specifications: { feature: 'value' }
      };

      mockDeviceInstance.create = jest.fn().mockResolvedValue({
        id: 3,
        ...deviceData,
        specifications: JSON.stringify(deviceData.specifications),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Заменяем конструктор Device на мок
      Device.mockImplementation(() => mockDeviceInstance);

      // Импортируем маршруты после мокирования
      const devicesRoutes = require('../../routes/devices');
      app.use('/api/devices', devicesRoutes);

      const response = await request(app)
        .post('/api/devices')
        .send(deviceData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Device created successfully',
        device: {
          id: 3,
          ...deviceData,
          specifications: JSON.stringify(deviceData.specifications),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });
    });
  });

  describe('PUT /api/devices/:id', () => {
    it('should update a device', async () => {
      const updateData = {
        name: 'Updated Device',
        type_id: 2,
        serial_number: 'SN99999',
        specifications: { updated: 'property' }
      };

      mockDeviceInstance.getById = jest.fn().mockResolvedValue(mockDevice);
      mockDeviceInstance.update = jest.fn().mockResolvedValue({
        ...mockDevice,
        ...updateData,
        specifications: JSON.stringify(updateData.specifications)
      });

      // Заменяем конструктор Device на мок
      Device.mockImplementation(() => mockDeviceInstance);

      // Импортируем маршруты после мокирования
      const devicesRoutes = require('../../routes/devices');
      app.use('/api/devices', devicesRoutes);

      const response = await request(app)
        .put('/api/devices/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Device updated successfully',
        device: {
          ...mockDevice,
          ...updateData,
          specifications: JSON.stringify(updateData.specifications)
        }
      });
    });

    it('should return 404 when updating non-existent device', async () => {
      const updateData = {
        name: 'Updated Device',
        type_id: 2,
        serial_number: 'SN999999',
        specifications: { updated: 'property' }
      };

      mockDeviceInstance.getById = jest.fn().mockResolvedValue(null);

      // Заменяем конструктор Device на мок
      Device.mockImplementation(() => mockDeviceInstance);

      // Импортируем маршруты после мокирования
      const devicesRoutes = require('../../routes/devices');
      app.use('/api/devices', devicesRoutes);

      const response = await request(app)
        .put('/api/devices/999')
        .send(updateData)
        .expect(404);

      expect(response.body).toEqual({
        message: 'Device not found'
      });
    });
  });

  describe('DELETE /api/devices/:id', () => {
    it('should delete a device', async () => {
      mockDeviceInstance.getById = jest.fn().mockResolvedValue(mockDevice);
      mockDeviceInstance.delete = jest.fn().mockResolvedValue(true);

      // Заменяем конструктор Device на мок
      Device.mockImplementation(() => mockDeviceInstance);

      // Импортируем маршруты после мокирования
      const devicesRoutes = require('../../routes/devices');
      app.use('/api/devices', devicesRoutes);

      const response = await request(app)
        .delete('/api/devices/1')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Device deleted successfully'
      });
    });

    it('should return 404 when deleting non-existent device', async () => {
      mockDeviceInstance.getById = jest.fn().mockResolvedValue(null);

      // Заменяем конструктор Device на мок
      Device.mockImplementation(() => mockDeviceInstance);

      // Импортируем маршруты после мокирования
      const devicesRoutes = require('../../routes/devices');
      app.use('/api/devices', devicesRoutes);

      const response = await request(app)
        .delete('/api/devices/999')
        .expect(404);

      expect(response.body).toEqual({
        message: 'Device not found'
      });
    });
  });
});