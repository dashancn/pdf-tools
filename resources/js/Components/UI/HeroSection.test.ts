import { describe, expect, it } from 'vitest';
import heroSource from './HeroSection.vue?raw';

describe('HeroSection i方案引导', () => {
    it('uses a visible yellow guidance banner with a separate dark visit button', () => {
        expect(heroSource).toContain('关注 i方案');
        expect(heroSource).toContain('获取内容创作、客户跟单、文生图与视频制作方案');
        expect(heroSource).toContain('访问 i方案');
        expect(heroSource).toContain('bg-amber-50');
        expect(heroSource).toContain('bg-slate-900');
        expect(heroSource).toContain('aria-hidden="true">→</span>');
        expect(heroSource).not.toContain('class="text-lg">i</span>');
    });

    it('attributes the promotional banner link to PDF tools', () => {
        expect(heroSource).toContain('href="https://www.i41.cn?utm_source=pdf&utm_medium=tool_referral&utm_campaign=ifangan&utm_content=promo_banner"');
    });
});
