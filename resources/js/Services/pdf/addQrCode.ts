import { loadPdf, savePdfAsBlob, stampDefaultMetadata } from '../pdfUtils';

export interface QrCodeOptions {
    pageIndex: number;
    x: number;
    y: number;
    size: number;
    pngDataUrl: string;
    allPages?: boolean;
}

/**
 * Decode a base64 data URL into a Uint8Array.
 */
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
    const base64 = dataUrl.split(',')[1];
    if (!base64) {
        throw new Error('Invalid data URL: missing base64 content');
    }
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

/**
 * Add a QR code PNG to a specific page of a PDF at the given position.
 */
export async function addQrCode(
    file: File,
    options: QrCodeOptions,
    onProgress?: (progress: number) => void
): Promise<Blob> {
    if (!options.pngDataUrl) {
        throw new Error('QR code PNG data URL is required');
    }

    const pdfDoc = await loadPdf(file);
    const pages = pdfDoc.getPages();

    if (!options.allPages && (options.pageIndex < 0 || options.pageIndex >= pages.length)) {
        throw new Error(
            `Page index ${options.pageIndex} is out of bounds. The PDF has ${pages.length} pages (0-based).`
        );
    }

    onProgress?.(20);

    const pngBytes = dataUrlToUint8Array(options.pngDataUrl);
    const image = await pdfDoc.embedPng(pngBytes);

    onProgress?.(40);

    const targetPages = options.allPages ? pages : [pages[options.pageIndex]];
    for (let i = 0; i < targetPages.length; i++) {
        targetPages[i].drawImage(image, {
            x: options.x,
            y: options.y,
            width: options.size,
            height: options.size,
        });
        onProgress?.(40 + Math.round(((i + 1) / targetPages.length) * 40));
    }

    stampDefaultMetadata(pdfDoc, 'add qr code');
    const blob = await savePdfAsBlob(pdfDoc);
    onProgress?.(100);

    return blob;
}
