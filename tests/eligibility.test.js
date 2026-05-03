import { test, describe } from 'node:test';
import assert from 'node:assert';
import { checkEligibility } from '../src/utils/eligibility.js';

describe('Eligibility: Voter Qualification', () => {
  test('should allow a 18+ year old citizen', () => {
    const result = checkEligibility(18, true);
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.error, null);
  });

  test('should block anyone under 18', () => {
    const result = checkEligibility(17, true);
    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.error, 'age_error');
  });

  test('should block non-citizens', () => {
    const result = checkEligibility(25, false);
    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.error, 'citizenship_error');
  });

  test('should handle empty or invalid age', () => {
    assert.strictEqual(checkEligibility('', true).isValid, false);
    assert.strictEqual(checkEligibility('abc', true).isValid, false);
  });
});
