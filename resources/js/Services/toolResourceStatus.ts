const OCR_OPTIONAL_TOOLS = new Set(['pdf-to-text', 'pdf-to-markdown']);

export function toolNeedsOcrModels(tool: string, ocrEnabled: boolean): boolean {
    return tool === 'ocr-pdf' || (OCR_OPTIONAL_TOOLS.has(tool) && ocrEnabled);
}

export function ocrLanguageForTool(
    tool: string,
    ocrPdfLanguage: string,
    textOcrLanguage: string,
): string {
    return tool === 'ocr-pdf' ? ocrPdfLanguage : textOcrLanguage;
}
