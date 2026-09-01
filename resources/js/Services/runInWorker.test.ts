import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class MockWorker {
    static instances: MockWorker[] = [];
    onmessage: ((event: MessageEvent) => void) | null = null;
    onerror: ((event: ErrorEvent) => void) | null = null;
    messages: any[] = [];

    constructor() {
        MockWorker.instances.push(this);
    }

    postMessage(message: any) {
        this.messages.push(message);
    }

    terminate() {}
}

vi.stubGlobal('Worker', MockWorker as any);

import { runInWorker } from '@/Services/runInWorker';

describe('runInWorker timeouts', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        MockWorker.instances.length = 0;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('allows OCR operations to run longer than five minutes', async () => {
        const promise = runInWorker('ocr-pdf', [], {});
        const expectation = expect(promise).rejects.toThrow('Operation timed out after 15 minutes');

        await vi.advanceTimersByTimeAsync(5 * 60 * 1000 + 1);
        expect(MockWorker.instances[0].messages).toHaveLength(1);

        await vi.advanceTimersByTimeAsync(10 * 60 * 1000);
        await expectation;
    });
});
