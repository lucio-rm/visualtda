import { describe, it, expect } from 'vitest';
import type { ThemeMode } from '../src/types/theme';
import type { ThemeMode as ReexportedThemeMode } from '../src/types';
import type { ThemeMode as AppThemeMode } from '../src/app/App';

describe('ThemeMode Type and Decoupling', () => {
  it('allows valid theme modes system, light, and dark', () => {
    const validModes: ThemeMode[] = ['system', 'light', 'dark'];
    expect(validModes).toHaveLength(3);

    const reexported: ReexportedThemeMode = 'system';
    const appMode: AppThemeMode = 'dark';
    expect(reexported).toBe('system');
    expect(appMode).toBe('dark');
  });
});
