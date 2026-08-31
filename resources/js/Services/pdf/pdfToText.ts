import * as pdfjsLib from 'pdfjs-dist';
import { MAX_PDF_PAGES, getPdfjsDocument, createCanvas, canvasToBlob, imageDataToBlob } from '../pdfUtils';
import { tesseractWorkerOptions } from '../tesseractConfig';

export interface TextExtractionOptions {
    extractImages?: boolean;
    ocr?: boolean;
    ocrLanguage?: string;
}

/**
 * Extract all text content from a PDF file.
 *
 * Uses pdfjs-dist to iterate through each page and extract text items,
 * preserving basic line structure. Optionally runs OCR on scanned pages
 * and/or extracts embedded images.
 *
 * @param file       - The source PDF File.
 * @param options    - Optional: extractImages, ocr, ocrLanguage.
 * @param onProgress - Optional callback reporting progress from 0 to 100.
 * @returns A Blob (text only) or array of { name, blob } when images are extracted.
 */
export async function pdfToText(
    file: File,
    options?: TextExtractionOptions,
    onProgress?: (progress: number) => void
): Promise<Blob | { name: string; blob: Blob }[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await getPdfjsDocument({ data: new Uint8Array(arrayBuffer) });
    const pageCount = pdfDoc.numPages;
    if (pageCount > MAX_PDF_PAGES) {
        throw new Error(`PDF has ${pageCount} pages (max ${MAX_PDF_PAGES})`);
    }

    const useOcr = options?.ocr ?? false;
    const useImages = options?.extractImages ?? false;
    const ocrLang = options?.ocrLanguage ?? 'chi_sim+eng';

    // Lazy-init Tesseract worker if OCR is needed
    let ocrWorker: any = null;
    if (useOcr) {
        const { createWorker } = await import('tesseract.js');
        ocrWorker = await createWorker(ocrLang, undefined, tesseractWorkerOptions());
    }

    const pages: string[] = [];
    const imageResults: { name: string; blob: Blob }[] = [];

    try {
        for (let i = 1; i <= pageCount; i++) {
            const page = await pdfDoc.getPage(i);

            // Extract text
            const textContent = await page.getTextContent();
            let lastY: number | null = null;
            let pageText = '';

            for (const item of textContent.items) {
                if (!('str' in item)) continue;
                const textItem = item as { str: string; transform: number[] };
                const y = textItem.transform[5];

                if (lastY !== null && Math.abs(y - lastY) > 2) {
                    pageText += '\n';
                } else if (lastY !== null && pageText.length > 0 && !pageText.endsWith('\n')) {
                    pageText += ' ';
                }

                pageText += textItem.str;
                lastY = y;
            }

            // When OCR is explicitly enabled, recognize every page instead of
            // trusting an existing text layer. Some Chinese invoices contain a
            // broken/custom-encoded text layer that extracts as mojibake even
            // though the rendered page is visually correct.
            if (useOcr && ocrWorker) {
                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = createCanvas(viewport.width, viewport.height);
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    (ctx as any).fillStyle = '#ffffff';
                    (ctx as any).fillRect(0, 0, canvas.width, canvas.height);
                    await page.render({ canvas: canvas as any, canvasContext: ctx as any, viewport }).promise;
                    const imgBlob = await canvasToBlob(canvas, 'image/png');
                    const { data } = await ocrWorker.recognize(imgBlob);
                    pageText = data.text?.trim() ?? '';
                }
            }

            // Extract images from this page
            if (useImages) {
                const ops = await page.getOperatorList();
                const processedImages = new Set<string>();
                let imageIdx = 0;

                for (let j = 0; j < ops.fnArray.length; j++) {
                    if (ops.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
                        const imgName = ops.argsArray[j][0] as string;
                        if (processedImages.has(imgName)) continue;
                        processedImages.add(imgName);

                        try {
                            const img = await new Promise<any>((resolve, reject) => {
                                const timeout = setTimeout(() => reject(new Error('Timeout')), 10000);
                                page.objs.get(imgName, (imgObj: any) => {
                                    clearTimeout(timeout);
                                    resolve(imgObj);
                                });
                            });

                            if (img && (img.data || img.bitmap) && img.width > 0 && img.height > 0) {
                                imageIdx++;
                                const blob = await imageDataToBlob(img);
                                imageResults.push({
                                    name: `images/image_page${i}_${imageIdx}.png`,
                                    blob,
                                });
                            }
                        } catch {
                            continue;
                        }
                    }
                }
            }

            pages.push(pageText.trim());
            page.cleanup();
            onProgress?.(Math.round((i / pageCount) * 95));
        }
    } finally {
        if (ocrWorker) {
            await ocrWorker.terminate();
        }
    }

    const fullText = pages.join('\n\n--- Page break ---\n\n');
    const textBlob = new Blob([fullText], { type: 'text/plain' });

    onProgress?.(100);

    if (useImages) {
        const baseName = file.name.replace(/\.pdf$/i, '');
        return [{ name: `${baseName}.txt`, blob: textBlob }, ...imageResults];
    }

    return textBlob;
}
