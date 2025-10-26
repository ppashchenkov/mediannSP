const request = require('supertest');
const express = require('express');
const User = require('../../models/User');

// Создаем отдельное приложение для тестов
const app = express();
app.use(express.json());

// Мокируем middleware и зависимости
jest.mock('../../models/User');

// Мокирование JWT middleware
jest.mock('../../middleware/auth', () => (req, res, next) => {
 req.user = { id: 1, role_id: 1 }; // Мокируем пользователя с правами администратора
  next();
}));
;
;


describe('Users Routes', () => {

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password_hash: 'hashedpassword',
    role_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
 };

  const mockUserList = [
    mockUser,
    {
      id: 2,
      username: 'seconduser',
      email: 'second@example.com',
      password_hash: 'anotherhashedpassword',
      role_id: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Мокируем методы модели User
  const mockUserInstance = new User();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return list of users', async () => {
      mockUserInstance.getAll = jest.fn().mockResolvedValue({
        users: mockUserList,
        totalCount: mockUserList.length,
        page: 1,
        limit: 10,
        totalPages: 1
      });

      // Заменяем конструктор User на мок
      User.mockImplementation(() => mockUserInstance);

      // Импортируем маршруты после мокирования
      const usersRoutes = require('../../routes/users');
      app.use('/api/users', usersRoutes);

      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body).toEqual({
        users: mockUserList,
        totalCount: mockUserList.length,
        page: 1,
        limit: 10,
        totalPages: 1
      });
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a single user by ID', async () => {
      mockUserInstance.getById = jest.fn().mockResolvedValue(mockUser);

      // Заменяем конструктор User на мок
      User.mockImplementation(() => mockUserInstance);

      // Импортируем маршруты после мокирования
      const usersRoutes = require('../../routes/users');
      app.use('/api/users', usersRoutes);

      const response = await request(app)
        .get('/api/users/1')
        .expect(200);

      expect(response.body).toEqual({
        user: mockUser
      });
    });

    it('should return 404 for non-existent user', async () => {
      mockUserInstance.getById = jest.fn().mockResolvedValue(null);

      // Заменяем конструктор User на мок
      User.mockImplementation(() => mockUserInstance);

      // Импортируем маршруты после мокирования
      const usersRoutes = require('../../routes/users');
      app.use('/api/users', usersRoutes);

      const response = await request(app)
        .get('/api/users/999')
        .expect(404);

      expect(response.body).toEqual({
        message: 'User not found'
      });
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update a user', async () => {
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com'
      };

      mockUserInstance.getById = jest.fn().mockResolvedValue(mockUser);
      mockUserInstance.update = jest.fn().mockResolvedValue({
        ...mockUser,
        ...updateData
      });

      // Заменяем конструктор User на мок
      User.mockImplementation(() => mockUserInstance);

      // Импортируем маршруты после мокирования
      const usersRoutes = require('../../routes/users');
      app.use('/api/users', usersRoutes);

      const response = await request(app)
        .put('/api/users/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: 'User updated successfully',
        user: {
          ...mockUser,
          ...updateData
        }
      });
    });

    it('should return 404 when updating non-existent user', async () => {
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com'
      };

      mockUserInstance.getById = jest.fn().mockResolvedValue(null);

      // Заменяем конструктор User на мок
      User.mockImplementation(() => mockUserInstance);

      // Импортируем маршруты после мокирования
      const usersRoutes = require('../../routes/users');
      app.use('/api/users', usersRoutes);

      const response = await request(app)
        .put('/api/users/99')
        .send(updateData)
        .expect(404);

      expect(response.body).toEqual({
        message: 'User not found'
      });
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      mockUserInstance.getById = jest.fn().mockResolvedValue(mockUser);
      mockUserInstance.delete = jest.fn().mockResolvedValue(true);

      // Заменяем конструктор User на мок
      User.mockImplementation(() => mockUserInstance);

      // Импортируем маршруты после мокирования
      const usersRoutes = require('../../routes/users');
      app.use('/api/users', usersRoutes);

      const response = await request(app)
        .delete('/api/users/1')
        .expect(200);

      expect(response.body).toEqual({
        message: 'User deleted successfully'
      });
    });

    it('should return 404 when deleting non-existent user', async () => {
      mockUserInstance.getById = jest.fn().mockResolvedValue(null);

      // Заменяем конструктор User на мок
      User.mockImplementation(() => mockUserInstance);

      // Импортируем маршруты после мокирования
      const usersRoutes = require('../../routes/users');
      app.use('/api/users', usersRoutes);

      const response = await request(app)
        .delete('/api/users/999')
        .expect(404);

      expect(response.body).toEqual({
        message: 'User not found'
      });
    });
  });
});