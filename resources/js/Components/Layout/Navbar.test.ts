import { describe, expect, it } from 'vitest';
import navbarSource from './Navbar.vue?raw';

const allVueSources = Object.values(import.meta.glob('/resources/js/**/*.vue', {
    eager: true,
    import: 'default',
    query: '?raw',
})).join('\n');

const entries = [
    ['i方案', 'https://www.i41.cn?utm_source=pdf&utm_medium=tool_referral&utm_campaign=ifangan&utm_content=ecosystem_nav'],
    ['开发者工具', 'https://tools.i41.cn'],
    ['图片压缩', 'https://imgzip.i41.cn'],
    ['智能抠图', 'https://imgzip.i41.cn/remove-background/'],
    ['多图拼接', 'https://imgzip.i41.cn/collage/'],
    ['证件水印', 'https://watermark.i41.cn'],
    ['临时剪贴板', 'https://clip.i41.cn'],
    ['证件照', 'https://idphoto.i41.cn'],
] as const;

describe('统一生态导航', () => {
    it('uses the exact ecosystem item order and URLs', () => {
        let previousIndex = -1;

        for (const [name, url] of entries) {
            const entry = `name: '${name}',\n        href: '${url}'`;
            const currentIndex = navbarSource.indexOf(entry);
            expect(currentIndex, `${name} should be present`).toBeGreaterThan(-1);
            expect(currentIndex, `${name} should follow the previous item`).toBeGreaterThan(previousIndex);
            previousIndex = currentIndex;
        }
    });

    it('opens every link in the application in the current window', () => {
        expect(allVueSources).not.toContain('target=');
        expect(allVueSources).not.toContain('rel="noopener noreferrer"');
    });

    it('uses the specified CTA, PDF branding, and accessible menu tips', () => {
        expect(navbarSource).toContain("primary: true");
        expect(navbarSource).toContain("item.primary ? 'min-w-[72px] bg-blue-600 text-white font-semibold hover:bg-blue-700'");
        expect(navbarSource).not.toContain("name: 'PDF 工具'");
        expect(navbarSource).not.toContain("active: true");
        expect(navbarSource).not.toContain('aria-current="page"');
        expect(navbarSource).toContain('<span>PDF 工具箱</span>');
        expect(navbarSource).toContain('role="tooltip"');
        expect(navbarSource).toContain('group-hover:visible');
        expect(navbarSource).toContain('group-focus-visible:visible');
        expect(navbarSource).toContain('{{ item.tooltip }}');
    });

    it('keeps the local PDF brand and uses a white 64px 1104px navigation shell', () => {
        expect(navbarSource).toContain('🧰');
        expect(navbarSource).toContain('PDF 工具箱');
        expect(navbarSource).toContain('bg-white');
        expect(navbarSource).toContain('max-w-[1104px]');
        expect(navbarSource).toContain('h-16');
    });

    it('uses a qualified privacy badge rather than an absolute local-processing claim', () => {
        expect(navbarSource).toContain('文件尽量在本地处理');
        expect(navbarSource).not.toContain('所有 PDF 处理在浏览器本地完成');
    });
});
