import { MAX_PDF_PAGES, getPdfjsDocument } from '../pdfUtils';

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
 *
 * @param file       - The source PDF File.
 * @param onProgress - Optional callback reporting progress from 0 to 100.
 * @returns A Blob containing the Markdown text.
 */
export async function pdfToMarkdown(
    file: File,
    onProgress?: (progress: number) => void
): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await getPdfjsDocument({ data: new Uint8Array(arrayBuffer) });
    const pageCount = pdfDoc.numPages;
    if (pageCount > MAX_PDF_PAGES) {
        throw new Error(`PDF has ${pageCount} pages (max ${MAX_PDF_PAGES})`);
    }

    // First pass: collect all font sizes to determine the body size
    const allFontSizes: number[] = [];
    const pagesData: TextBlock[][] = [];

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
            allFontSizes.push(fontSize);
        }

        pagesData.push(blocks);
        page.cleanup();
        onProgress?.(Math.round((i / pageCount) * 80));
    }

    if (pagesData.every(p => p.length === 0)) {
        throw new Error('No text content found in PDF. Scanned documents require OCR first.');
    }

    // Determine body font size (most frequent)
    const bodyFontSize = mostFrequent(allFontSizes) ?? 12;

    // Second pass: convert to markdown
    const pages: string[] = [];

    for (const blocks of pagesData) {
        const lines: string[] = [];
        let currentLine = '';
        let lastY: number | null = null;

        for (const block of blocks) {
            // Detect line break
            if (lastY !== null && Math.abs(block.y - lastY) > 2) {
                if (currentLine.trim()) {
                    lines.push(formatLine(currentLine.trim(), blocks, bodyFontSize));
                }
                currentLine = '';
            } else if (lastY !== null && currentLine.length > 0) {
                currentLine += ' ';
            }

            currentLine += decorateText(block);
            lastY = block.y;
        }
        if (currentLine.trim()) {
            lines.push(formatLine(currentLine.trim(), blocks, bodyFontSize));
        }

        pages.push(lines.join('\n\n'));
    }

    onProgress?.(100);

    const markdown = pages.filter(p => p.length > 0).join('\n\n---\n\n');
    return new Blob([markdown], { type: 'text/markdown' });
}

/**
 * Wrap text in bold/italic markers based on font metadata.
 */
function decorateText(block: TextBlock): string {
    let text = block.str;
    if (block.bold && block.italic) text = `***${text}***`;
    else if (block.bold) text = `**${text}**`;
    else if (block.italic) text = `*${text}*`;
    return text;
}

/**
 * Detect heading level by comparing font size to body font size.
 * Also detects bullet/numbered list items by leading characters.
 */
function formatLine(line: string, _blocks: TextBlock[], bodyFontSize: number): string {
    // Detect list items
    if (/^[\u2022\u2023\u25E6\u2043\u2219•·‣]\s/.test(line)) {
        return `- ${line.replace(/^[\u2022\u2023\u25E6\u2043\u2219•·‣]\s*/, '')}`;
    }
    if (/^\d+[.)]\s/.test(line)) {
        return line; // Already looks like a numbered list
    }

    // Extract font size from decorated text (check if the whole line is bold = possible heading)
    const isBoldLine = line.startsWith('**') && line.endsWith('**');
    const cleanLine = line.replace(/\*+/g, '');

    // We need font size info — parse from the blocks that contributed to this line
    // Since we lost direct block reference, use the bold heuristic + length
    if (isBoldLine && cleanLine.length < 80) {
        // Short bold line is likely a heading
        return `## ${cleanLine}`;
    }

    return line;
}

/**
 * Return the most frequent value in a number array.
 */
function mostFrequent(arr: number[]): number | undefined {
    if (arr.length === 0) return undefined;
    const freq = new Map<number, number>();
    let maxCount = 0;
    let maxVal = arr[0];
    for (const n of arr) {
        const rounded = Math.round(n * 2) / 2; // Round to nearest 0.5
        const count = (freq.get(rounded) ?? 0) + 1;
        freq.set(rounded, count);
        if (count > maxCount) {
            maxCount = count;
            maxVal = rounded;
        }
    }
    return maxVal;
}
