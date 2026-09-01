import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { tesseractWorkerOptions } from '@/Services/tesseractConfig';

describe('Tesseract browser configuration', () => {
    it('uses only same-origin OCR assets', () => {
        const options = tesseractWorkerOptions();
        expect(options.workerPath).toBe('/ocr/worker.min.js');
        expect(options.corePath).toBe('/ocr/core');
        expect(options.langPath).toBe('/ocr/lang');
    });

    it('caches self-hosted OCR assets as immutable files', () => {
        const headers = readFileSync('public/_headers', 'utf8');
        expect(headers).toContain('/ocr/*');
        expect(headers).toContain('Cache-Control: public, max-age=31536000, immutable');
    });
});
