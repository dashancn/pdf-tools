import * as pdfjsLib from 'pdfjs-dist';
import { MAX_PDF_PAGES, getPdfjsDocument, createCanvas, canvasToBlob, imageDataToBlob } from '../pdfUtils';
import type { TextExtractionOptions } from './pdfToText';

interface TextBlock {
    str: string;
    fontSize: number;
    fontName: string;
    y: number;
    x: number;
    bold: boolean;
    italic: boolean;
}

/**
 * Convert a PDF file to Markdown format.
 *
 * Uses pdfjs-dist to extract text with font metadata, then applies heuristics
 * to detect headings (by font size), bold/italic spans, and list items.
 * Optionally runs OCR on scanned pages and/or extracts embedded images.
 *
 * @param file       - The source PDF File.
 * @param options    - Optional: extractImages, ocr, ocrLanguage.
 * @param onProgress - Optional callback reporting progress from 0 to 100.
 * @returns A Blob (markdown only) or array of { name, blob } when images are extracted.
 */
export async function pdfToMarkdown(
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
    const ocrLang = options?.ocrLanguage ?? 'eng';

    // Lazy-init Tesseract worker if OCR is needed
    let ocrWorker: any = null;
    if (useOcr) {
        const { createWorker } = await import('tesseract.js');
        ocrWorker = await createWorker(ocrLang);
    }

    const pagesData: TextBlock[][] = [];
    const pageImageRefs: string[][] = []; // image markdown refs per page
    const imageResults: { name: string; blob: Blob }[] = [];

    try {
        for (let i = 1; i <= pageCount; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            const blocks: TextBlock[] = [];

            for (const item of textContent.items) {
                if (!('str' in item) || !item.str.trim()) continue;
                const ti = item as { str: string; transform: number[]; fontName: string; height: number };
                const fontSize = Math.abs(ti.transform[0]) || ti.height || 12;
                const fontName = ti.fontName || '';
                blocks.push({
                    str: ti.str,
                    fontSize,
                    fontName,
                    y: ti.transform[5],
                    x: ti.transform[4],
                    bold: /bold/i.test(fontName),
                    italic: /italic|oblique/i.test(fontName),
                });
            }

            // OCR fallback: if page has minimal text and OCR is enabled
            if (useOcr && ocrWorker && blocks.length < 3) {
                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = createCanvas(viewport.width, viewport.height);
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    (ctx as any).fillStyle = '#ffffff';
                    (ctx as any).fillRect(0, 0, canvas.width, canvas.height);
                    await page.render({ canvas: canvas as any, canvasContext: ctx as any, viewport }).promise;
                    const imgBlob = await canvasToBlob(canvas, 'image/png');
                    const { data } = await ocrWorker.recognize(imgBlob);
                    if (data.words) {
                        for (const word of data.words) {
                            if (!word.text.trim()) continue;
                            blocks.push({
                                str: word.text,
                                fontSize: 12,
                                fontName: '',
                                y: -(word.bbox.y0),
                                x: word.bbox.x0,
                                bold: false,
                                italic: false,
                            });
                        }
                    }
                }
            }

            // Extract images from this page
            const pageImgRefs: string[] = [];
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
                                const fileName = `images/image_page${i}_${imageIdx}.png`;
                                const blob = await imageDataToBlob(img);
                                imageResults.push({ name: fileName, blob });
                                pageImgRefs.push(`![](${fileName})`);
                            }
                        } catch {
                            continue;
                        }
                    }
                }
            }

            pagesData.push(blocks);
            pageImageRefs.push(pageImgRefs);
            page.cleanup();
            onProgress?.(Math.round((i / pageCount) * 80));
        }
    } finally {
        if (ocrWorker) {
            await ocrWorker.terminate();
        }
    }

    if (pagesData.every(p => p.length === 0) && imageResults.length === 0) {
        throw new Error('No text content found in PDF. Scanned documents require OCR first.');
    }

    // Second pass: convert to markdown
    const pages: string[] = [];

    for (let p = 0; p < pagesData.length; p++) {
        const blocks = pagesData[p];
        const lines: string[] = [];
        let currentLine = '';
        let lastY: number | null = null;

        for (const block of blocks) {
            if (lastY !== null && Math.abs(block.y - lastY) > 2) {
                if (currentLine.trim()) {
                    lines.push(formatLine(currentLine.trim()));
                }
                currentLine = '';
            } else if (lastY !== null && currentLine.length > 0) {
                currentLine += ' ';
            }

            currentLine += decorateText(block);
            lastY = block.y;
        }
        if (currentLine.trim()) {
            lines.push(formatLine(currentLine.trim()));
        }

        // Append image references at end of page
        if (pageImageRefs[p].length > 0) {
            lines.push('', ...pageImageRefs[p]);
        }

        pages.push(lines.join('\n\n'));
    }

    onProgress?.(100);

    const markdown = pages.filter(p => p.length > 0).join('\n\n---\n\n');
    const mdBlob = new Blob([markdown], { type: 'text/markdown' });

    if (useImages) {
        const baseName = file.name.replace(/\.pdf$/i, '');
        return [{ name: `${baseName}.md`, blob: mdBlob }, ...imageResults];
    }

    return mdBlob;
}

function decorateText(block: TextBlock): string {
    let text = block.str;
    if (block.bold && block.italic) text = `***${text}***`;
    else if (block.bold) text = `**${text}**`;
    else if (block.italic) text = `*${text}*`;
    return text;
}

function formatLine(line: string): string {
    if (/^[\u2022\u2023\u25E6\u2043\u2219•·‣]\s/.test(line)) {
        return `- ${line.replace(/^[\u2022\u2023\u25E6\u2043\u2219•·‣]\s*/, '')}`;
    }
    if (/^\d+[.)]\s/.test(line)) {
        return line;
    }

    const isBoldLine = line.startsWith('**') && line.endsWith('**');
    const cleanLine = line.replace(/\*+/g, '');

    if (isBoldLine && cleanLine.length < 80) {
        return `## ${cleanLine}`;
    }

    return line;
}

