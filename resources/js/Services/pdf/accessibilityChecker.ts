import { PDFDocument, PDFName, PDFDict, PDFArray, PDFBool, PDFString, PDFHexString, PDFRef, PDFStream } from 'pdf-lib';

export type CheckStatus = 'pass' | 'fail' | 'warn' | 'na';

export interface AccessibilityCheck {
    id: string;
    status: CheckStatus;
    detail: string;
}

export interface AccessibilityReport {
    fileName: string;
    pageCount: number;
    score: number;
    checks: AccessibilityCheck[];
}

/**
 * Analyze a PDF for accessibility issues.
 * Returns a structured report with 10 accessibility checks.
 */
export async function checkAccessibility(
    file: File,
    onProgress?: (progress: number) => void,
): Promise<AccessibilityReport> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const catalog = pdfDoc.catalog;
    const pages = pdfDoc.getPages();
    const checks: AccessibilityCheck[] = [];

    onProgress?.(10);

    // 1. Tagged PDF (/MarkInfo /Marked)
    const markInfo = catalog.lookup(PDFName.of('MarkInfo'));
    if (markInfo instanceof PDFDict) {
        const marked = markInfo.lookup(PDFName.of('Marked'));
        if (marked === PDFBool.True) {
            checks.push({ id: 'tagged-pdf', status: 'pass', detail: 'PDF is tagged (MarkInfo/Marked = true).' });
        } else {
            checks.push({ id: 'tagged-pdf', status: 'fail', detail: 'MarkInfo exists but Marked is not true.' });
        }
    } else {
        checks.push({ id: 'tagged-pdf', status: 'fail', detail: 'No MarkInfo dictionary found. The PDF is not tagged.' });
    }

    // 2. Document language (/Lang)
    const lang = catalog.lookup(PDFName.of('Lang'));
    const langText = (lang instanceof PDFString || lang instanceof PDFHexString) ? lang.decodeText() : '';
    if (langText.trim().length > 0) {
        checks.push({ id: 'document-language', status: 'pass', detail: `Document language is set: ${langText}.` });
    } else {
        checks.push({ id: 'document-language', status: 'fail', detail: 'No document language (/Lang) specified.' });
    }

    // 3. Document title
    const title = pdfDoc.getTitle();
    if (title && title.trim().length > 0) {
        checks.push({ id: 'document-title', status: 'pass', detail: `Document title: "${title}".` });
    } else {
        checks.push({ id: 'document-title', status: 'fail', detail: 'No document title set in metadata.' });
    }

    onProgress?.(30);

    // 4. Bookmarks / Outlines
    const outlines = catalog.lookup(PDFName.of('Outlines'));
    if (outlines instanceof PDFDict && outlines.lookup(PDFName.of('First'))) {
        checks.push({ id: 'bookmarks', status: 'pass', detail: 'Document contains bookmarks/outlines.' });
    } else {
        checks.push({ id: 'bookmarks', status: 'warn', detail: 'No bookmarks found. Consider adding outlines for navigation.' });
    }

    // 5. Structure tree and alt text on figures
    const structTreeRoot = catalog.lookup(PDFName.of('StructTreeRoot'));
    if (structTreeRoot instanceof PDFDict) {
        checks.push({ id: 'structure-tree', status: 'pass', detail: 'Structure tree (/StructTreeRoot) is present.' });

        // Walk structure tree to find /Figure elements missing /Alt
        const { totalFigures, missingAlt } = walkStructureTree(structTreeRoot, pdfDoc);
        if (totalFigures === 0) {
            checks.push({ id: 'alt-text', status: 'na', detail: 'No figure elements found in the structure tree.' });
        } else if (missingAlt === 0) {
            checks.push({ id: 'alt-text', status: 'pass', detail: `All ${totalFigures} figure(s) have alt text.` });
        } else {
            checks.push({ id: 'alt-text', status: 'fail', detail: `${missingAlt} of ${totalFigures} figure(s) missing alt text.` });
        }
    } else {
        checks.push({ id: 'structure-tree', status: 'fail', detail: 'No structure tree found. Screen readers cannot determine reading order.' });
        checks.push({ id: 'alt-text', status: 'warn', detail: 'Cannot check alt text — no structure tree present.' });
    }

    onProgress?.(60);

    // 7. Font embedding
    let allFontsEmbedded = true;
    let unembeddedFontName = '';
    for (const page of pages) {
        const resources = page.node.lookup(PDFName.of('Resources'));
        if (!(resources instanceof PDFDict)) continue;
        const fonts = resources.lookup(PDFName.of('Font'));
        if (!(fonts instanceof PDFDict)) continue;

        const fontEntries = fonts.entries();
        for (const [, fontRef] of fontEntries) {
            const font = fonts.context.lookup(fontRef);
            if (!(font instanceof PDFDict)) continue;
            const descriptor = font.lookup(PDFName.of('FontDescriptor'));
            if (!(descriptor instanceof PDFDict)) continue;

            const hasFile = descriptor.lookup(PDFName.of('FontFile'))
                || descriptor.lookup(PDFName.of('FontFile2'))
                || descriptor.lookup(PDFName.of('FontFile3'));
            if (!hasFile) {
                allFontsEmbedded = false;
                const baseName = font.lookup(PDFName.of('BaseFont'));
                unembeddedFontName = baseName?.toString() ?? 'unknown';
                break;
            }
        }
        if (!allFontsEmbedded) break;
    }

    if (allFontsEmbedded) {
        checks.push({ id: 'font-embedding', status: 'pass', detail: 'All fonts with descriptors are embedded.' });
    } else {
        checks.push({ id: 'font-embedding', status: 'fail', detail: `Font ${unembeddedFontName} is not embedded.` });
    }

    onProgress?.(80);

    // 8. Form field labels (/TU)
    try {
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        if (fields.length === 0) {
            checks.push({ id: 'form-labels', status: 'na', detail: 'No form fields found.' });
        } else {
            let missingLabels = 0;
            for (const field of fields) {
                const tu = field.acroField.dict.lookup(PDFName.of('TU'));
                const tuText = (tu instanceof PDFString || tu instanceof PDFHexString) ? tu.decodeText() : '';
                if (!tuText.trim()) missingLabels++;
            }
            if (missingLabels === 0) {
                checks.push({ id: 'form-labels', status: 'pass', detail: `All ${fields.length} form field(s) have labels (/TU).` });
            } else {
                checks.push({ id: 'form-labels', status: 'fail', detail: `${missingLabels} of ${fields.length} field(s) missing label (/TU).` });
            }
        }
    } catch {
        checks.push({ id: 'form-labels', status: 'na', detail: 'No form fields found.' });
    }

    // 9. Tab order on pages
    let pagesWithTabs = 0;
    for (const page of pages) {
        const tabs = page.node.lookup(PDFName.of('Tabs'));
        if (tabs) pagesWithTabs++;
    }
    if (pagesWithTabs === pages.length) {
        checks.push({ id: 'tab-order', status: 'pass', detail: 'Tab order is set on all pages.' });
    } else if (pagesWithTabs > 0) {
        checks.push({ id: 'tab-order', status: 'warn', detail: `Tab order set on ${pagesWithTabs} of ${pages.length} page(s).` });
    } else {
        checks.push({ id: 'tab-order', status: 'fail', detail: 'No pages have tab order (/Tabs) defined.' });
    }

    // 10. XMP Metadata stream
    const metadata = catalog.lookup(PDFName.of('Metadata'));
    if (metadata instanceof PDFStream) {
        checks.push({ id: 'xmp-metadata', status: 'pass', detail: 'XMP metadata stream is present.' });
    } else {
        checks.push({ id: 'xmp-metadata', status: 'warn', detail: 'No XMP metadata stream found.' });
    }

    onProgress?.(100);

    // Calculate score: pass=1, warn=0.5, fail=0, na=excluded
    const scored = checks.filter(c => c.status !== 'na');
    const points = scored.reduce((sum, c) => {
        if (c.status === 'pass') return sum + 1;
        if (c.status === 'warn') return sum + 0.5;
        return sum;
    }, 0);
    const score = scored.length > 0 ? Math.round((points / scored.length) * 100) : 0;

    return {
        fileName: file.name,
        pageCount: pages.length,
        score,
        checks,
    };
}

/**
 * Walk the PDF structure tree to count /Figure elements and check for /Alt text.
 * Uses BFS with a visited set to guard against circular references.
 */
function walkStructureTree(root: PDFDict, pdfDoc: PDFDocument): { totalFigures: number; missingAlt: number } {
    let totalFigures = 0;
    let missingAlt = 0;
    const visitedRefs = new Set<PDFRef>();
    const visitedDicts = new Set<PDFDict>();
    const queue: PDFDict[] = [root];
    visitedDicts.add(root);

    while (queue.length > 0) {
        const node = queue.shift()!;
        const role = node.get(PDFName.of('S'));
        if (role?.toString() === '/Figure') {
            totalFigures++;
            const alt = node.lookup(PDFName.of('Alt'));
            const altText = (alt instanceof PDFString || alt instanceof PDFHexString) ? alt.decodeText() : '';
            if (!altText.trim()) missingAlt++;
        }

        // Enqueue children (/K can be a single dict, ref, or array)
        const kids = node.get(PDFName.of('K'));
        if (!kids) continue;

        const kidsResolved = node.lookup(PDFName.of('K'));
        if (kidsResolved instanceof PDFDict) {
            if (!visitedDicts.has(kidsResolved)) {
                visitedDicts.add(kidsResolved);
                queue.push(kidsResolved);
            }
        } else if (kidsResolved instanceof PDFArray) {
            for (let i = 0; i < kidsResolved.size(); i++) {
                const ref = kidsResolved.get(i);
                if (ref instanceof PDFRef) {
                    if (visitedRefs.has(ref)) continue;
                    visitedRefs.add(ref);
                }
                const child = kidsResolved.lookup(i);
                if (child instanceof PDFDict) {
                    if (!visitedDicts.has(child)) {
                        visitedDicts.add(child);
                        queue.push(child);
                    }
                }
            }
        }
    }

    return { totalFigures, missingAlt };
}
