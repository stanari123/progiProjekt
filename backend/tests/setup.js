// Jest setup file
// Add any global test setup here

// Mock environment variables BEFORE any imports
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_KEY = 'test-anon-key-12345';
process.env.JWT_SECRET = 'test-secret-key';

// Suppress console during tests if needed
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   warn: jest.fn(),
// };
