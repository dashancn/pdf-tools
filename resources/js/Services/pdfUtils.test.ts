import { describe, expect, it, vi } from 'vitest';

const { getDocument } = vi.hoisted(() => ({
    getDocument: vi.fn(() => ({ promise: Promise.resolve({ numPages: 1 }) })),
}));

vi.mock('pdfjs-dist', () => ({
    GlobalWorkerOptions: { workerSrc: '' },
    getDocument,
}));

import { getPdfjsDocument } from '@/Services/pdfUtils';

describe('getPdfjsDocument', () => {
    it('provides bundled PDF.js resources for Chinese rendering', async () => {
        await getPdfjsDocument({ data: new Uint8Array([1]) });

        expect(getDocument).toHaveBeenCalledWith(expect.objectContaining({
            cMapUrl: expect.stringMatching(/^https?:\/\/[^/]+\/pdfjs\/cmaps\/$/),
            cMapPacked: true,
            standardFontDataUrl: expect.stringMatching(/^https?:\/\/[^/]+\/pdfjs\/standard_fonts\/$/),
            wasmUrl: expect.stringMatching(/^https?:\/\/[^/]+\/pdfjs\/wasm\/$/),
            disableFontFace: true,
        }));
    });
});
