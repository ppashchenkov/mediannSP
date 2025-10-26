const User = require('../../models/User');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  // Создаем экземпляр User с mock Knex
  const mockKnex = {};
  const user = new User(mockKnex);

  describe('comparePassword', () => {
    it('should validate correct password', async () => {
      const password = 'testpassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const isValid = await user.comparePassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const isValid = await user.comparePassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });
  });
});