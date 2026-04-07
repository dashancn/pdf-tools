import { PDFDocument, PDFName, PDFArray, PDFDict, PDFPage, PDFRef } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type { DocumentInitParameters, PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';

// Configure pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).href;

/**
 * CanvasFactory for Web Worker contexts where `document` is unavailable.
 * Uses OffscreenCanvas instead of document.createElement('canvas').
 */
/**
 * CanvasFactory for Web Worker contexts where `document` is unavailable.
 * Uses OffscreenCanvas instead of document.createElement('canvas').
 */
class OffscreenCanvasFactory {
    create(width: number, height: number) {
        const canvas = new OffscreenCanvas(width, height);
        return { canvas, context: canvas.getContext('2d') };
    }
    reset(canvasAndContext: any, width: number, height: number) {
        canvasAndContext.canvas.width = width;
        canvasAndContext.canvas.height = height;
    }
    destroy(canvasAndContext: any) {
        canvasAndContext.canvas.width = 0;
        canvasAndContext.canvas.height = 0;
        canvasAndContext.canvas = null;
        canvasAndContext.context = null;
    }
}

/**
 * No-op FilterFactory for Web Worker contexts where DOM SVG filters are unavailable.
 * pdfjs DOMFilterFactory uses document.createElement/createElementNS which fails in workers.
 */
class NoopFilterFactory {
    addFilter() { return 'none'; }
    addHCMFilter() { return 'none'; }
    addAlphaFilter() { return 'none'; }
    addLuminosityFilter() { return 'none'; }
    addHighlightHCMFilter() { return 'none'; }
    destroy() {}
}

const isWorker = typeof document === 'undefined';

/**
 * Load a PDF with pdfjs-dist, automatically using OffscreenCanvas and
 * no-op filters in Web Worker contexts where `document` is unavailable.
 */
export function getPdfjsDocument(
    options: DocumentInitParameters & { data: Uint8Array }
): Promise<PDFDocumentProxy> {
    const opts: any = { ...options };
    if (isWorker) {
        opts.CanvasFactory = OffscreenCanvasFactory;
        opts.FilterFactory = NoopFilterFactory;
    }
    return pdfjsLib.getDocument(opts).promise;
}

/** Maximum number of pages allowed in a PDF to prevent CPU exhaustion. */
export const MAX_PDF_PAGES = 5000;

/** Maximum image dimension (width or height) in pixels. */
export const MAX_IMAGE_DIMENSION = 10000;

/**
 * Load a PDF from a File or Blob into a pdf-lib PDFDocument.
 * Validates page count against MAX_PDF_PAGES.
 */
export async function loadPdf(file: File | Blob): Promise<PDFDocument> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pageCount = pdfDoc.getPageCount();
    if (pageCount > MAX_PDF_PAGES) {
        throw new Error(`PDF has ${pageCount} pages (max ${MAX_PDF_PAGES})`);
    }
    return pdfDoc;
}

/**
 * Save a pdf-lib PDFDocument to a Blob.
 */
export async function savePdfAsBlob(pdfDoc: PDFDocument): Promise<Blob> {
    const bytes = await pdfDoc.save();
    return new Blob([bytes as BlobPart], { type: 'application/pdf' });
}

/**
 * Stamp default metadata (creator + keywords) on a PDFDocument.
 * Call before saving. For edit-metadata, call before user overrides
 * so explicit user values take precedence.
 */
export function stampDefaultMetadata(pdfDoc: PDFDocument, toolName: string): void {
    pdfDoc.setCreator('pdfworker.eu');
    pdfDoc.setKeywords(['pdf worker', 'pdfworker.eu', toolName]);
}

/**
 * Check whether a PDF action dict (or any action in its /Next chain)
 * contains a JavaScript action (/S /JavaScript).
 */
function actionContainsJs(action: PDFDict): boolean {
    const subtype = action.get(PDFName.of('S'));
    if (subtype?.toString() === '/JavaScript') return true;

    // Recurse into /Next chain (single action or array of actions)
    const next = action.lookup(PDFName.of('Next'));
    if (next instanceof PDFDict) return actionContainsJs(next);
    if (next instanceof PDFArray) {
        for (let i = 0; i < next.size(); i++) {
            const item = next.lookup(i);
            if (item instanceof PDFDict && actionContainsJs(item)) return true;
        }
    }
    return false;
}

/**
 * Strip JavaScript actions from a PDF page's annotations and additional-actions.
 * Removes /AA (additional actions) from the page dict, and filters out
 * annotation entries that contain JavaScript actions (/S /JavaScript),
 * including actions hidden in /Next chains.
 * Call this on every page obtained via copyPages() to prevent JS execution
 * when the output PDF is opened in an external reader.
 */
export function stripJsActions(page: PDFPage): void {
    const dict = page.node;

    // Remove page-level additional actions (open/close/etc)
    dict.delete(PDFName.of('AA'));

    // Filter annotations
    const annotsRef = dict.get(PDFName.of('Annots'));
    if (!annotsRef) return;

    const annots = dict.lookup(PDFName.of('Annots'));
    if (!(annots instanceof PDFArray)) return;

    const toRemove: number[] = [];
    for (let i = 0; i < annots.size(); i++) {
        const annot = annots.lookup(i);
        if (!(annot instanceof PDFDict)) continue;

        // Check /A action (including /Next chain)
        const action = annot.lookup(PDFName.of('A'));
        if (action instanceof PDFDict && actionContainsJs(action)) {
            toRemove.push(i);
            continue;
        }

        // Check /AA additional actions
        const aa = annot.get(PDFName.of('AA'));
        if (aa) {
            annot.delete(PDFName.of('AA'));
        }
    }

    // Remove JS annotations in reverse order to preserve indices
    for (let i = toRemove.length - 1; i >= 0; i--) {
        annots.remove(toRemove[i]);
    }
}

/**
 * Strip document-level JavaScript from a PDFDocument's catalog.
 * Removes:
 * - /OpenAction if it's a JavaScript action (or contains JS in /Next chain)
 * - /Names/JavaScript name tree (named scripts)
 * - /AA (document-level additional actions)
 * Call this on the output PDFDocument before saving.
 */
export function stripDocumentJsActions(pdfDoc: PDFDocument): void {
    const catalog = pdfDoc.catalog;

    // Remove document-level /AA
    catalog.delete(PDFName.of('AA'));

    // Remove /OpenAction if it contains JavaScript
    const openAction = catalog.lookup(PDFName.of('OpenAction'));
    if (openAction instanceof PDFDict && actionContainsJs(openAction)) {
        catalog.delete(PDFName.of('OpenAction'));
    }

    // Remove /Names/JavaScript name tree
    const names = catalog.lookup(PDFName.of('Names'));
    if (names instanceof PDFDict) {
        names.delete(PDFName.of('JavaScript'));
    }
}

/**
 * Create a canvas that works in both main thread and web worker contexts.
 */
export function createCanvas(width: number, height: number): HTMLCanvasElement | OffscreenCanvas {
    if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
    return new OffscreenCanvas(width, height);
}

/**
 * Convert a canvas to a Blob. Works with both HTMLCanvasElement and OffscreenCanvas.
 */
export async function canvasToBlob(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    type: string = 'image/png',
    quality?: number
): Promise<Blob> {
    if (canvas instanceof OffscreenCanvas) {
        return canvas.convertToBlob({ type: type as any, quality });
    }
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error('Failed to convert canvas to blob')),
            type,
            quality
        );
    });
}

/**
 * Render a single page of a PDF as an image Blob using pdf.js.
 */
export async function renderPageAsImage(
    file: File | Blob,
    pageNum: number,
    scale: number = 2.0
): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await getPdfjsDocument({ data: new Uint8Array(arrayBuffer) });
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to get canvas 2d context');

    await page.render({ canvas: canvas as any, canvasContext: context as any, viewport }).promise;
    return canvasToBlob(canvas, 'image/png');
}

/**
 * Get the total number of pages in a PDF file.
 */
export async function getPageCount(file: File | Blob): Promise<number> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await getPdfjsDocument({ data: new Uint8Array(arrayBuffer) });
    return pdfDoc.numPages;
}

/**
 * Format a byte count into a human-readable file size string.
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = bytes / Math.pow(k, i);
    return `${size.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}
