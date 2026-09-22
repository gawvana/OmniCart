import { describe, it, expect } from 'vitest';
import { tokens } from '../design-system/tokens';

describe('Design Tokens', () => {
  it('has valid motion spring presets', () => {
    expect(tokens.motion.micro).toBeDefined();
    expect(tokens.motion.micro.type).toBe('spring');
    expect(tokens.motion.normal).toBeDefined();
    expect(tokens.motion.page).toBeDefined();
  });

  it('has valid animation durations', () => {
    expect(tokens.durations.micro).toBe(0.15);
    expect(tokens.durations.normal).toBe(0.3);
    expect(tokens.durations.page).toBe(0.45);
    expect(tokens.durations.large).toBe(0.7);
  });
});
