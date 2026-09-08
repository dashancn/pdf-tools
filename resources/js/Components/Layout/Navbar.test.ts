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
    ['HEIC 转换', 'https://imgzip.i41.cn/heic-converter/'],
    ['智能抠图', 'https://imgzip.i41.cn/remove-background/'],
    ['多图拼接', 'https://imgzip.i41.cn/collage/'],
    ['证件水印', 'https://watermark.i41.cn'],
    ['临时剪贴板', 'https://clip.i41.cn'],
    ['证件照', 'https://idphoto.i41.cn'],
] as const;

const canonicalTooltips = [
    ['i方案', 'i方案是一套面向本地实体商家、内容运营人员和营销服务团队的智能内容工作平台。平台围绕行业、平台、品类、风格和使用场景，提供文案生成、文案诊断、客户跟单话术、文生图、视频包制作和精品模板等能力，帮助用户从内容构思、表单草稿、生成优化到后续复用形成完整工作链路。'],
    ['开发者工具', '开发者工具箱汇集编码转换、格式化、加密、网络、文本和图片等常用在线工具，强调快速、易用和浏览器端处理。'],
    ['图片压缩', '图片修改压缩是一款浏览器端在线图片处理工具，支持压缩、调整尺寸和格式转换，图片尽量在本地处理，适合日常上传、分享和网页优化。'],
    ['HEIC 转换', 'HEIC 转换工具可在浏览器本地将 HEIC、HEIF 和 WebP 转为 JPG 或 PNG。'],
    ['智能抠图', '智能抠图在浏览器中自动移除图片背景，适合人像和商品图快速换背景。'],
    ['多图拼接', '多图拼接支持在浏览器中组合多张图片并调整布局。'],
    ['证件水印', '证件水印工具支持为身份证、营业执照和合同截图添加用途水印，图片仅在浏览器本地处理。'],
    ['临时剪贴板', '临时剪贴板支持客户端加密、自动过期、读取次数限制和阅后即焚，适合跨设备传递临时文本。'],
    ['证件照', '证件照工作室是一款浏览器端证件照制作工具，支持本地智能抠图、背景换色、常用证件尺寸和 300DPI 多图拼版，照片无需上传到业务服务器。'],
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

    it('uses the canonical full tooltip for every corresponding tool', () => {
        for (const [name, tooltip] of canonicalTooltips) {
            const entry = `name: '${name}',`;
            const start = navbarSource.indexOf(entry);
            const end = navbarSource.indexOf('\n    },', start);
            expect(start, `${name} should be present`).toBeGreaterThan(-1);
            expect(navbarSource.slice(start, end), `${name} should use its canonical tooltip`).toContain(`tooltip: '${tooltip}'`);
        }
    });

    it('opens every link in the application in the current window', () => {
        expect(allVueSources).not.toContain('target=');
        expect(allVueSources).not.toContain('rel="noopener noreferrer"');
    });

    it('uses the specified CTA, PDF branding, and accessible menu tips', () => {
        expect(navbarSource).toContain("primary: true");
        expect(navbarSource).toContain("item.primary ? 'min-w-[72px] bg-blue-600 text-white hover:bg-blue-700'");
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

    it('omits the local-processing badge and keeps desktop menu labels on one line', () => {
        expect(navbarSource).not.toContain('文件尽量在本地处理');
        expect(navbarSource).not.toContain('所有 PDF 处理在浏览器本地完成');
        expect(navbarSource).toContain('whitespace-nowrap');
        expect(navbarSource).toContain('whitespace-normal');
    });

    it('matches the watermark navigation font and desktop control baseline', () => {
        expect(navbarSource).toContain("font-['Inter','PingFang_SC','Microsoft_YaHei',sans-serif]");
        expect(navbarSource).toContain('rounded-lg px-2 py-[7px] text-[13px] font-[650]');
        expect(navbarSource).not.toContain('py-2 text-sm font-semibold');
    });

    it('right-aligns every expanded mobile item at the 12px watermark baseline', () => {
        expect(navbarSource).toContain("['rounded-lg px-2 py-[7px] text-right text-[12px] font-[650]'");
        expect(navbarSource).toContain('<span class="block text-right">{{ item.name }}</span>');
        expect(navbarSource).toContain('<span class="mt-1 block text-right text-[12px] font-normal opacity-75">{{ item.tooltip }}</span>');
        expect(navbarSource).toContain('items-center justify-end');
    });

    it('names the mobile toggle 更多工具 and keeps its accessible name in sync with state', () => {
        expect(navbarSource).toContain('<span>更多工具</span>');
        expect(navbarSource).not.toContain('<span>菜单</span>');
        expect(navbarSource).toContain(":aria-label=\"mobileMenuOpen ? '关闭更多工具菜单' : '打开更多工具菜单'\"");
    });

    it('keeps the explicit mobile toggle from overflowing', () => {
        expect(navbarSource).toContain('inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap');
        expect(navbarSource).toContain('min-w-0');
        expect(navbarSource).toContain('overflow-x-hidden');
    });
});
