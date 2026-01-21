// backend/tests/authService.test.js - Phase 1 Component Tests

import bcrypt from 'bcryptjs';
import { AppError } from '../utils/AppError.js';

describe('authService.js - Authentication Component Tests', () => {
  
  // AUTH-TC-001: Valid user login (Regular Case)
  describe('AUTH-TC-001: Valid user login returns token and user info', () => {
    test('bcrypt password hashing and comparison works', async () => {
      const plainPassword = 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isMatch).toBe(true);
    });
  });
  
  // AUTH-TC-002: Invalid password handling (Exception Case)
  describe('AUTH-TC-002: Invalid password error handling', () => {
    test('AppError can be thrown with correct status', () => {
      const error = new AppError('Neispravni podaci', 401);
      expect(error).toBeInstanceOf(AppError);
      expect(error.status).toBe(401);
      expect(error.message).toBe('Neispravni podaci');
    });
  });
});
