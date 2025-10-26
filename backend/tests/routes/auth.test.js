const request = require('supertest');
const express = require('express');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

// Создаем отдельное приложение для тестов
const app = express();
app.use(express.json());

// Импортируем маршруты и мокируем зависимости
jest.mock('../../models/User');
jest.mock('jsonwebtoken');

describe('Auth Routes', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password_hash: 'hashedpassword',
    role_id: 1
  };

  // Мокируем методы модели User
  const mockUserInstance = new User();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
      };

      mockUserInstance.create = jest.fn().mockResolvedValue({
        id: 2,
        username: userData.username,
        email: userData.email,
        role_id: 1,
        created_at: new Date().toISOString()
      });

      // Заменяем конструктор User на мок
      User.mockImplementation(() => mockUserInstance);

      // Импортируем маршруты после мокирования
      const authRoutes = require('../../routes/auth');
      app.use('/api/auth', authRoutes);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'User registered successfully',
        user: {
          id: 2,
          username: userData.username,
          email: userData.email,
          role_id: 1
        }
      });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user with correct credentials', async () => {
      const loginData = {
        username: 'testuser',
        password: 'password123'
      };

      mockUserInstance.getByUsername = jest.fn().mockResolvedValue(mockUser);
      mockUserInstance.comparePassword = jest.fn().mockResolvedValue(true);
      
      // Мокируем jwt.sign
      const jwt = require('jsonwebtoken');
      jwt.sign.mockReturnValue('mocked-jwt-token');

      // Заменяем конструктор User на мок
      User.mockImplementation(() => mockUserInstance);

      // Импортируем маршруты после мокирования
      const authRoutes = require('../../routes/auth');
      app.use('/api/auth', authRoutes);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Login successful',
        token: 'mocked-jwt-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role_id: 1
        }
      });
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      mockUserInstance.getByUsername = jest.fn().mockResolvedValue(mockUser);
      mockUserInstance.comparePassword = jest.fn().mockResolvedValue(false);

      // Заменяем конструктор User на мок
      User.mockImplementation(() => mockUserInstance);

      // Импортируем маршруты после мокирования
      const authRoutes = require('../../routes/auth');
      app.use('/api/auth', authRoutes);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toEqual({
        message: 'Invalid credentials'
      });
    });
  });
});