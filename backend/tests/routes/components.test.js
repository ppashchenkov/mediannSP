const request = require('supertest');
const express = require('express');
const Component = require('../../models/Component');

// Создаем отдельное приложение для тестов
const app = express();
app.use(express.json());

// Мокируем middleware и зависимости
jest.mock('../../models/Component');

// Мокирование JWT middleware
jest.mock('../../middleware/auth', () => (req, res, next) => {
 req.user = { id: 1, role_id: 1 }; // Мокируем пользователя с правами администратора
  next();
}));
;
;


describe('Components Routes', () => {

  const mockComponent = {
    id: 1,
    name: 'Test Component',
    type_id: 1,
    specifications: '{"key": "value"}',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
 };

  const mockComponentList = [
    mockComponent,
    {
      id: 2,
      name: 'Second Component',
      type_id: 2,
      specifications: '{"another": "property"}',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Мокируем методы модели Component
  const mockComponentInstance = new Component();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/components', () => {
    it('should return list of components', async () => {
      mockComponentInstance.getAll = jest.fn().mockResolvedValue({
        components: mockComponentList,
        totalCount: mockComponentList.length,
        page: 1,
        limit: 10,
        totalPages: 1
      });

      // Заменяем конструктор Component на мок
      Component.mockImplementation(() => mockComponentInstance);

      // Импортируем маршруты после мокирования
      const componentsRoutes = require('../../routes/components');
      app.use('/api/components', componentsRoutes);

      const response = await request(app)
        .get('/api/components')
        .expect(200);

      expect(response.body).toEqual({
        components: mockComponentList,
        totalCount: mockComponentList.length,
        page: 1,
        limit: 10,
        totalPages: 1
      });
    });
  });

  describe('GET /api/components/:id', () => {
    it('should return a single component by ID', async () => {
      mockComponentInstance.getById = jest.fn().mockResolvedValue(mockComponent);

      // Заменяем конструктор Component на мок
      Component.mockImplementation(() => mockComponentInstance);

      // Импортируем маршруты после мокирования
      const componentsRoutes = require('../../routes/components');
      app.use('/api/components', componentsRoutes);

      const response = await request(app)
        .get('/api/components/1')
        .expect(200);

      expect(response.body).toEqual({
        component: mockComponent
      });
    });

    it('should return 404 for non-existent component', async () => {
      mockComponentInstance.getById = jest.fn().mockResolvedValue(null);

      // Заменяем конструктор Component на мок
      Component.mockImplementation(() => mockComponentInstance);

      // Импортируем маршруты после мокирования
      const componentsRoutes = require('../../routes/components');
      app.use('/api/components', componentsRoutes);

      const response = await request(app)
        .get('/api/components/999')
        .expect(404);

      expect(response.body).toEqual({
        message: 'Component not found'
      });
    });
  });

  describe('POST /api/components', () => {
    it('should create a new component', async () => {
      const componentData = {
        name: 'New Component',
        type_id: 1,
        specifications: { feature: 'value' }
      };

      mockComponentInstance.create = jest.fn().mockResolvedValue({
        id: 3,
        ...componentData,
        specifications: JSON.stringify(componentData.specifications),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Заменяем конструктор Component на мок
      Component.mockImplementation(() => mockComponentInstance);

      // Импортируем маршруты после мокирования
      const componentsRoutes = require('../../routes/components');
      app.use('/api/components', componentsRoutes);

      const response = await request(app)
        .post('/api/components')
        .send(componentData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Component created successfully',
        component: {
          id: 3,
          ...componentData,
          specifications: JSON.stringify(componentData.specifications),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });
    });
  });

  describe('PUT /api/components/:id', () => {
    it('should update a component', async () => {
      const updateData = {
        name: 'Updated Component',
        type_id: 2,
        specifications: { updated: 'property' }
      };

      mockComponentInstance.getById = jest.fn().mockResolvedValue(mockComponent);
      mockComponentInstance.update = jest.fn().mockResolvedValue({
        ...mockComponent,
        ...updateData,
        specifications: JSON.stringify(updateData.specifications)
      });

      // Заменяем конструктор Component на мок
      Component.mockImplementation(() => mockComponentInstance);

      // Импортируем маршруты после мокирования
      const componentsRoutes = require('../../routes/components');
      app.use('/api/components', componentsRoutes);

      const response = await request(app)
        .put('/api/components/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Component updated successfully',
        component: {
          ...mockComponent,
          ...updateData,
          specifications: JSON.stringify(updateData.specifications)
        }
      });
    });

    it('should return 404 when updating non-existent component', async () => {
      const updateData = {
        name: 'Updated Component',
        type_id: 2,
        specifications: { updated: 'property' }
      };

      mockComponentInstance.getById = jest.fn().mockResolvedValue(null);

      // Заменяем конструктор Component на мок
      Component.mockImplementation(() => mockComponentInstance);

      // Импортируем маршруты после мокирования
      const componentsRoutes = require('../../routes/components');
      app.use('/api/components', componentsRoutes);

      const response = await request(app)
        .put('/api/components/999')
        .send(updateData)
        .expect(404);

      expect(response.body).toEqual({
        message: 'Component not found'
      });
    });
  });

  describe('DELETE /api/components/:id', () => {
    it('should delete a component', async () => {
      mockComponentInstance.getById = jest.fn().mockResolvedValue(mockComponent);
      mockComponentInstance.delete = jest.fn().mockResolvedValue(true);

      // Заменяем конструктор Component на мок
      Component.mockImplementation(() => mockComponentInstance);

      // Импортируем маршруты после мокирования
      const componentsRoutes = require('../../routes/components');
      app.use('/api/components', componentsRoutes);

      const response = await request(app)
        .delete('/api/components/1')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Component deleted successfully'
      });
    });

    it('should return 404 when deleting non-existent component', async () => {
      mockComponentInstance.getById = jest.fn().mockResolvedValue(null);

      // Заменяем конструктор Component на мок
      Component.mockImplementation(() => mockComponentInstance);

      // Импортируем маршруты после мокирования
      const componentsRoutes = require('../../routes/components');
      app.use('/api/components', componentsRoutes);

      const response = await request(app)
        .delete('/api/components/999')
        .expect(404);

      expect(response.body).toEqual({
        message: 'Component not found'
      });
    });
  });
});