import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { tesseractWorkerOptions } from '@/Services/tesseractConfig';

describe('Tesseract browser configuration', () => {
    it('uses absolute same-origin OCR asset URLs inside nested workers', () => {
        vi.stubGlobal('location', { origin: 'https://pdf.i41.cn' });
        const options = tesseractWorkerOptions();
        expect(options.workerPath).toBe('https://pdf.i41.cn/ocr/worker.min.js');
        expect(options.corePath).toBe('https://pdf.i41.cn/ocr/core');
        expect(options.langPath).toBe('https://pdf.i41.cn/ocr/lang');
        vi.unstubAllGlobals();
    });

    it('allows WebAssembly compilation required by Tesseract Core', () => {
        const headers = readFileSync('public/_headers', 'utf8');
        const index = readFileSync('index.html', 'utf8');
        expect(headers).toContain("script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'");
        expect(index).toContain("script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'");
    });

    it('caches self-hosted OCR assets as immutable files', () => {
        const headers = readFileSync('public/_headers', 'utf8');
        expect(headers).toContain('/ocr/*');
        expect(headers).toContain('Cache-Control: public, max-age=31536000, immutable');
    });
});
