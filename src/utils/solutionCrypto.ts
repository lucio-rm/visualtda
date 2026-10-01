/**
 * Solution Cryptography Utilities (Section 2 - Payload Encryption)
 * 
 * Protects canonical Python solutions from static bundle inspection.
 * Bundle contains ONLY AES-256-GCM ciphertext.
 * Keys are derived via PBKDF2 (100,000 iterations for faculty password).
 * Decryption occurs strictly in-memory upon valid authentication or test-pass token.
 */

import { verifyInstructorAccess, isExerciseSolutionAuthorized } from './cryptoAuth';

export const INSTRUCTOR_KDF_SALT = 'visual-tda-faculty-kdf-salt-75.29-2026';
export const STUDENT_TOKEN_SALT = 'visual-tda-student-token-salt-75.29-2026';
export const STUDENT_PASS_SECRET = 'visual-tda-pedagogical-test-pass-secret-2026';

const INSTRUCTOR_SESSION_KEY_STORAGE = 'visual_tda_session_ik';

export interface EncryptedKeySlot {
  iv: string; // Base64 12-byte IV
  ciphertext: string; // Base64 AES-GCM ciphertext + tag
}

export interface EncryptedSolutionPayload {
  exerciseId: string;
  iv: string; // Base64 12-byte IV
  ciphertext: string; // Base64 AES-256-GCM ciphertext of solution.py
  keys: {
    instructor: EncryptedKeySlot;
    student: EncryptedKeySlot;
  };
}

export type EncryptedSolutionsMap = Record<string, EncryptedSolutionPayload>;

// In-memory runtime cache of decrypted solutions to avoid redundant crypto ops
const inMemoryDecryptedCache = new Map<string, string>();
let activeInstructorKey: CryptoKey | null = null;

// Helper: Uint8Array <-> Base64
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64: string): Uint8Array<ArrayBuffer> {
  if (typeof Buffer !== 'undefined') {
    const buf = Buffer.from(base64, 'base64');
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; i++) {
      view[i] = buf[i];
    }
    return view;
  }
  const binary = atob(base64);
  const ab = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(ab);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

const subtle = (typeof crypto !== 'undefined' && crypto.subtle)
  ? crypto.subtle
  : (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle)
    ? globalThis.crypto.subtle
    : null;

/**
 * Derives the instructor AES-256-GCM key from password using PBKDF2 (100,000 iterations).
 */
export async function deriveInstructorKey(password: string): Promise<CryptoKey> {
  if (!subtle) throw new Error('WebCrypto subtle is unavailable');
  const encoder = new TextEncoder();
  const baseKey = await subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(INSTRUCTOR_KDF_SALT),
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true, // extractable for session storage serialization
    ['encrypt', 'decrypt']
  );
}

/**
 * Derives the student test-pass key for a specific exercise using PBKDF2.
 */
export async function deriveStudentKey(exerciseId: string): Promise<CryptoKey> {
  if (!subtle) throw new Error('WebCrypto subtle is unavailable');
  const encoder = new TextEncoder();
  const token = `${exerciseId}:${STUDENT_PASS_SECRET}`;
  const baseKey = await subtle.importKey(
    'raw',
    encoder.encode(token),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(`${STUDENT_TOKEN_SALT}:${exerciseId}`),
      iterations: 10000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a plaintext Python solution into an EncryptedSolutionPayload (build-time helper).
 */
export async function encryptSolutionPayload(
  exerciseId: string,
  pythonCode: string,
  instructorPassword = 'MEL75.29'
): Promise<EncryptedSolutionPayload> {
  if (!subtle) throw new Error('WebCrypto subtle is unavailable');
  const encoder = new TextEncoder();

  // 1. Generate unique 256-bit AES-GCM payload key
  const payloadKey = await subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const rawPayloadKey = await subtle.exportKey('raw', payloadKey);

  // 2. Encrypt the Python solution with the payload key
  const payloadIv = (typeof crypto !== 'undefined' && crypto.getRandomValues)
    ? crypto.getRandomValues(new Uint8Array(12))
    : new Uint8Array(12);
  const payloadCiphertext = await subtle.encrypt(
    { name: 'AES-GCM', iv: payloadIv },
    payloadKey,
    encoder.encode(pythonCode)
  );

  // 3. Wrap payload key with Instructor Key (Slot 1)
  const instructorKey = await deriveInstructorKey(instructorPassword);
  const instructorWrapIv = (typeof crypto !== 'undefined' && crypto.getRandomValues)
    ? crypto.getRandomValues(new Uint8Array(12))
    : new Uint8Array(12);
  const instructorWrapCiphertext = await subtle.encrypt(
    { name: 'AES-GCM', iv: instructorWrapIv },
    instructorKey,
    rawPayloadKey
  );

  // 4. Wrap payload key with Student Pass Key (Slot 2)
  const studentKey = await deriveStudentKey(exerciseId);
  const studentWrapIv = (typeof crypto !== 'undefined' && crypto.getRandomValues)
    ? crypto.getRandomValues(new Uint8Array(12))
    : new Uint8Array(12);
  const studentWrapCiphertext = await subtle.encrypt(
    { name: 'AES-GCM', iv: studentWrapIv },
    studentKey,
    rawPayloadKey
  );

  return {
    exerciseId,
    iv: bufferToBase64(payloadIv),
    ciphertext: bufferToBase64(payloadCiphertext),
    keys: {
      instructor: {
        iv: bufferToBase64(instructorWrapIv),
        ciphertext: bufferToBase64(instructorWrapCiphertext)
      },
      student: {
        iv: bufferToBase64(studentWrapIv),
        ciphertext: bufferToBase64(studentWrapCiphertext)
      }
    }
  };
}

/**
 * Stores active instructor key in memory and optionally in sessionStorage.
 */
export async function setInstructorCryptoKey(key: CryptoKey | null): Promise<void> {
  activeInstructorKey = key;
  if (!key) {
    try {
      sessionStorage.removeItem(INSTRUCTOR_SESSION_KEY_STORAGE);
    } catch {
      // ignore
    }
    return;
  }

  if (subtle) {
    try {
      const raw = await subtle.exportKey('raw', key);
      sessionStorage.setItem(INSTRUCTOR_SESSION_KEY_STORAGE, bufferToBase64(raw));
    } catch {
      // sessionStorage unavailable or export blocked
    }
  }
}

/**
 * Restores or retrieves the active instructor key.
 */
export async function getOrRestoreInstructorKey(): Promise<CryptoKey | null> {
  if (activeInstructorKey) return activeInstructorKey;
  if (!subtle) return null;

  try {
    const stored = sessionStorage.getItem(INSTRUCTOR_SESSION_KEY_STORAGE);
    if (stored && verifyInstructorAccess()) {
      const raw = base64ToBuffer(stored);
      activeInstructorKey = await subtle.importKey(
        'raw',
        raw,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      return activeInstructorKey;
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Decrypts an EncryptedSolutionPayload in memory using either instructor access or student test pass.
 */
export async function decryptSolutionPayload(
  payload: EncryptedSolutionPayload,
  authorization: {
    isInstructor: boolean;
    isStudentAuthorized: boolean;
  }
): Promise<string | null> {
  if (!subtle) return null;

  // Check cache first
  if (inMemoryDecryptedCache.has(payload.exerciseId)) {
    return inMemoryDecryptedCache.get(payload.exerciseId)!;
  }

  let rawPayloadKey: ArrayBuffer | null = null;

  // Path 1: Instructor unwrap
  if (authorization.isInstructor) {
    const instKey = await getOrRestoreInstructorKey();
    if (instKey) {
      try {
        const wrapIv = base64ToBuffer(payload.keys.instructor.iv);
        const wrapCt = base64ToBuffer(payload.keys.instructor.ciphertext);
        rawPayloadKey = await subtle.decrypt(
          { name: 'AES-GCM', iv: wrapIv },
          instKey,
          wrapCt
        );
      } catch {
        // Expected failure if wrong key/password
      }
    }
  }

  // Path 2: Student legitimate pass unwrap
  if (!rawPayloadKey && authorization.isStudentAuthorized) {
    try {
      const studentKey = await deriveStudentKey(payload.exerciseId);
      const wrapIv = base64ToBuffer(payload.keys.student.iv);
      const wrapCt = base64ToBuffer(payload.keys.student.ciphertext);
      rawPayloadKey = await subtle.decrypt(
        { name: 'AES-GCM', iv: wrapIv },
        studentKey,
        wrapCt
      );
    } catch {
      // Expected failure if invalid pass token
    }
  }

  if (!rawPayloadKey) {
    return null;
  }

  // Decrypt payload ciphertext with unwrapped key
  try {
    const payloadKey = await subtle.importKey(
      'raw',
      rawPayloadKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const payloadIv = base64ToBuffer(payload.iv);
    const payloadCt = base64ToBuffer(payload.ciphertext);

    const decryptedBuffer = await subtle.decrypt(
      { name: 'AES-GCM', iv: payloadIv },
      payloadKey,
      payloadCt
    );

    const code = new TextDecoder().decode(decryptedBuffer);
    inMemoryDecryptedCache.set(payload.exerciseId, code);
    return code;
  } catch (err) {
    console.error('Payload decryption failed:', err);
    return null;
  }
}

/**
 * Automatically retrieves and decrypts the canonical solution for an exercise
 * if and only if the current session possesses legitimate instructor or student authorization.
 */
export async function getOrDecryptSolution(exerciseId: string): Promise<string | null> {
  const cached = getDecryptedSolutionSync(exerciseId);
  if (cached) return cached;

  const auth = isExerciseSolutionAuthorized(exerciseId);
  if (!auth.authorized) return null;

  const { ENCRYPTED_SOLUTIONS } = await import('../engine/encryptedSolutions');
  const payload = ENCRYPTED_SOLUTIONS[exerciseId];
  if (!payload) return null;

  const isInstructor = verifyInstructorAccess();
  return decryptSolutionPayload(payload, {
    isInstructor,
    isStudentAuthorized: !isInstructor && auth.authorized
  });
}

/**
 * Returns synchronously cached decrypted solution if present in memory.
 */
export function getDecryptedSolutionSync(exerciseId: string): string | null {
  return inMemoryDecryptedCache.get(exerciseId) || null;
}

/**
 * Explicitly caches a decrypted solution (e.g. for testing environments).
 */
export function cacheDecryptedSolution(exerciseId: string, code: string): void {
  inMemoryDecryptedCache.set(exerciseId, code);
}

/**
 * Clears in-memory decrypted cache on logout.
 */
export function clearDecryptedCache(): void {
  inMemoryDecryptedCache.clear();
  activeInstructorKey = null;
  try {
    sessionStorage.removeItem(INSTRUCTOR_SESSION_KEY_STORAGE);
  } catch {
    // ignore
  }
}
