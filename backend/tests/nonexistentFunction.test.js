// backend/tests/nonexistentFunction.test.js - Non-existent functionality test

import * as discussionsService from '../services/discussionsService.js';

describe('NON-TC-005: Non-existent functionality handling', () => {
  test('calling unimplemented function throws TypeError', () => {
    expect(() => {
      // intentionally call a function that is not exported / implemented
      discussionsService.nonExistentFunction();
    }).toThrow(TypeError);
  });
});
