import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('PDF.js worker font loading', () => {
    it('binds embedded PDF fonts before raster tools render pages', () => {
        const source = readFileSync('resources/js/Services/pdfUtils.ts', 'utf8');
        expect(source).toContain('async bind(font: any)');
        expect(source).toContain('font.createNativeFontFace');
        expect(source).toContain('await nativeFontFace.loaded');
        expect(source).toContain('opts.FontLoader = WorkerFontLoader');
    });
});
