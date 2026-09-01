export interface OcrLanguageOption {
    value: string;
    label: string;
}

export const OCR_LANGUAGE_OPTIONS: OcrLanguageOption[] = [
    { value: 'chi_sim+eng', label: '简体中文 + English' },
    { value: 'chi_sim', label: '简体中文' },
    { value: 'chi_tra+eng', label: '繁體中文 + English' },
    { value: 'chi_tra', label: '繁體中文' },
    { value: 'eng', label: 'English' },
    { value: 'ita', label: 'Italiano' },
    { value: 'fra', label: 'Français' },
    { value: 'deu', label: 'Deutsch' },
    { value: 'spa', label: 'Español' },
    { value: 'por', label: 'Português' },
    { value: 'nld', label: 'Nederlands' },
    { value: 'swe', label: 'Svenska' },
    { value: 'dan', label: 'Dansk' },
    { value: 'nor', label: 'Norsk' },
    { value: 'fin', label: 'Suomi' },
    { value: 'ell', label: 'Ελληνικά' },
    { value: 'ces', label: 'Čeština' },
    { value: 'slv', label: 'Slovenščina' },
];

const supportedLanguages = new Set(OCR_LANGUAGE_OPTIONS.map(option => option.value));

export function isSupportedOcrLanguage(language: string): boolean {
    return supportedLanguages.has(language);
}
