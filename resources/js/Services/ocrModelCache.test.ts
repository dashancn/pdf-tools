import { afterEach, describe, expect, it, vi } from 'vitest';
import { getOcrModelCacheStatus } from '@/Services/ocrModelCache';

const originalIndexedDb = globalThis.indexedDB;

afterEach(() => {
    vi.unstubAllGlobals();
    if (originalIndexedDb) vi.stubGlobal('indexedDB', originalIndexedDb);
});

describe('getOcrModelCacheStatus', () => {
    it('reports uncached models when IndexedDB has no traineddata entries', async () => {
        vi.stubGlobal('indexedDB', {
            databases: vi.fn(async () => []),
        });

        await expect(getOcrModelCacheStatus('chi_sim+eng')).resolves.toMatchObject({
            status: 'missing',
            missingLanguages: ['chi_sim', 'eng'],
            estimatedDownloadMb: 4.5,
        });
    });

    it('reports cached models when traineddata keys exist', async () => {
        const request: any = {};
        const store = { getAllKeys: vi.fn(() => request) };
        const db = {
            objectStoreNames: { contains: vi.fn(() => true), 0: 'keyval', length: 1 },
            transaction: vi.fn(() => ({ objectStore: vi.fn(() => store) })),
            close: vi.fn(),
        };
        const openRequest: any = {};

        vi.stubGlobal('indexedDB', {
            databases: vi.fn(async () => [{ name: 'keyval-store' }]),
            open: vi.fn(() => {
                queueMicrotask(() => {
                    openRequest.result = db;
                    openRequest.onsuccess?.();
                    queueMicrotask(() => {
                        request.result = ['./chi_sim.traineddata', './eng.traineddata'];
                        request.onsuccess?.();
                    });
                });
                return openRequest;
            }),
        });

        await expect(getOcrModelCacheStatus('chi_sim+eng')).resolves.toMatchObject({
            status: 'cached',
            missingLanguages: [],
            estimatedDownloadMb: 0,
        });
    });
});
