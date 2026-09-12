import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateSeoLandings, readToolInventory } from '../../scripts/generate-seo-landings.mjs';

const root = resolve(__dirname, '../..');
const expectedSlugs = [
    'merge-pdf', 'split-pdf', 'organize-pdf', 'rotate-pdf', 'reverse-pages',
    'add-blank-page', 'remove-blank-pages', 'crop-pdf', 'resize-pdf', 'nup-pdf',
    'invoice-nup', 'booklet-pdf', 'pdf-to-jpg', 'pdf-to-png', 'pdf-to-webp',
    'pdf-to-text', 'pdf-to-markdown', 'pdf-to-epub', 'jpg-to-pdf', 'text-to-pdf',
    'markdown-to-pdf', 'watermark-pdf', 'page-numbers', 'header-footer', 'sign-pdf',
    'edit-pdf', 'add-qr-code', 'edit-metadata', 'compress-pdf', 'flatten-pdf',
    'grayscale-pdf', 'invert-colors', 'repair-pdf', 'redact-pdf', 'protect-pdf',
    'unlock-pdf', 'ocr-pdf', 'compare-pdf', 'extract-images', 'check-accessibility',
];

describe('static SEO tool landings', () => {
    it('derives the exact 40 Home.vue slugs and zh-CN labels', () => {
        const tools = readToolInventory(root);

        expect(tools.map(tool => tool.slug)).toEqual(expectedSlugs);
        expect(tools).toHaveLength(40);
        for (const tool of tools) {
            expect(tool.name).toBeTruthy();
            expect(tool.description).toBeTruthy();
            expect(tool.name).not.toMatch(/^tools\./);
        }
    });

    it('generates an index and one crawlable, analytics-free landing per tool', () => {
        const output = mkdtempSync(join(tmpdir(), 'pdf-seo-'));
        generateSeoLandings({ root, output });

        const index = readFileSync(join(output, 'tools/index.html'), 'utf8');
        for (const slug of expectedSlugs) {
            expect(index).toContain(`href="/tools/${slug}/"`);
            const html = readFileSync(join(output, `tools/${slug}/index.html`), 'utf8');
            expect(html).toContain(`<link rel="canonical" href="https://pdf.i41.cn/tools/${slug}/">`);
            expect(html).toContain('<h1>');
            expect(html).toContain('"@type":"WebApplication"');
            expect(html).toContain(`href="/#/${slug}"`);
            expect(html).toContain('打开工具');
            expect(html).not.toContain('stats.i41.cn');
            expect(html).not.toContain('analytics.js');
        }
    });

    it('adds all 40 clean landing URLs to the existing sitemap', () => {
        const output = mkdtempSync(join(tmpdir(), 'pdf-seo-'));
        generateSeoLandings({ root, output });
        const sitemap = readFileSync(join(output, 'sitemap.xml'), 'utf8');

        expect(sitemap).toContain('<loc>https://pdf.i41.cn/</loc>');
        expect(sitemap).toContain('<loc>https://pdf.i41.cn/#/blog</loc>');
        for (const slug of expectedSlugs) {
            expect(sitemap).toContain(`<loc>https://pdf.i41.cn/tools/${slug}/</loc>`);
        }
        expect((sitemap.match(/https:\/\/pdf\.i41\.cn\/tools\/[^<]+\//g) ?? [])).toHaveLength(40);
    });

    it('wires generation into production build and links the directory from the SPA', () => {
        const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
        const footer = readFileSync(join(root, 'resources/js/Components/Layout/Footer.vue'), 'utf8');

        expect(packageJson.scripts.build).toContain('generate-seo-landings.mjs');
        expect(footer).toContain('href="/tools/"');
        expect(footer).toContain('PDF 工具目录');
    });

    it('lets Cloudflare return a noindex 404 instead of rewriting unknown paths to the SPA', () => {
        const redirects = readFileSync(join(root, 'public/_redirects'), 'utf8');
        const notFound = readFileSync(join(root, 'public/404.html'), 'utf8');

        expect(redirects).not.toMatch(/^\/\*\s+\/index\.html\s+200\s*$/m);
        expect(notFound).toContain('<meta name="robots" content="noindex, nofollow">');
        expect(notFound).toContain('404');
        expect(notFound).toContain('href="/"');
    });

    it('includes a production-like Cloudflare routing browser test', () => {
        const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
        const runner = readFileSync(join(root, 'scripts/run-routing-tests.mjs'), 'utf8');
        const routingTest = readFileSync(join(root, 'scripts/verify-static-routing.mjs'), 'utf8');

        expect(packageJson.scripts['test:routing']).toContain('npm run build');
        expect(packageJson.scripts['test:routing']).toContain('run-routing-tests.mjs');
        expect(runner).toContain("['wrangler', 'pages', 'dev', 'dist'");
        expect(runner).toContain('verify-static-routing.mjs');
        expect(routingTest).toContain("'/tools/'");
        expect(routingTest).toContain('readToolInventory');
        expect(routingTest).toContain('Expected exactly 40 static tool landings');
        expect(routingTest).toContain('puppeteer');
        expect(routingTest).toContain('.reload');
        expect(routingTest).toContain('404');
    });
});
