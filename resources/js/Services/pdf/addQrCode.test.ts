import { describe, it, expect } from 'vitest';
import { addQrCode } from '@/Services/pdf/addQrCode';
import { createSimplePdf } from '@/__tests__/helpers/fixtures';
import { expectValidPdf, expectDefaultMetadata } from '@/__tests__/helpers/assertions';
import QRCode from 'qrcode';

describe('addQrCode', () => {
    async function makeQrDataUrl(text = 'https://example.com'): Promise<string> {
        return QRCode.toDataURL(text, { width: 256, margin: 1, errorCorrectionLevel: 'M' });
    }

    it('embeds a QR code into a PDF', async () => {
        const file = await createSimplePdf(1);
        const pngDataUrl = await makeQrDataUrl();
        const result = await addQrCode(file, {
            pageIndex: 0,
            x: 50,
            y: 50,
            size: 100,
            pngDataUrl,
        });
        const doc = await expectValidPdf(result, 1);
        expectDefaultMetadata(doc, 'add qr code');
    });

    it('throws on out-of-bounds page index', async () => {
        const file = await createSimplePdf(1);
        const pngDataUrl = await makeQrDataUrl();
        await expect(addQrCode(file, {
            pageIndex: 5,
            x: 50,
            y: 50,
            size: 100,
            pngDataUrl,
        })).rejects.toThrow('out of bounds');
    });

    it('throws when pngDataUrl is missing', async () => {
        const file = await createSimplePdf(1);
        await expect(addQrCode(file, {
            pageIndex: 0,
            x: 50,
            y: 50,
            size: 100,
            pngDataUrl: '',
        })).rejects.toThrow('required');
    });

    it('reports progress', async () => {
        const file = await createSimplePdf(2);
        const pngDataUrl = await makeQrDataUrl();
        const values: number[] = [];
        await addQrCode(file, {
            pageIndex: 1,
            x: 100,
            y: 100,
            size: 80,
            pngDataUrl,
        }, (p) => values.push(p));
        expect(values.length).toBeGreaterThan(0);
        expect(values[values.length - 1]).toBe(100);
    });

    it('works on multi-page PDFs targeting different pages', async () => {
        const file = await createSimplePdf(5);
        const pngDataUrl = await makeQrDataUrl('test data');
        const result = await addQrCode(file, {
            pageIndex: 3,
            x: 200,
            y: 300,
            size: 150,
            pngDataUrl,
        });
        await expectValidPdf(result, 5);
    });

    it('adds QR code to all pages when allPages is true', async () => {
        const file = await createSimplePdf(4);
        const pngDataUrl = await makeQrDataUrl('all pages');
        const result = await addQrCode(file, {
            pageIndex: 0,
            x: 50,
            y: 50,
            size: 80,
            pngDataUrl,
            allPages: true,
        });
        const doc = await expectValidPdf(result, 4);
        expectDefaultMetadata(doc, 'add qr code');
    });

    it('skips page index validation when allPages is true', async () => {
        const file = await createSimplePdf(2);
        const pngDataUrl = await makeQrDataUrl('test');
        // pageIndex out of range but allPages=true should not throw
        const result = await addQrCode(file, {
            pageIndex: 99,
            x: 50,
            y: 50,
            size: 80,
            pngDataUrl,
            allPages: true,
        });
        await expectValidPdf(result, 2);
    });
});
