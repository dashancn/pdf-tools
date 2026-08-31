import { PDFDocument, degrees } from 'pdf-lib';
import {
    MAX_PDF_PAGES,
    savePdfAsBlob,
    stampDefaultMetadata,
    stripDocumentJsActions,
    stripJsActions,
} from '../pdfUtils';

export interface Size {
    width: number;
    height: number;
}

export interface Rectangle extends Size {
    x: number;
    y: number;
}

export interface InvoicePlacement extends Rectangle {
    scale: number;
    rotation: 0 | 90;
}

export type InvoiceLayout = 2 | 4;

export const A4_PORTRAIT = { width: 595.28, height: 841.89 } as const;

export function calculateInvoiceCells(
    layout: InvoiceLayout,
    margin: number,
    gap: number,
): Rectangle[] {
    if (!Number.isFinite(margin) || !Number.isFinite(gap) || margin < 0 || gap < 0) {
        throw new Error('Margin and gap must be non-negative numbers');
    }

    const columns = layout === 2 ? 1 : 2;
    const rows = 2;
    const width = (A4_PORTRAIT.width - margin * 2 - gap * (columns - 1)) / columns;
    const height = (A4_PORTRAIT.height - margin * 2 - gap * (rows - 1)) / rows;
    if (width <= 0 || height <= 0) {
        throw new Error('Margin and gap leave no room for invoice pages');
    }

    const cells: Rectangle[] = [];
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            cells.push({
                x: margin + column * (width + gap),
                y: A4_PORTRAIT.height - margin - height - row * (height + gap),
                width,
                height,
            });
        }
    }
    return cells;
}

export function calculateInvoicePlacement(
    source: Size,
    cell: Rectangle,
    autoRotate: boolean = true,
): InvoicePlacement {
    if (source.width <= 0 || source.height <= 0) {
        throw new Error('Source page dimensions must be positive');
    }

    const normalScale = Math.min(cell.width / source.width, cell.height / source.height);
    const rotatedScale = Math.min(cell.width / source.height, cell.height / source.width);
    const rotation: 0 | 90 = autoRotate && rotatedScale > normalScale ? 90 : 0;
    const scale = rotation === 90 ? rotatedScale : normalScale;
    const width = (rotation === 90 ? source.height : source.width) * scale;
    const height = (rotation === 90 ? source.width : source.height) * scale;

    return {
        x: cell.x + (cell.width - width) / 2,
        y: cell.y + (cell.height - height) / 2,
        width,
        height,
        scale,
        rotation,
    };
}

export interface InvoiceNupOptions {
    layout: InvoiceLayout;
    margin?: number;
    gap?: number;
    autoRotate?: boolean;
}

interface SourcePage {
    document: PDFDocument;
    pageIndex: number;
}

const DEFAULT_MARGIN = 18;
const DEFAULT_GAP = 12;

export async function invoiceNupPdf(
    files: File[],
    options: InvoiceNupOptions,
    onProgress?: (progress: number) => void,
): Promise<Blob> {
    if (files.length === 0) {
        throw new Error('No PDF files provided');
    }
    if (options.layout !== 2 && options.layout !== 4) {
        throw new Error('Invoice layout must be 2 or 4');
    }

    const cells = calculateInvoiceCells(
        options.layout,
        options.margin ?? DEFAULT_MARGIN,
        options.gap ?? DEFAULT_GAP,
    );
    const sourcePages: SourcePage[] = [];

    for (const file of files) {
        let sourceDocument: PDFDocument;
        try {
            sourceDocument = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
        } catch {
            throw new Error(`Unable to read ${file.name} as a PDF`);
        }
        for (const pageIndex of sourceDocument.getPageIndices()) {
            sourcePages.push({ document: sourceDocument, pageIndex });
            if (sourcePages.length > MAX_PDF_PAGES) {
                throw new Error(`PDF inputs have more than ${MAX_PDF_PAGES} pages`);
            }
        }
    }

    if (sourcePages.length === 0) {
        throw new Error('PDF files contain no pages');
    }

    const output = await PDFDocument.create();
    for (let index = 0; index < sourcePages.length; index++) {
        const slot = index % options.layout;
        const outputPage = slot === 0
            ? output.addPage([A4_PORTRAIT.width, A4_PORTRAIT.height])
            : output.getPage(output.getPageCount() - 1);
        const source = sourcePages[index];
        const [copiedPage] = await output.copyPages(source.document, [source.pageIndex]);
        stripJsActions(copiedPage);
        const embeddedPage = await output.embedPage(copiedPage);
        const sourceRotation = ((copiedPage.getRotation().angle % 360) + 360) % 360;
        const sourceIsQuarterTurn = sourceRotation === 90 || sourceRotation === 270;
        const placement = calculateInvoicePlacement(
            sourceIsQuarterTurn
                ? { width: embeddedPage.height, height: embeddedPage.width }
                : { width: embeddedPage.width, height: embeddedPage.height },
            cells[slot],
            options.autoRotate ?? true,
        );
        const drawRotation = (sourceRotation + placement.rotation) % 360;

        if (drawRotation === 90) {
            outputPage.drawPage(embeddedPage, {
                x: placement.x + placement.width,
                y: placement.y,
                width: placement.height,
                height: placement.width,
                rotate: degrees(90),
            });
        } else if (drawRotation === 180) {
            outputPage.drawPage(embeddedPage, {
                x: placement.x + placement.width,
                y: placement.y + placement.height,
                width: placement.width,
                height: placement.height,
                rotate: degrees(180),
            });
        } else if (drawRotation === 270) {
            outputPage.drawPage(embeddedPage, {
                x: placement.x,
                y: placement.y + placement.height,
                width: placement.height,
                height: placement.width,
                rotate: degrees(270),
            });
        } else {
            outputPage.drawPage(embeddedPage, {
                x: placement.x,
                y: placement.y,
                width: placement.width,
                height: placement.height,
            });
        }

        onProgress?.(Math.round(((index + 1) / sourcePages.length) * 100));
    }

    stripDocumentJsActions(output);
    stampDefaultMetadata(output, 'invoice n-up pdf');
    return savePdfAsBlob(output);
}
