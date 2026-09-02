import { describe, expect, it } from 'vitest';
import footerSource from './Footer.vue?raw';

describe('Footer upstream attribution', () => {
    it('removes the upstream donation and EU badge from the product UI', () => {
        expect(footerSource).not.toContain('paypal.me/fullo');
        expect(footerSource).not.toContain('footer.buy_coffee');
        expect(footerSource).not.toContain('Proudly made in EU');
    });

    it('adds i41 tool attribution without claiming i方案 is free', () => {
        expect(footerSource).toContain('i41 免费实用工具');
        expect(footerSource).not.toMatch(/i方案[^<\n]*(?:永久免费|免费)/);
    });

    it('retains the upstream project and copyright attribution', () => {
        expect(footerSource).toContain('基于上游开源项目 PDF Worker 二次开发');
        expect(footerSource).toContain('PDF Worker.');
        expect(footerSource).toContain('https://github.com/fullo/pdf-worker/');
    });
});
