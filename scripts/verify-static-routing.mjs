import assert from 'node:assert/strict';
import { accessSync, constants, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer-core';
import { readToolInventory } from './generate-seo-landings.mjs';

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:4173';
const root = resolve(import.meta.dirname, '..');
const tools = readToolInventory(root);
assert.equal(tools.length, 40, 'Expected exactly 40 static tool landings');
assert.equal(new Set(tools.map(({ slug }) => slug)).size, 40, 'Tool landing slugs must be unique');
const emittedSlugs = readdirSync(resolve(root, 'dist/tools'), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
assert.deepEqual(emittedSlugs, tools.map(({ slug }) => slug).sort(), 'dist/tools must contain exactly the 40 inventory landings');

const chromiumCandidates = [
    process.env.CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/snap/bin/chromium',
    '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome',
].filter(Boolean);
const chromium = chromiumCandidates.find(candidate => {
    try { accessSync(candidate, constants.X_OK); return true; } catch { return false; }
});
if (!chromium) throw new Error(`No Chromium executable found. Set CHROME_PATH. Tried: ${chromiumCandidates.join(', ')}`);

async function fetchRoute(path, expectedStatus, marker) {
    const response = await fetch(`${baseUrl}${path}`, { redirect: 'manual' });
    const body = await response.text();
    assert.equal(response.status, expectedStatus, `${path} returned ${response.status}`);
    if (marker) assert.match(body, marker, `${path} did not contain ${marker}`);
    return { path, status: response.status };
}

const results = [];
results.push(await fetchRoute('/', 200, /data-i41-site="pdf"/));
results.push(await fetchRoute('/tools/', 200, /PDF 工具目录/));
for (const { slug } of tools) {
    results.push(await fetchRoute(`/tools/${slug}/`, 200, new RegExp(`href="/#/${slug}"`)));
}
results.push(await fetchRoute('/assets/does-not-exist.js', 404));
results.push(await fetchRoute(`/unknown-${Date.now()}`, 404, /noindex, nofollow/));
const indexHtml = readFileSync(resolve(root, 'dist/index.html'), 'utf8');
const assetPaths = [...indexHtml.matchAll(/(?:src|href)=["'](?:\.\/|\/)(assets\/[^"']+)["']/g)].map(match => `/${match[1]}`);
assert.ok(assetPaths.length >= 2, 'Expected built JavaScript and CSS assets in index.html');
for (const assetPath of assetPaths) results.push(await fetchRoute(assetPath, 200));

const browser = await puppeteer.launch({
    executablePath: chromium,
    headless: true,
    // The routing suite handles only trusted local build output. Root-run CI
    // containers require Chromium's sandbox to be disabled.
    args: process.getuid?.() === 0 ? ['--no-sandbox', '--disable-setuid-sandbox'] : [],
});
try {
    // Disable JavaScript for static-document hard refreshes. This verifies the
    // server response itself without allowing the homepage PWA worker to
    // intercept subsequent routes.
    const staticPage = await browser.newPage();
    await staticPage.setJavaScriptEnabled(false);
    async function hardRefreshStatic(path, marker) {
        const response = await staticPage.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
        assert.equal(response?.status(), 200, `${path} browser navigation failed`);
        const refresh = await staticPage.reload({ waitUntil: 'domcontentloaded' });
        assert.ok([200, 304].includes(refresh?.status()), `${path} browser hard refresh returned ${refresh?.status()}`);
        assert.match(await staticPage.content(), marker, `${path} browser marker missing`);
    }

    await hardRefreshStatic('/', /data-i41-site="pdf"/);
    await hardRefreshStatic('/tools/', /PDF 工具目录/);
    for (const { slug } of tools) {
        await hardRefreshStatic(`/tools/${slug}/`, new RegExp(`href="/#/${slug}"`));
    }
    await staticPage.close();

    const spaPage = await browser.newPage();
    const response = await spaPage.goto(`${baseUrl}/#/merge-pdf`, { waitUntil: 'domcontentloaded' });
    assert.ok([200, 304].includes(response?.status()));
    const refresh = await spaPage.reload({ waitUntil: 'domcontentloaded' });
    assert.ok([200, 304].includes(refresh?.status()));
    assert.equal(await spaPage.evaluate(() => location.hash), '#/merge-pdf');
    await spaPage.waitForSelector('h1');
    assert.match(await spaPage.$eval('h1', element => element.textContent ?? ''), /合并|Merge/i);
} finally {
    await browser.close();
}

console.log(`Verified ${results.length} HTTP routes plus SPA and landing browser loads.`);
