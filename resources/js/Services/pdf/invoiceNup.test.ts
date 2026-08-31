import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { PDFDocument, PDFPage, StandardFonts, degrees, rgb } from 'pdf-lib';
import {
    A4_PORTRAIT,
    calculateInvoiceCells,
    calculateInvoicePlacement,
    invoiceNupPdf,
} from '@/Services/pdf/invoiceNup';
import { createSimplePdf } from '@/__tests__/helpers/fixtures';
import { expectDefaultMetadata, expectValidPdf } from '@/__tests__/helpers/assertions';

const INVOICE_TRANSLATION_KEYS = [
    'tools.invoice-nup.name',
    'tools.invoice-nup.description',
    'tool.invoice_nup.action',
    'tool.invoice_nup.layout',
    'tool.invoice_nup.layout_2',
    'tool.invoice_nup.layout_4',
    'tool.invoice_nup.margin',
    'tool.invoice_nup.gap',
    'tool.invoice_nup.auto_rotate',
    'tools.invoice-nup.how_title',
    'tools.invoice-nup.how_text',
    'tools.invoice-nup.step_1',
    'tools.invoice-nup.step_2',
    'tools.invoice-nup.step_3',
    'tools.invoice-nup.faq_1_q',
    'tools.invoice-nup.faq_1_a',
    'tools.invoice-nup.faq_2_q',
    'tools.invoice-nup.faq_2_a',
    'tools.invoice-nup.faq_3_q',
    'tools.invoice-nup.faq_3_a',
] as const;

async function createSizedPdf(
    pages: { width: number; height: number; label: string; rotation?: 0 | 90 | 180 | 270 }[],
    name: string,
): Promise<File> {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    for (const item of pages) {
        const page = doc.addPage([item.width, item.height]);
        if (item.rotation) page.setRotation(degrees(item.rotation));
        page.drawText(item.label, { x: 20, y: item.height - 30, size: 12, font, color: rgb(0, 0, 0) });
    }
    const bytes = await doc.save({ useObjectStreams: false });
    return new File([bytes.slice().buffer], name, { type: 'application/pdf' });
}

describe('calculateInvoicePlacement', () => {
    it('fits and centers a page without changing its aspect ratio', () => {
        const placement = calculateInvoicePlacement(
            { width: 200, height: 100 },
            { x: 10, y: 20, width: 300, height: 200 },
            false,
        );

        expect(placement).toEqual({
            x: 10,
            y: 45,
            width: 300,
            height: 150,
            scale: 1.5,
            rotation: 0,
        });
    });

    it('rotates a landscape page when that produces a larger readable fit', () => {
        const placement = calculateInvoicePlacement(
            { width: 400, height: 200 },
            { x: 0, y: 0, width: 200, height: 300 },
            true,
        );

        expect(placement.rotation).toBe(90);
        expect(placement.scale).toBe(0.75);
        expect(placement.width).toBe(150);
        expect(placement.height).toBe(300);
        expect(placement.x).toBe(25);
        expect(placement.y).toBe(0);
    });
});

describe('calculateInvoiceCells', () => {
    it('creates two vertical cells on portrait A4 using margin and gap', () => {
        expect(calculateInvoiceCells(2, 20, 10)).toEqual([
            { x: 20, y: 425.945, width: 555.28, height: 395.945 },
            { x: 20, y: 20, width: 555.28, height: 395.945 },
        ]);
    });

    it('creates a row-major two-by-two grid for four-up layout', () => {
        expect(calculateInvoiceCells(4, 20, 10)).toEqual([
            { x: 20, y: 425.945, width: 272.64, height: 395.945 },
            { x: 302.64, y: 425.945, width: 272.64, height: 395.945 },
            { x: 20, y: 20, width: 272.64, height: 395.945 },
            { x: 302.64, y: 20, width: 272.64, height: 395.945 },
        ]);
    });

    it('rejects unsafe spacing that leaves no drawable area', () => {
        expect(() => calculateInvoiceCells(4, 300, 10)).toThrow('Margin and gap leave no room for invoice pages');
    });
});

describe('invoice n-up integration', () => {
    it('provides every invoice option and help translation in every shipped locale', () => {
        const locales = ['en', 'it', 'es', 'fr', 'de', 'pt', 'nl', 'sv', 'fi', 'da', 'no', 'be', 'el', 'sl', 'cs', 'zh-CN'];

        for (const locale of locales) {
            const messages = JSON.parse(readFileSync(resolve(process.cwd(), `lang/${locale}.json`), 'utf8')) as Record<string, string>;
            expect(INVOICE_TRANSLATION_KEYS.filter((key) => !messages[key]), locale).toEqual([]);
        }
    });
});

describe('invoiceNupPdf', () => {
    it('places pages from all input PDFs in order on portrait A4 sheets', async () => {
        const first = await createSizedPdf([
            { width: 300, height: 150, label: 'FIRST' },
            { width: 200, height: 400, label: 'SECOND' },
        ], 'first.pdf');
        const second = await createSizedPdf([
            { width: 400, height: 200, label: 'THIRD' },
        ], 'second.pdf');

        const result = await invoiceNupPdf([first, second], { layout: 2, margin: 20, gap: 10, autoRotate: false });
        const doc = await expectValidPdf(result, 2);

        expectDefaultMetadata(doc, 'invoice n-up pdf');
        for (const page of doc.getPages()) {
            expect(page.getWidth()).toBeCloseTo(A4_PORTRAIT.width, 2);
            expect(page.getHeight()).toBeCloseTo(A4_PORTRAIT.height, 2);
        }

        const resources = doc.getPages().map((page) => page.node.Resources()?.toString() ?? '');
        expect(resources[0]).toContain('/XObject');
        expect(resources[1]).toContain('/XObject');
    });

    it('supports four-up layout with a partial final sheet', async () => {
        const file = await createSimplePdf(5);
        const result = await invoiceNupPdf([file], { layout: 4 });
        await expectValidPdf(result, 2);
    });

    it('draws auto-rotated pages inside the calculated placement bounds', async () => {
        const file = await createSizedPdf([
            { width: 200, height: 400, label: 'PORTRAIT' },
        ], 'portrait.pdf');
        const drawPage = vi.spyOn(PDFPage.prototype, 'drawPage');

        try {
            await invoiceNupPdf([file], { layout: 2, margin: 20, gap: 10, autoRotate: true });

            const cell = calculateInvoiceCells(2, 20, 10)[0];
            const placement = calculateInvoicePlacement({ width: 200, height: 400 }, cell, true);
            expect(placement.rotation).toBe(90);
            expect(drawPage).toHaveBeenCalledOnce();
            expect(drawPage.mock.calls[0][1]).toMatchObject({
                x: placement.x + placement.width,
                y: placement.y,
                width: placement.height,
                height: placement.width,
                rotate: degrees(90),
            });
        } finally {
            drawPage.mockRestore();
        }
    });

    it('honors source page rotation when calculating fit', async () => {
        const file = await createSizedPdf([
            { width: 200, height: 400, label: 'ROTATED', rotation: 90 },
        ], 'rotated.pdf');
        const drawPage = vi.spyOn(PDFPage.prototype, 'drawPage');

        try {
            await invoiceNupPdf([file], { layout: 2, margin: 20, gap: 10, autoRotate: false });

            const cell = calculateInvoiceCells(2, 20, 10)[0];
            const expected = calculateInvoicePlacement({ width: 400, height: 200 }, cell, false);
            expect(drawPage).toHaveBeenCalledOnce();
            expect(drawPage.mock.calls[0][1]).toMatchObject({
                x: expected.x + expected.width,
                y: expected.y,
                width: expected.height,
                height: expected.width,
                rotate: degrees(90),
            });
        } finally {
            drawPage.mockRestore();
        }
    });

    it('reports monotonic progress ending at 100', async () => {
        const file = await createSimplePdf(5);
        const progress: number[] = [];

        await invoiceNupPdf([file], { layout: 2 }, (value) => progress.push(value));

        expect(progress.length).toBe(5);
        expect(progress.at(-1)).toBe(100);
        expect(progress.every((value, index) => index === 0 || value >= progress[index - 1])).toBe(true);
    });

    it('rejects an empty input list', async () => {
        await expect(invoiceNupPdf([], { layout: 2 })).rejects.toThrow('No PDF files provided');
    });

    it('rejects invalid PDF input with a clear file name', async () => {
        const invalid = new File(['not a pdf'], 'broken.pdf', { type: 'application/pdf' });
        await expect(invoiceNupPdf([invalid], { layout: 2 })).rejects.toThrow('Unable to read broken.pdf as a PDF');
    });
});
