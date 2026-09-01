import { createCanvas, canvasToBlob, MAX_PDF_PAGES, getPdfjsDocument } from '../pdfUtils';
import { buildEncryptedPdf, buildPermissionFlags, type PageImage, type PdfPermissions } from './pdfCrypto';

export interface ProtectOptions {
    userPassword: string;
    ownerPassword: string;
    permissions?: PdfPermissions;
}

/** Render scale for page images — high quality to minimise visual loss. */
const RENDER_SCALE = 2.0;
/** JPEG quality for embedded page images. */
const JPEG_QUALITY = 0.92;

type CanvasLike = HTMLCanvasElement | OffscreenCanvas;

/**
 * Render to PDF.js's working canvas, then copy the completed pixels to a fresh
 * snapshot canvas. This avoids OffscreenCanvas state/transforms leaking into
 * convertToBlob() for PDFs with complex clipping and transformation matrices.
 */
export async function renderPageForProtection(
    page: any,
    canvasFactory: (width: number, height: number) => CanvasLike = createCanvas,
): Promise<{ canvas: CanvasLike; widthPt: number; heightPt: number; widthPx: number; heightPx: number }> {
    const origViewport = page.getViewport({ scale: 1.0 });
    const renderViewport = page.getViewport({ scale: RENDER_SCALE });
    const widthPx = Math.round(renderViewport.width);
    const heightPx = Math.round(renderViewport.height);

    const renderCanvas = canvasFactory(widthPx, heightPx);
    const renderContext = renderCanvas.getContext('2d');
    if (!renderContext) throw new Error('Failed to get canvas context');
    await page.render({
        canvas: renderCanvas as any,
        canvasContext: renderContext as any,
        viewport: renderViewport,
    }).promise;

    const snapshot = canvasFactory(widthPx, heightPx);
    const snapshotContext = snapshot.getContext('2d');
    if (!snapshotContext) throw new Error('Failed to get snapshot canvas context');
    (snapshotContext as any).fillStyle = '#ffffff';
    (snapshotContext as any).fillRect(0, 0, widthPx, heightPx);
    (snapshotContext as any).drawImage(renderCanvas as any, 0, 0);

    return {
        canvas: snapshot,
        widthPt: origViewport.width,
        heightPt: origViewport.height,
        widthPx,
        heightPx,
    };
}

/**
 * Add password protection to a PDF.
 *
 * Renders every page as a high-quality JPEG, then builds a new PDF with
 * Standard Security Handler V2/R3 (RC4-128) encryption.
 *
 * This is a lossy operation (text becomes rasterised), but the output is
 * genuinely encrypted and requires the user password to open.
 */
export async function protectPdf(
    file: File,
    options: ProtectOptions,
    onProgress?: (progress: number) => void,
): Promise<Blob> {
    if (!options.userPassword && !options.ownerPassword) {
        throw new Error('At least one password (user or owner) must be provided');
    }

    const arrayBuffer = await file.arrayBuffer();
    onProgress?.(5);

    const pdfDoc = await getPdfjsDocument({ data: new Uint8Array(arrayBuffer) });
    const pageCount = pdfDoc.numPages;
    if (pageCount > MAX_PDF_PAGES) {
        throw new Error(`PDF has ${pageCount} pages (max ${MAX_PDF_PAGES})`);
    }

    onProgress?.(10);

    // Render every page as a JPEG image
    const pages: PageImage[] = [];

    for (let i = 1; i <= pageCount; i++) {
        const page = await pdfDoc.getPage(i);
        const rendered = await renderPageForProtection(page);
        const jpegBlob = await canvasToBlob(rendered.canvas, 'image/jpeg', JPEG_QUALITY);
        const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());

        pages.push({
            jpegBytes,
            widthPt: rendered.widthPt,
            heightPt: rendered.heightPt,
            widthPx: rendered.widthPx,
            heightPx: rendered.heightPx,
        });

        onProgress?.(10 + Math.round((i / pageCount) * 70));
    }

    onProgress?.(85);

    // Build the encrypted PDF
    const permissions = buildPermissionFlags(options.permissions ?? {});
    const encryptedBytes = buildEncryptedPdf(
        pages,
        options.userPassword,
        options.ownerPassword || options.userPassword,
        permissions,
    );

    onProgress?.(100);

    return new Blob([encryptedBytes], { type: 'application/pdf' });
}
