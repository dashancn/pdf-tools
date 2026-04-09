import * as pdfjsLib from 'pdfjs-dist';
import { imageDataToBlob, MAX_PDF_PAGES, getPdfjsDocument } from '../pdfUtils';

/**
 * Extract all embedded images from a PDF file.
 */
export async function extractImages(
    file: File,
    onProgress?: (progress: number) => void
): Promise<{ name: string; blob: Blob }[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await getPdfjsDocument({ data: new Uint8Array(arrayBuffer) });
    const pageCount = pdfDoc.numPages;
    if (pageCount > MAX_PDF_PAGES) {
        throw new Error(`PDF has ${pageCount} pages (max ${MAX_PDF_PAGES})`);
    }
    const results: { name: string; blob: Blob }[] = [];

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const ops = await page.getOperatorList();
        const processedImages = new Set<string>();
        let imageIndexOnPage = 0;

        for (let i = 0; i < ops.fnArray.length; i++) {
            if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
                const imgName = ops.argsArray[i][0] as string;

                if (processedImages.has(imgName)) continue;
                processedImages.add(imgName);

                try {
                    const img = await new Promise<any>((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            reject(new Error(`Timeout getting image: ${imgName}`));
                        }, 10000);

                        page.objs.get(imgName, (imgObj: any) => {
                            clearTimeout(timeout);
                            resolve(imgObj);
                        });
                    });

                    if (img && (img.data || img.bitmap) && img.width > 0 && img.height > 0) {
                        imageIndexOnPage++;
                        const blob = await imageDataToBlob(img);
                        results.push({
                            name: `image_page${pageNum}_${imageIndexOnPage}.png`,
                            blob,
                        });
                    }
                } catch {
                    continue;
                }
            }
        }

        page.cleanup();
        onProgress?.(Math.round((pageNum / pageCount) * 100));
    }

    if (results.length === 0) {
        throw new Error('No images found in the PDF');
    }

    return results;
}
