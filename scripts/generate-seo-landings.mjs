import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://pdf.i41.cn';

function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
}

function escapeJsonForHtml(value) {
    return JSON.stringify(value).replaceAll('<', '\\u003c');
}

export function readToolInventory(root) {
    const home = readFileSync(join(root, 'resources/js/Pages/Home.vue'), 'utf8');
    const locale = JSON.parse(readFileSync(join(root, 'lang/zh-CN.json'), 'utf8'));
    const slugs = [...home.matchAll(/\{\s*slug:\s*'([^']+)'/g)].map(match => match[1]);

    if (slugs.length !== 40 || new Set(slugs).size !== 40) {
        throw new Error(`Expected exactly 40 unique Home.vue tool slugs, found ${slugs.length}`);
    }

    return slugs.map(slug => {
        const name = locale[`tools.${slug}.name`];
        const sourceDescription = locale[`tools.${slug}.description`];
        if (typeof name !== 'string' || typeof sourceDescription !== 'string') {
            throw new Error(`Missing zh-CN name or description for ${slug}`);
        }
        return {
            slug,
            name,
            sourceDescription,
            description: `${name}工具入口。点击“打开工具”后进入浏览器应用；实际 PDF 处理在应用中本地进行，文件无需上传。`,
        };
    });
}

function pageShell({ title, description, canonical, body, structuredData }) {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE}/og-image.svg">
  <meta property="og:locale" content="zh_CN">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <script type="application/ld+json">${escapeJsonForHtml(structuredData)}</script>
  <style>
    :root{color-scheme:light dark;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}body{margin:0;background:#f8fafc;color:#172033}main{max-width:760px;margin:0 auto;padding:64px 24px}nav a{color:#315b8a}article{margin-top:28px;padding:32px;border:1px solid #dbe3ec;border-radius:20px;background:#fff;box-shadow:0 12px 35px rgba(30,58,95,.08)}h1{font-size:clamp(2rem,6vw,3.25rem);margin:.25em 0}p{font-size:1.08rem;line-height:1.8;color:#526070}.button{display:inline-block;margin-top:14px;padding:13px 22px;border-radius:12px;background:#1e3a5f;color:#fff;text-decoration:none;font-weight:700}.directory{columns:2;line-height:2}@media(max-width:580px){main{padding:32px 16px}.directory{columns:1}}@media(prefers-color-scheme:dark){body{background:#111827;color:#f3f4f6}article{background:#1f2937;border-color:#374151}p{color:#cbd5e1}nav a,.directory a{color:#93c5fd}}
  </style>
</head>
<body>
${body}
</body>
</html>
`;
}

function toolPage(tool) {
    const canonical = `${SITE}/tools/${tool.slug}/`;
    const title = `${tool.name} - 免费 PDF 工具入口 | PDF 工具箱`;
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: tool.name,
        url: canonical,
        description: tool.description,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        browserRequirements: '需要启用 JavaScript',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
    };
    const body = `  <main>
    <nav aria-label="面包屑"><a href="/">PDF 工具箱</a> / <a href="/tools/">工具目录</a></nav>
    <article>
      <p>PDF 工具箱</p>
      <h1>${escapeHtml(tool.name)}</h1>
      <p>${escapeHtml(tool.description)}</p>
      <a class="button" href="/#/${tool.slug}">打开工具</a>
    </article>
  </main>`;
    return pageShell({ title, description: tool.description, canonical, body, structuredData });
}

function directoryPage(tools) {
    const canonical = `${SITE}/tools/`;
    const title = 'PDF 工具目录 - 40 个免费在线 PDF 工具';
    const description = '浏览 PDF 工具箱的 40 个工具入口，并打开所需的浏览器端 PDF 应用。';
    const links = tools.map(tool => `        <li><a href="/tools/${tool.slug}/">${escapeHtml(tool.name)}</a></li>`).join('\n');
    const body = `  <main>
    <nav><a href="/">PDF 工具箱首页</a></nav>
    <article>
      <h1>PDF 工具目录</h1>
      <p>${description}</p>
      <ul class="directory">
${links}
      </ul>
    </article>
  </main>`;
    return pageShell({
        title,
        description,
        canonical,
        body,
        structuredData: { '@context': 'https://schema.org', '@type': 'ItemList', name: 'PDF 工具目录', numberOfItems: tools.length },
    });
}

export function generateSeoLandings({ root, output }) {
    const tools = readToolInventory(root);
    mkdirSync(join(output, 'tools'), { recursive: true });
    writeFileSync(join(output, 'tools/index.html'), directoryPage(tools));

    for (const tool of tools) {
        const target = join(output, 'tools', tool.slug, 'index.html');
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, toolPage(tool));
    }

    const sourceSitemap = join(root, 'public/sitemap.xml');
    const targetSitemap = join(output, 'sitemap.xml');
    if (resolve(sourceSitemap) !== resolve(targetSitemap)) cpSync(sourceSitemap, targetSitemap);
    let sitemap = readFileSync(targetSitemap, 'utf8');
    sitemap = sitemap.replace(/\s*<url>\s*<loc>https:\/\/pdf\.i41\.cn\/tools\/[^<]+<\/loc>[\s\S]*?<\/url>/g, '');
    const entries = tools.map(tool => `    <url>\n        <loc>${SITE}/tools/${tool.slug}/</loc>\n        <changefreq>monthly</changefreq>\n        <priority>0.8</priority>\n    </url>`).join('\n');
    sitemap = sitemap.replace('</urlset>', `${entries}\n</urlset>`);
    writeFileSync(targetSitemap, sitemap);

    return tools;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
    const output = resolve(root, process.argv[2] ?? 'dist');
    const tools = generateSeoLandings({ root, output });
    console.log(`Generated ${tools.length} SEO tool landings in ${output}`);
}
