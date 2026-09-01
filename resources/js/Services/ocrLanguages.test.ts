import { describe, expect, it } from 'vitest';
import { OCR_LANGUAGE_OPTIONS, isSupportedOcrLanguage } from '@/Services/ocrLanguages';

describe('OCR language options', () => {
    it('keeps Chinese language choices visible and selected by default', () => {
        expect(OCR_LANGUAGE_OPTIONS.slice(0, 4).map(option => option.value)).toEqual([
            'chi_sim+eng',
            'chi_sim',
            'chi_tra+eng',
            'chi_tra',
        ]);
        expect(OCR_LANGUAGE_OPTIONS[0].label).toContain('简体中文');
    });

    it('rejects a missing or unsupported language instead of silently using English', () => {
        expect(isSupportedOcrLanguage('chi_sim+eng')).toBe(true);
        expect(isSupportedOcrLanguage('')).toBe(false);
        expect(isSupportedOcrLanguage('unknown')).toBe(false);
    });
});
