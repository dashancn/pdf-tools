import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TESSERACT_WORKER_PATH, tesseractWorkerOptions } from '@/Services/tesseractConfig';

describe('Tesseract browser configuration', () => {
    it('uses a permitted worker CDN and lets Tesseract choose compact language packs', () => {
        expect(TESSERACT_WORKER_PATH).toContain('cdn.jsdelivr.net');
        expect(tesseractWorkerOptions()).not.toHaveProperty('langPath');

        const headers = readFileSync('public/_headers', 'utf8');
        expect(headers).toContain("script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net");
        expect(headers).toContain("connect-src 'self' https://cdn.jsdelivr.net");
        expect(headers).toContain("worker-src 'self' blob: https://cdn.jsdelivr.net");
    });
});
