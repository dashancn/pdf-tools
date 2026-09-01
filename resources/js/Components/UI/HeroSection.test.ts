import { describe, expect, it } from 'vitest';
import heroSource from './HeroSection.vue?raw';

describe('HeroSection i方案 link', () => {
    it('uses a directional arrow instead of an ambiguous information symbol', () => {
        expect(heroSource).toContain('aria-hidden="true">→</span>');
        expect(heroSource).not.toContain('class="text-lg">i</span>');
    });
});
