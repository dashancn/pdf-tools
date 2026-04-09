import { describe, it, expect } from 'vitest';
import { createSimplePdf, createTextPdf } from '@/__tests__/helpers/fixtures';

// pdfToText uses only pdfjs-dist text extraction — no canvas needed.
import { pdfToText } from '@/Services/pdf/pdfToText';

describe('pdfToText', () => {
    it('produces a text blob', async () => {
        const file = await createTextPdf(2, ['Hello world', 'Second page']);
        const result = await pdfToText(file);
        expect(result).toBeInstanceOf(Blob);
        expect((result as Blob).type).toBe('text/plain');
        expect((result as Blob).size).toBeGreaterThan(0);
    });

    it('contains the source text', async () => {
        const file = await createTextPdf(1, ['Text extraction test']);
        const result = await pdfToText(file);
        const text = await (result as Blob).text();
        expect(text).toContain('Text');
        expect(text).toContain('extraction');
    });

    it('separates pages with page break markers', async () => {
        const file = await createTextPdf(2, ['Page one text', 'Page two text']);
        const result = await pdfToText(file);
        const text = await (result as Blob).text();
        expect(text).toContain('--- Page break ---');
    });

    it('reports progress', async () => {
        const file = await createTextPdf(2, ['First', 'Second']);
        const values: number[] = [];
        await pdfToText(file, {}, (p) => values.push(p));
        expect(values.length).toBeGreaterThan(0);
        expect(values[values.length - 1]).toBe(100);
    });

    it('returns blob without options', async () => {
        const file = await createTextPdf(1, ['Simple test']);
        const result = await pdfToText(file);
        expect(result).toBeInstanceOf(Blob);
    });
});
