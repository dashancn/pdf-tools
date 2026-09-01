import { describe, expect, it, vi } from 'vitest';
import { renderPageForProtection } from '@/Services/pdf/protect';

describe('protect PDF page geometry', () => {
    it('renders into a stable snapshot canvas instead of a live OffscreenCanvas', async () => {
        const renderCanvas = { width: 1191, height: 794 } as any;
        const snapshotCanvas = { width: 1191, height: 794 } as any;
        const renderContext = {} as any;
        const snapshotContext = { fillRect: vi.fn(), drawImage: vi.fn() } as any;
        const canvases = [renderCanvas, snapshotCanvas];
        const createCanvas = vi.fn(() => canvases.shift());
        renderCanvas.getContext = () => renderContext;
        snapshotCanvas.getContext = () => snapshotContext;
        const page = {
            getViewport: ({ scale }: { scale: number }) => scale === 1
                ? { width: 595.5, height: 397 }
                : { width: 1191, height: 794 },
            render: vi.fn(() => ({ promise: Promise.resolve() })),
        } as any;

        const result = await renderPageForProtection(page, createCanvas as any);

        expect(snapshotContext.drawImage).toHaveBeenCalledWith(renderCanvas, 0, 0);
        expect(result.canvas).toBe(snapshotCanvas);
        expect(result.widthPt).toBe(595.5);
        expect(result.heightPt).toBe(397);
    });
});
