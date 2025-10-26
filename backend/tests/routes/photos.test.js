const request = require('supertest');
const express = require('express');
const Photo = require('../../models/Photo');

// Создаем отдельное приложение для тестов
const app = express();
app.use(express.json());

// Мокируем middleware и зависимости
jest.mock('../../models/Photo');

// Мокирование JWT middleware
jest.mock('../../middleware/auth', () => (req, res, next) => {
 req.user = { id: 1, role_id: 1 }; // Мокируем пользователя с правами администратора
  next();
}));
;
;


describe('Photos Routes', () => {

  const mockPhoto = {
    id: 1,
    filename: 'test.jpg',
    original_name: 'original_test.jpg',
    entity_type: 'device',
    entity_id: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
 };

  const mockPhotoList = [
    mockPhoto,
    {
      id: 2,
      filename: 'another.png',
      original_name: 'original_another.png',
      entity_type: 'component',
      entity_id: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Мокируем методы модели Photo
  const mockPhotoInstance = new Photo();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/photos', () => {
    it('should return list of photos', async () => {
      mockPhotoInstance.getAllByEntity = jest.fn().mockResolvedValue(mockPhotoList);

      // Заменяем конструктор Photo на мок
      Photo.mockImplementation(() => mockPhotoInstance);

      // Импортируем маршруты после мокирования
      const photosRoutes = require('../../routes/photos');
      app.use('/api/photos', photosRoutes);

      const response = await request(app)
        .get('/api/photos')
        .expect(200);

      expect(response.body).toEqual({
        photos: mockPhotoList
      });
    });
  });

  describe('GET /api/photos/:id', () => {
    it('should return a single photo by ID', async () => {
      mockPhotoInstance.getById = jest.fn().mockResolvedValue(mockPhoto);

      // Заменяем конструктор Photo на мок
      Photo.mockImplementation(() => mockPhotoInstance);

      // Импортируем маршруты после мокирования
      const photosRoutes = require('../../routes/photos');
      app.use('/api/photos', photosRoutes);

      const response = await request(app)
        .get('/api/photos/1')
        .expect(200);

      expect(response.body).toEqual({
        photo: mockPhoto
      });
    });

    it('should return 404 for non-existent photo', async () => {
      mockPhotoInstance.getById = jest.fn().mockResolvedValue(null);

      // Заменяем конструктор Photo на мок
      Photo.mockImplementation(() => mockPhotoInstance);

      // Импортируем маршруты после мокирования
      const photosRoutes = require('../../routes/photos');
      app.use('/api/photos', photosRoutes);

      const response = await request(app)
        .get('/api/photos/999')
        .expect(404);

      expect(response.body).toEqual({
        message: 'Photo not found'
      });
    });
  });

  describe('POST /api/photos', () => {
    it('should create a new photo', async () => {
      const photoData = {
        filename: 'new_photo.jpg',
        original_name: 'original_new_photo.jpg',
        entity_type: 'device',
        entity_id: 7
      };

      mockPhotoInstance.create = jest.fn().mockResolvedValue({
        id: 3,
        ...photoData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Заменяем конструктор Photo на мок
      Photo.mockImplementation(() => mockPhotoInstance);

      // Импортируем маршруты после мокирования
      const photosRoutes = require('../../routes/photos');
      app.use('/api/photos', photosRoutes);

      // Создаем FormData для отправки файла
      const response = await request(app)
        .post('/api/photos')
        .field('entity_type', 'device')
        .field('entity_id', '7')
        .attach('photo', Buffer.from('fake image data'), 'new_photo.jpg')
        .expect(201);

      expect(response.body).toEqual({
        message: 'Photo uploaded successfully',
        photo: {
          id: 3,
          ...photoData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });
    });
  });

  describe('DELETE /api/photos/:id', () => {
    it('should delete a photo', async () => {
      mockPhotoInstance.getById = jest.fn().mockResolvedValue(mockPhoto);
      mockPhotoInstance.delete = jest.fn().mockResolvedValue(true);

      // Заменяем конструктор Photo на мок
      Photo.mockImplementation(() => mockPhotoInstance);

      // Импортируем маршруты после мокирования
      const photosRoutes = require('../../routes/photos');
      app.use('/api/photos', photosRoutes);

      const response = await request(app)
        .delete('/api/photos/1')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Photo deleted successfully'
      });
    });

    it('should return 404 when deleting non-existent photo', async () => {
      mockPhotoInstance.getById = jest.fn().mockResolvedValue(null);

      // Заменяем конструктор Photo на мок
      Photo.mockImplementation(() => mockPhotoInstance);

      // Импортируем маршруты после мокирования
      const photosRoutes = require('../../routes/photos');
      app.use('/api/photos', photosRoutes);

      const response = await request(app)
        .delete('/api/photos/999')
        .expect(404);

      expect(response.body).toEqual({
        message: 'Photo not found'
      });
    });
  });
});