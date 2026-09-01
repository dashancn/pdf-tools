import { beforeEach, describe, it, expect, vi } from 'vitest';
import { createTextPdf } from '@/__tests__/helpers/fixtures';

const recognize = vi.fn(async () => ({ data: { text: '中文 OCR 结果' } }));
const terminate = vi.fn(async () => {});
const createWorker = vi.fn(async () => ({ recognize, terminate }));

vi.mock('@/Services/pdfUtils', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/Services/pdfUtils')>();
    const { MockCanvas, mockCanvasToBlob } = await import('@/__tests__/helpers/canvasMock');
    return {
        ...actual,
        createCanvas: (w: number, h: number) => new MockCanvas(w, h),
        canvasToBlob: mockCanvasToBlob,
    };
});

vi.mock('tesseract.js', () => ({ createWorker }));

import { pdfToText } from '@/Services/pdf/pdfToText';

describe('pdfToText', () => {
    beforeEach(() => {
        recognize.mockClear();
        terminate.mockClear();
        createWorker.mockClear();
    });

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

    it('uses OCR output whenever OCR is enabled, even if a text layer exists', async () => {
        const file = await createTextPdf(1, ['Broken encoded text layer']);
        const result = await pdfToText(file, { ocr: true, ocrLanguage: 'chi_sim' });
        const text = await (result as Blob).text();

        expect(createWorker).toHaveBeenCalledWith(
            'chi_sim',
            undefined,
            expect.objectContaining({
                workerPath: expect.stringContaining('cdn.jsdelivr.net'),
            }),
        );
        expect(recognize).toHaveBeenCalledOnce();
        expect(text).toContain('中文 OCR 结果');
        expect(text).not.toContain('Broken encoded text layer');
    });
});
