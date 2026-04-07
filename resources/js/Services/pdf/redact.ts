import { PDFDocument, rgb } from 'pdf-lib';
import { loadPdf, savePdfAsBlob, stampDefaultMetadata, stripJsActions, stripDocumentJsActions, getPdfjsDocument, createCanvas, canvasToBlob } from '../pdfUtils';

export interface RedactArea {
    pageIndex: number; // 0-based
    x: number;         // x coordinate in PDF points from bottom-left origin
    y: number;         // y coordinate in PDF points from bottom-left origin
    width: number;
    height: number;
}

/**
 * Redact (censor) areas in a PDF by permanently destroying content.
 *
 * Step 1: Draw black rectangles over the redacted areas.
 * Step 2: Rasterize each redacted page to a bitmap, then re-embed it.
 * This ensures the underlying text/vector content is irreversibly removed.
 * Non-redacted pages are copied as-is to preserve quality.
 */
export async function redactPdf(
    file: File,
    areas: RedactArea[],
    onProgress?: (progress: number) => void
): Promise<Blob> {
    if (!areas || areas.length === 0) {
        throw new Error('At least one redaction area must be specified');
    }

    const pdfDoc = await loadPdf(file);
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    // Validate all page indices
    for (const area of areas) {
        if (area.pageIndex < 0 || area.pageIndex >= totalPages) {
            throw new Error(
                `Page index ${area.pageIndex} is out of bounds. The PDF has ${totalPages} pages (0-based).`
            );
        }
        if (area.width <= 0 || area.height <= 0) {
            throw new Error('Redaction area width and height must be positive');
        }
    }

    // Group areas by page index
    const areasByPage = new Map<number, RedactArea[]>();
    for (const area of areas) {
        const existing = areasByPage.get(area.pageIndex) ?? [];
        existing.push(area);
        areasByPage.set(area.pageIndex, existing);
    }

    // Step 1: Draw black rectangles on the original PDF
    const blackColor = rgb(0, 0, 0);
    for (const [pageIndex, pageAreas] of areasByPage) {
        const page = pages[pageIndex];
        for (const area of pageAreas) {
            page.drawRectangle({
                x: area.x,
                y: area.y,
                width: area.width,
                height: area.height,
                color: blackColor,
            });
        }
    }

    onProgress?.(20);

    // Step 2: Save intermediate PDF, then rasterize redacted pages
    const intermediateBytes = await pdfDoc.save();
    const pdfjsDoc = await getPdfjsDocument({ data: new Uint8Array(intermediateBytes) });

    const outputDoc = await PDFDocument.create();
    const RENDER_SCALE = 2; // 144 DPI

    for (let i = 0; i < totalPages; i++) {
        if (areasByPage.has(i)) {
            // Rasterize this page to destroy underlying content
            const pdfjsPage = await pdfjsDoc.getPage(i + 1);
            const viewport = pdfjsPage.getViewport({ scale: RENDER_SCALE });
            const canvas = createCanvas(viewport.width, viewport.height);
            const ctx = canvas.getContext('2d') as any;
            await pdfjsPage.render({ canvas: canvas as any, canvasContext: ctx, viewport }).promise;

            const pngBlob = await canvasToBlob(canvas, 'image/png');
            const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
            const pngImage = await outputDoc.embedPng(pngBytes);

            const origPage = pages[i];
            const { width, height } = origPage.getSize();
            const newPage = outputDoc.addPage([width, height]);
            newPage.drawImage(pngImage, { x: 0, y: 0, width, height });
        } else {
            // Copy non-redacted pages as-is (preserves text/vectors)
            const [copiedPage] = await outputDoc.copyPages(pdfDoc, [i]);
            stripJsActions(copiedPage);
            outputDoc.addPage(copiedPage);
        }
        onProgress?.(20 + Math.round(((i + 1) / totalPages) * 70));
    }

    onProgress?.(95);
    stripDocumentJsActions(outputDoc);
    stampDefaultMetadata(outputDoc, 'redact pdf');
    const blob = await savePdfAsBlob(outputDoc);
    onProgress?.(100);
    return blob;
}
