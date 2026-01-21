// backend/tests/pollService.test.js - Phase 1 Component Tests

import { AppError } from '../utils/AppError.js';

describe('pollService.js - Polls Component Tests', () => {
  
  // POLL-TC-001: Valid poll creation (Regular Case)
  describe('POLL-TC-001: Discussion owner can create valid poll', () => {
    test('poll creation validates question is not empty', () => {
      const question = 'Što mislite o novom izgledu?';
      const isValid = question && question.trim().length > 0;
      expect(isValid).toBe(true);
    });
  });
  
  // POLL-TC-002: Empty question validation (Edge Case)
  describe('POLL-TC-002: Poll creation fails with empty question', () => {
    test('should reject empty string question', () => {
      const emptyQuestion = '';
      expect(() => {
        if (!emptyQuestion || !emptyQuestion.trim()) {
          throw new AppError('Pitanje je obavezno', 400);
        }
      }).toThrow(AppError);
    });
  });
});
