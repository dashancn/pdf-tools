import { describe, expect, it } from 'vitest';
import navbarSource from './Navbar.vue?raw';

const entries = [
    ['i方案', 'https://www.i41.cn?utm_source=pdf&utm_medium=tool_referral&utm_campaign=ifangan&utm_content=ecosystem_nav', '智能内容工作平台'],
    ['开发者工具', 'https://tools.i41.cn', '编码转换、格式化、加密、网络、文本和图片'],
    ['图片压缩', 'https://imgzip.i41.cn', '压缩、调整尺寸和格式转换'],
    ['证件照', 'https://idphoto.i41.cn', '本地智能抠图、背景换色、常用证件尺寸'],
    ['证件水印', 'https://watermark.i41.cn', '身份证、营业执照和合同截图'],
    ['临时剪贴板', 'https://clip.i41.cn', '客户端加密、自动过期、读取次数限制和阅后即焚'],
    ['PDF 工具', '/', 'PDF 合并、拆分、压缩、转换、编辑和发票拼版'],
] as const;

describe('i41 company navigation', () => {
    it.each(entries)('includes %s with its URL and tooltip', (name, url, tooltip) => {
        expect(navbarSource).toContain(name);
        expect(navbarSource).toContain(url);
        expect(navbarSource).toContain(tooltip);
    });

    it('provides hover and focus tooltip styles', () => {
        expect(navbarSource).toContain('group-hover:visible');
        expect(navbarSource).toContain('group-focus-visible:visible');
    });

    it('attributes the i方案 ecosystem navigation link to PDF tools', () => {
        expect(navbarSource).toContain("href: 'https://www.i41.cn?utm_source=pdf&utm_medium=tool_referral&utm_campaign=ifangan&utm_content=ecosystem_nav'");
    });
});
