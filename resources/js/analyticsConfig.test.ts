import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

const analyticsOrigin = 'https://stats.i41.cn';
const analyticsScript = `${analyticsOrigin}/analytics.js`;
const excludedAnalyticsData = ['文件', '文件名', 'OCR 内容', '用户输入', '永久标识'];

describe('i41 anonymous analytics disclosure', () => {
    it('loads the i41 analytics script with the PDF site identifier', () => {
        const index = read('index.html');

        expect(index).toContain(`data-i41-site="pdf"`);
        expect(index).toContain(`src="${analyticsScript}"`);
    });

    it('allows i41 analytics while retaining Cloudflare Web Analytics in CSP', () => {
        for (const policy of [read('index.html'), read('public/_headers')]) {
            expect(policy).toMatch(/script-src[^;]*https:\/\/stats\.i41\.cn/);
            expect(policy).toMatch(/script-src[^;]*https:\/\/static\.cloudflareinsights\.com/);
            expect(policy).toMatch(/connect-src[^;\n]*https:\/\/stats\.i41\.cn/);
            expect(policy).toMatch(/connect-src[^;\n]*https:\/\/cloudflareinsights\.com/);
        }
    });

    it('documents anonymous metrics without weakening local file privacy', () => {
        const disclosures = [
            read('README.md'),
            read('resources/js/Pages/Privacy.vue'),
            read('wsg-report/WSG.md'),
            read('wsg-report/wsg-compliance.json'),
        ];

        for (const disclosure of disclosures) {
            expect(disclosure).toMatch(/匿名/);
            expect(disclosure).toMatch(/访问/);
            expect(disclosure).toMatch(/性能/);
            expect(disclosure).toMatch(/UTM/);
            expect(disclosure).toMatch(/跨站点击/);
            expect(disclosure).toMatch(/本地/);
            for (const excluded of excludedAnalyticsData) {
                expect(disclosure).toContain(excluded);
            }
        }

        expect(read('README.md')).not.toContain('不加载广告或分析脚本');
        expect(read('lang/zh-CN.json')).not.toContain('我们不收集个人数据。仅在您的设备本地保存以下偏好');
        expect(read('wsg-report/WSG.md')).not.toContain('No advertising or analytics scripts are loaded');
        expect(read('wsg-report/wsg-compliance.json')).not.toContain('No advertising or analytics scripts are loaded');
    });
});
