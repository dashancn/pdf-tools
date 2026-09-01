import { describe, expect, it, vi } from 'vitest';
import { probeOcrAssets } from '@/Services/ocrAssetProbe';

describe('probeOcrAssets', () => {
    it('reports the exact unavailable same-origin OCR assets before recognition starts', async () => {
        const fetcher = vi.fn(async (url: string) => ({ ok: !url.endsWith('/chi_sim.traineddata.gz'), status: 200 })) as any;

        const result = await probeOcrAssets('chi_sim+eng', fetcher, 'https://pdf.i41.cn');

        expect(result.ok).toBe(false);
        expect(result.failed).toEqual(['https://pdf.i41.cn/ocr/lang/chi_sim.traineddata.gz']);
        expect(fetcher).toHaveBeenCalledWith(expect.stringContaining('/ocr/worker.min.js'), expect.objectContaining({ method: 'HEAD' }));
    });

    it('probes each selected language model plus worker and core loader', async () => {
        const urls: string[] = [];
        const fetcher = vi.fn(async (url: string) => { urls.push(url); return { ok: true, status: 200 }; }) as any;

        const result = await probeOcrAssets('chi_sim+eng', fetcher, 'https://pdf.i41.cn');

        expect(result.ok).toBe(true);
        expect(urls).toEqual(expect.arrayContaining([
            'https://pdf.i41.cn/ocr/worker.min.js',
            'https://pdf.i41.cn/ocr/core/tesseract-core-simd-lstm.wasm.js',
            'https://pdf.i41.cn/ocr/lang/chi_sim.traineddata.gz',
            'https://pdf.i41.cn/ocr/lang/eng.traineddata.gz',
        ]));
    });
});
