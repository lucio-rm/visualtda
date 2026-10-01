import { describe, it, expect, beforeEach } from 'vitest';
import {
  deriveInstructorKey,
  encryptSolutionPayload,
  decryptSolutionPayload,
  setInstructorCryptoKey,
  clearDecryptedCache,
  cacheDecryptedSolution,
  getDecryptedSolutionSync
} from '../src/utils/solutionCrypto';
import { ENCRYPTED_SOLUTIONS } from '../src/engine/encryptedSolutions';

describe('Canonical Solution Encryption (Mission V6 Section 2)', () => {
  beforeEach(() => {
    clearDecryptedCache();
  });

  it('contains encrypted payloads for all 37+ exercises in ENCRYPTED_SOLUTIONS', () => {
    const keys = Object.keys(ENCRYPTED_SOLUTIONS);
    expect(keys.length).toBeGreaterThanOrEqual(37);
    expect(keys).toContain('n-queens');
    expect(keys).toContain('knapsack-dp');
    expect(keys).toContain('sudoku-backtracking');
    expect(keys).toContain('tsp-branch-and-bound');

    // Ensure payloads contain base64 ciphertext and no raw python
    for (const key of keys) {
      const payload = ENCRYPTED_SOLUTIONS[key];
      expect(payload.iv).toBeDefined();
      expect(payload.ciphertext).toBeDefined();
      expect(payload.keys.instructor).toBeDefined();
      expect(payload.keys.student).toBeDefined();
      expect(payload.ciphertext).not.toContain('def ');
      expect(payload.ciphertext).not.toContain('return ');
    }
  });

  it('decrypts successfully with Instructor Key derived via PBKDF2(MEL75.29)', async () => {
    const payload = ENCRYPTED_SOLUTIONS['n-queens'];
    expect(payload).toBeDefined();

    const instKey = await deriveInstructorKey('MEL75.29');
    await setInstructorCryptoKey(instKey);

    const decrypted = await decryptSolutionPayload(payload, {
      isInstructor: true,
      isStudentAuthorized: false
    });

    expect(decrypted).not.toBeNull();
    expect(decrypted).toContain('def resolver_n_reinas');
    expect(decrypted).toContain('return');
  });

  it('fails to decrypt if instructor password is wrong', async () => {
    const payload = ENCRYPTED_SOLUTIONS['n-queens'];
    const wrongKey = await deriveInstructorKey('WRONG_PW');
    await setInstructorCryptoKey(wrongKey);

    const decrypted = await decryptSolutionPayload(payload, {
      isInstructor: true,
      isStudentAuthorized: false
    });

    expect(decrypted).toBeNull();
  });

  it('decrypts successfully via legitimate Student Pass authorization', async () => {
    const payload = ENCRYPTED_SOLUTIONS['sudoku-backtracking'];
    expect(payload).toBeDefined();

    // Student without instructor access, but with test-pass authorization
    await setInstructorCryptoKey(null);

    const decrypted = await decryptSolutionPayload(payload, {
      isInstructor: false,
      isStudentAuthorized: true
    });

    expect(decrypted).not.toBeNull();
    expect(decrypted).toContain('def resolver_sudoku');
  });

  it('blocks decryption if neither instructor nor student pass is authorized', async () => {
    const payload = ENCRYPTED_SOLUTIONS['knapsack-dp'];
    await setInstructorCryptoKey(null);

    const decrypted = await decryptSolutionPayload(payload, {
      isInstructor: false,
      isStudentAuthorized: false
    });

    expect(decrypted).toBeNull();
  });

  it('encrypts and round-trips custom python snippet using dual slots', async () => {
    const customCode = '# Custom Solution\ndef my_algorithm(data):\n    return sum(data)\n';
    const encrypted = await encryptSolutionPayload('custom-exercise', customCode, 'MEL75.29');

    expect(encrypted.ciphertext).not.toContain('my_algorithm');

    // Test instructor unwrap
    const instKey = await deriveInstructorKey('MEL75.29');
    await setInstructorCryptoKey(instKey);
    const decryptedByInst = await decryptSolutionPayload(encrypted, {
      isInstructor: true,
      isStudentAuthorized: false
    });
    expect(decryptedByInst).toBe(customCode);

    // Test student unwrap
    clearDecryptedCache();
    await setInstructorCryptoKey(null);
    const decryptedByStudent = await decryptSolutionPayload(encrypted, {
      isInstructor: false,
      isStudentAuthorized: true
    });
    expect(decryptedByStudent).toBe(customCode);
  });

  it('caches decrypted solutions in memory for synchronous retrieval', () => {
    cacheDecryptedSolution('dummy-exercise', 'print("cached")');
    expect(getDecryptedSolutionSync('dummy-exercise')).toBe('print("cached")');
  });
});
