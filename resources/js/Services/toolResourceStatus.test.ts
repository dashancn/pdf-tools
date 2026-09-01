import { describe, expect, it } from 'vitest';
import { ocrLanguageForTool, toolNeedsOcrModels } from '@/Services/toolResourceStatus';

describe('tool resource status', () => {
    it('identifies every tool configuration that loads OCR models', () => {
        expect(toolNeedsOcrModels('ocr-pdf', false)).toBe(true);
        expect(toolNeedsOcrModels('pdf-to-text', true)).toBe(true);
        expect(toolNeedsOcrModels('pdf-to-markdown', true)).toBe(true);
        expect(toolNeedsOcrModels('pdf-to-png', false)).toBe(false);
        expect(toolNeedsOcrModels('compare-pdf', false)).toBe(false);
    });

    it('uses the selected OCR language for cache and download prompts', () => {
        expect(ocrLanguageForTool('ocr-pdf', 'chi_sim', 'eng')).toBe('chi_sim');
        expect(ocrLanguageForTool('pdf-to-text', 'chi_sim', 'chi_tra+eng')).toBe('chi_tra+eng');
    });
});
