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

    it('retains upstream and privacy details in a collapsed disclosure', () => {
        expect(footerSource).toContain('<details');
        expect(footerSource).toContain('查看隐私、开源与其他说明');
        expect(footerSource).toContain('基于上游开源项目 PDF Worker 二次开发');
        expect(footerSource).toContain('PDF Worker.');
        expect(footerSource).toContain('https://github.com/fullo/pdf-worker/');
        expect(footerSource).toContain('SCI Report');
        expect(footerSource).toContain('WSG Report');
    });

    it('keeps the default footer compact', () => {
        expect(footerSource).toContain('PDF 工具箱 · i41 免费实用工具 · 文件本地处理');
        expect(footerSource).not.toContain('py-10');
    });
});
