import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import {
    formatFileSize,
    loadPdf,
    savePdfAsBlob,
    stampDefaultMetadata,
    stripJsActions,
    stripDocumentJsActions,
    MAX_PDF_PAGES,
    MAX_IMAGE_DIMENSION,
} from '@/Services/pdfUtils';
import { PDFName, PDFArray, PDFDict, PDFPage } from 'pdf-lib';
import { createSimplePdf } from '@/__tests__/helpers/fixtures';

describe('formatFileSize', () => {
    it('formats 0 bytes', () => {
        expect(formatFileSize(0)).toBe('0 B');
    });

    it('formats bytes without decimals', () => {
        expect(formatFileSize(512)).toBe('512 B');
    });

    it('formats exactly 1 KB', () => {
        expect(formatFileSize(1024)).toBe('1.00 KB');
    });

    it('formats kilobytes with decimals', () => {
        expect(formatFileSize(1536)).toBe('1.50 KB');
    });

    it('formats exactly 1 MB', () => {
        expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
    });

    it('formats fractional megabytes', () => {
        expect(formatFileSize(1_500_000)).toBe('1.43 MB');
    });

    it('formats gigabytes', () => {
        expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GB');
    });
});

describe('loadPdf', () => {
    it('loads a valid PDF and returns a PDFDocument', async () => {
        const file = await createSimplePdf(3);
        const doc = await loadPdf(file);
        expect(doc).toBeInstanceOf(PDFDocument);
        expect(doc.getPageCount()).toBe(3);
    });

    it('loads a single-page PDF', async () => {
        const file = await createSimplePdf(1);
        const doc = await loadPdf(file);
        expect(doc.getPageCount()).toBe(1);
    });

    it('accepts a Blob as input', async () => {
        const file = await createSimplePdf(2);
        const blob = new Blob([await file.arrayBuffer()], { type: 'application/pdf' });
        const doc = await loadPdf(blob);
        expect(doc.getPageCount()).toBe(2);
    });

    it('exports MAX_PDF_PAGES constant', () => {
        expect(MAX_PDF_PAGES).toBe(5000);
    });

    it('exports MAX_IMAGE_DIMENSION constant', () => {
        expect(MAX_IMAGE_DIMENSION).toBe(10000);
    });
});

describe('savePdfAsBlob', () => {
    it('saves a PDFDocument as a Blob with correct MIME type', async () => {
        const doc = await PDFDocument.create();
        doc.addPage();
        const blob = await savePdfAsBlob(doc);
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toBe('application/pdf');
        expect(blob.size).toBeGreaterThan(0);
    });

    it('round-trips through load → save → load', async () => {
        const file = await createSimplePdf(5);
        const doc1 = await loadPdf(file);
        const blob = await savePdfAsBlob(doc1);
        const doc2 = await PDFDocument.load(await blob.arrayBuffer());
        expect(doc2.getPageCount()).toBe(5);
    });
});

describe('stampDefaultMetadata', () => {
    it('stamps creator as the i41 PDF toolbox domain', async () => {
        const doc = await PDFDocument.create();
        doc.addPage();
        stampDefaultMetadata(doc, 'test tool');
        expect(doc.getCreator()).toBe('pdf.i41.cn');
    });

    it('stamps keywords with tool name', async () => {
        const doc = await PDFDocument.create();
        doc.addPage();
        stampDefaultMetadata(doc, 'merge pdf');
        const keywords = doc.getKeywords();
        expect(keywords).toContain('PDF 工具箱');
        expect(keywords).toContain('pdf.i41.cn');
        expect(keywords).toContain('merge pdf');
    });
});

describe('stripJsActions', () => {
    it('removes /AA from the page dictionary', async () => {
        const doc = await PDFDocument.create();
        const page = doc.addPage();
        page.node.set(PDFName.of('AA'), doc.context.obj({ Foo: 'bar' }));
        expect(page.node.get(PDFName.of('AA'))).toBeDefined();

        stripJsActions(page);
        expect(page.node.get(PDFName.of('AA'))).toBeUndefined();
    });

    it('is safe on a page with no annotations', async () => {
        const doc = await PDFDocument.create();
        const page = doc.addPage();
        expect(() => stripJsActions(page)).not.toThrow();
    });

    it('removes annotations with /S /JavaScript action', async () => {
        const doc = await PDFDocument.create();
        const page = doc.addPage();
        const jsAction = doc.context.obj({ S: 'JavaScript', JS: 'app.alert("hi")' });
        const jsAnnot = doc.context.obj({ Type: 'Annot', Subtype: 'Link', A: jsAction });
        const annots = doc.context.obj([doc.context.register(jsAnnot)]);
        page.node.set(PDFName.of('Annots'), annots);

        stripJsActions(page);
        const remaining = page.node.lookup(PDFName.of('Annots')) as PDFArray;
        expect(remaining.size()).toBe(0);
    });

    it('preserves non-JavaScript annotations', async () => {
        const doc = await PDFDocument.create();
        const page = doc.addPage();
        const goToAction = doc.context.obj({ S: 'GoTo', D: 'dest' });
        const goToAnnot = doc.context.obj({ Type: 'Annot', Subtype: 'Link', A: goToAction });
        const annots = doc.context.obj([doc.context.register(goToAnnot)]);
        page.node.set(PDFName.of('Annots'), annots);

        stripJsActions(page);
        const remaining = page.node.lookup(PDFName.of('Annots')) as PDFArray;
        expect(remaining.size()).toBe(1);
    });

    it('removes annotations with JS hidden in /Next chain', async () => {
        const doc = await PDFDocument.create();
        const page = doc.addPage();
        // GoTo action whose /Next is a JavaScript action
        const jsAction = doc.context.obj({ S: 'JavaScript', JS: 'app.alert("chained")' });
        const goToAction = doc.context.obj({ S: 'GoTo', D: 'dest', Next: jsAction });
        const annot = doc.context.obj({ Type: 'Annot', Subtype: 'Link', A: goToAction });
        const annots = doc.context.obj([doc.context.register(annot)]);
        page.node.set(PDFName.of('Annots'), annots);

        stripJsActions(page);
        const remaining = page.node.lookup(PDFName.of('Annots')) as PDFArray;
        expect(remaining.size()).toBe(0);
    });
});

describe('stripDocumentJsActions', () => {
    it('removes /OpenAction with /S /JavaScript', async () => {
        const doc = await PDFDocument.create();
        doc.addPage();
        const jsAction = doc.context.obj({ S: 'JavaScript', JS: 'app.alert("open")' });
        doc.catalog.set(PDFName.of('OpenAction'), jsAction);

        stripDocumentJsActions(doc);
        expect(doc.catalog.get(PDFName.of('OpenAction'))).toBeUndefined();
    });

    it('preserves /OpenAction that is not JavaScript', async () => {
        const doc = await PDFDocument.create();
        doc.addPage();
        const goToAction = doc.context.obj({ S: 'GoTo', D: 'page1' });
        doc.catalog.set(PDFName.of('OpenAction'), goToAction);

        stripDocumentJsActions(doc);
        expect(doc.catalog.get(PDFName.of('OpenAction'))).toBeDefined();
    });

    it('removes /Names/JavaScript name tree', async () => {
        const doc = await PDFDocument.create();
        doc.addPage();
        const jsNames = doc.context.obj({ Names: ['script1', { S: 'JavaScript', JS: 'void(0)' }] });
        const names = doc.context.obj({ JavaScript: jsNames });
        doc.catalog.set(PDFName.of('Names'), names);

        stripDocumentJsActions(doc);
        const remaining = doc.catalog.lookup(PDFName.of('Names')) as PDFDict;
        expect(remaining.get(PDFName.of('JavaScript'))).toBeUndefined();
    });

    it('removes document-level /AA', async () => {
        const doc = await PDFDocument.create();
        doc.addPage();
        doc.catalog.set(PDFName.of('AA'), doc.context.obj({ WC: { S: 'JavaScript', JS: 'void(0)' } }));

        stripDocumentJsActions(doc);
        expect(doc.catalog.get(PDFName.of('AA'))).toBeUndefined();
    });

    it('is safe on a clean document', async () => {
        const doc = await PDFDocument.create();
        doc.addPage();
        expect(() => stripDocumentJsActions(doc)).not.toThrow();
    });

    it('preserves /OpenAction that is an array destination', async () => {
        const doc = await PDFDocument.create();
        const page = doc.addPage();
        // Array-form destination: [pageRef, /Fit]
        const dest = doc.context.obj([page.ref, 'Fit']);
        doc.catalog.set(PDFName.of('OpenAction'), dest);

        stripDocumentJsActions(doc);
        expect(doc.catalog.get(PDFName.of('OpenAction'))).toBeDefined();
    });

    it('removes /OpenAction with JS hidden in /Next chain', async () => {
        const doc = await PDFDocument.create();
        doc.addPage();
        const jsAction = doc.context.obj({ S: 'JavaScript', JS: 'app.alert("chained")' });
        const goToAction = doc.context.obj({ S: 'GoTo', D: 'page1', Next: jsAction });
        doc.catalog.set(PDFName.of('OpenAction'), goToAction);

        stripDocumentJsActions(doc);
        expect(doc.catalog.get(PDFName.of('OpenAction'))).toBeUndefined();
    });
});
