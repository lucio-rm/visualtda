import { describe, it, expect } from 'vitest';
import { sanitizePythonUnicode, beautifyPythonCode } from '../src/utils/codeFormatter';

describe('Python Code Sanitizer & Formatter (Perfection 6 & 7)', () => {
  describe('sanitizePythonUnicode', () => {
    it('normalizes smart curly double quotes to standard ASCII quotes', () => {
      const input = 's = “hola mundo”\nprint(«mensaje»)';
      const result = sanitizePythonUnicode(input);
      expect(result.hasReplacements).toBe(true);
      expect(result.sanitized).toBe('s = "hola mundo"\nprint("mensaje")');
      expect(result.replacementTypes).toContain('comillas dobles');
    });

    it('normalizes smart single quotes and backticks to standard single quotes', () => {
      const input = "char = ‘a’\nchar2 = ’b’";
      const result = sanitizePythonUnicode(input);
      expect(result.hasReplacements).toBe(true);
      expect(result.sanitized).toBe("char = 'a'\nchar2 = 'b'");
      expect(result.replacementTypes).toContain('comillas simples');
    });

    it('replaces non-breaking spaces and removes zero-width spaces', () => {
      const input = 'x\u00A0=\u00A010\u200B';
      const result = sanitizePythonUnicode(input);
      expect(result.hasReplacements).toBe(true);
      expect(result.sanitized).toBe('x = 10');
    });

    it('replaces en-dash and em-dash with standard minus sign', () => {
      const input = 'diff = 10 – 3\nval = 5 — 2';
      const result = sanitizePythonUnicode(input);
      expect(result.hasReplacements).toBe(true);
      expect(result.sanitized).toBe('diff = 10 - 3\nval = 5 - 2');
    });

    it('returns unchanged code if already standard ASCII Python', () => {
      const input = 'def solve(arr):\n    return [x * 2 for x in arr]\n';
      const result = sanitizePythonUnicode(input);
      expect(result.hasReplacements).toBe(false);
      expect(result.sanitized).toBe(input);
    });
  });

  describe('beautifyPythonCode', () => {
    it('converts tabs to 4 spaces and trims trailing whitespace', () => {
      const input = 'def test():\n\tx = 1   \n\treturn x  ';
      const formatted = beautifyPythonCode(input);
      expect(formatted).toBe('def test():\n    x = 1\n    return x\n');
    });

    it('collapses excessive blank lines to at most 2', () => {
      const input = 'def foo():\n    pass\n\n\n\n\ndef bar():\n    pass';
      const formatted = beautifyPythonCode(input);
      expect(formatted).toBe('def foo():\n    pass\n\n\ndef bar():\n    pass\n');
    });

    it('sanitizes unicode quotes as part of formatting', () => {
      const input = 'def greet():\n\tmsg = “Hola”\n\treturn msg';
      const formatted = beautifyPythonCode(input);
      expect(formatted).toBe('def greet():\n    msg = "Hola"\n    return msg\n');
    });
  });
});
