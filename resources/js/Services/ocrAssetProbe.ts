export interface OcrAssetProbeResult {
    ok: boolean;
    failed: string[];
}

type FetchLike = (input: string, init?: RequestInit) => Promise<{ ok: boolean; status: number }>;

function languages(language: string): string[] {
    return language.split('+').map(value => value.trim()).filter(Boolean);
}

export async function probeOcrAssets(
    language: string,
    fetcher: FetchLike = fetch,
    origin: string = location.origin,
): Promise<OcrAssetProbeResult> {
    const base = origin.replace(/\/$/, '');
    const urls = [
        `${base}/ocr/worker.min.js`,
        `${base}/ocr/core/tesseract-core-simd-lstm.wasm.js`,
        ...languages(language).map(value => `${base}/ocr/lang/${value}.traineddata.gz`),
    ];

    const failed: string[] = [];
    await Promise.all(urls.map(async url => {
        try {
            const response = await fetcher(url, { method: 'HEAD', cache: 'force-cache' });
            if (!response.ok) failed.push(url);
        } catch {
            failed.push(url);
        }
    }));

    return { ok: failed.length === 0, failed };
}
