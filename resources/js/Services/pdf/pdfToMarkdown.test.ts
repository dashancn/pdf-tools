import { describe, it, expect } from 'vitest';
import { createSimplePdf, createTextPdf } from '@/__tests__/helpers/fixtures';

// pdfToMarkdown uses only pdfjs-dist text extraction — no canvas needed.
import { pdfToMarkdown } from '@/Services/pdf/pdfToMarkdown';

describe('pdfToMarkdown', () => {
    it('produces a Markdown blob', async () => {
        const file = await createTextPdf(2, ['Hello world', 'Second page']);
        const result = await pdfToMarkdown(file);
        expect(result).toBeInstanceOf(Blob);
        expect((result as Blob).type).toBe('text/markdown');
        expect((result as Blob).size).toBeGreaterThan(0);
    });

    it('contains the source text', async () => {
        const file = await createTextPdf(1, ['Markdown conversion test']);
        const result = await pdfToMarkdown(file);
        const text = await (result as Blob).text();
        expect(text).toContain('Markdown');
        expect(text).toContain('conversion');
    });

    it('separates pages with horizontal rules', async () => {
        const file = await createTextPdf(2, ['Page one text', 'Page two text']);
        const result = await pdfToMarkdown(file);
        const text = await (result as Blob).text();
        expect(text).toContain('---');
    });

    it('reports progress', async () => {
        const file = await createTextPdf(2, ['First', 'Second']);
        const values: number[] = [];
        await pdfToMarkdown(file, {}, (p) => values.push(p));
        expect(values.length).toBeGreaterThan(0);
        expect(values[values.length - 1]).toBe(100);
    });

    it('throws on empty PDF with no text', async () => {
        const file = await createSimplePdf(0);
        await expect(pdfToMarkdown(file)).rejects.toThrow();
    });
});
