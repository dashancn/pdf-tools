export type OcrModelCacheStatus = 'cached' | 'missing' | 'unknown';

export interface OcrModelCacheResult {
    status: OcrModelCacheStatus;
    languages: string[];
    missingLanguages: string[];
    estimatedDownloadMb: number;
}

const MODEL_SIZE_MB: Record<string, number> = {
    chi_sim: 1.6,
    eng: 2.9,
    chi_tra: 1.6,
};

function requestedLanguages(language: string): string[] {
    return [...new Set(language.split('+').filter(Boolean))];
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function cachedKeys(): Promise<string[] | null> {
    if (!globalThis.indexedDB) return null;

    try {
        const databases = typeof indexedDB.databases === 'function'
            ? await indexedDB.databases()
            : [{ name: 'keyval-store' }];
        const dbInfo = databases.find((db) => db.name?.includes('keyval')) ?? databases[0];
        if (!dbInfo?.name) return [];

        const db = await requestResult(indexedDB.open(dbInfo.name));
        try {
            const storeName = db.objectStoreNames.contains('keyval')
                ? 'keyval'
                : db.objectStoreNames[0];
            if (!storeName) return [];
            const transaction = db.transaction(storeName, 'readonly');
            const keys = await requestResult(transaction.objectStore(storeName).getAllKeys());
            return keys.map(String);
        } finally {
            db.close();
        }
    } catch {
        return null;
    }
}

export async function getOcrModelCacheStatus(language: string): Promise<OcrModelCacheResult> {
    const languages = requestedLanguages(language);
    const keys = await cachedKeys();

    if (keys === null) {
        return {
            status: 'unknown',
            languages,
            missingLanguages: languages,
            estimatedDownloadMb: languages.reduce((sum, lang) => sum + (MODEL_SIZE_MB[lang] ?? 2), 0),
        };
    }

    const missingLanguages = languages.filter(
        (lang) => !keys.some((key) => key.endsWith(`${lang}.traineddata`)),
    );

    return {
        status: missingLanguages.length === 0 ? 'cached' : 'missing',
        languages,
        missingLanguages,
        estimatedDownloadMb: Number(
            missingLanguages.reduce((sum, lang) => sum + (MODEL_SIZE_MB[lang] ?? 2), 0).toFixed(1),
        ),
    };
}
