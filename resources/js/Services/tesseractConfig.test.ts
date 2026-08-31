import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TESSERACT_DATA_ORIGIN, TESSERACT_LANG_PATH, TESSERACT_WORKER_PATH } from '@/Services/tesseractConfig';


describe('Tesseract browser configuration', () => {
    it('uses explicit CDN paths that are permitted by the production CSP', () => {
        expect(TESSERACT_WORKER_PATH).toContain('cdn.jsdelivr.net');
        expect(TESSERACT_LANG_PATH).toContain('tessdata.projectnaptha.com');

        const headers = readFileSync('public/_headers', 'utf8');
        expect(headers).toContain("script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net");
        expect(headers).toContain(`connect-src 'self' https://cdn.jsdelivr.net ${TESSERACT_DATA_ORIGIN}`);
        expect(headers).toContain("worker-src 'self' blob: https://cdn.jsdelivr.net");
    });
});
