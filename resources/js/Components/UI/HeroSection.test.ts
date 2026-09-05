import { describe, expect, it } from 'vitest';
import heroSource from './HeroSection.vue?raw';

describe('HeroSection i方案引导', () => {
    it('keeps the yellow guidance banner and its i方案 CTA', () => {
        expect(heroSource).toContain('关注 i方案');
        expect(heroSource).toContain('获取内容创作、客户跟单、文生图与视频制作方案');
        expect(heroSource).toContain('i方案 →');
        expect(heroSource).toContain('bg-amber-50');
        expect(heroSource).toContain('bg-blue-600');
        expect(heroSource).not.toContain('访问 i方案');
    });

    it('attributes the promotional banner link to PDF tools and opens it in the current window', () => {
        expect(heroSource).toContain('href="https://www.i41.cn?utm_source=pdf&utm_medium=tool_referral&utm_campaign=ifangan&utm_content=promo_banner"');
        expect(heroSource).not.toContain('target=');
        expect(heroSource).not.toContain('rel="noopener noreferrer"');
    });
});
