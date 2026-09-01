export const TESSERACT_CDN_ORIGIN = 'https://cdn.jsdelivr.net';
export const TESSERACT_WORKER_PATH = `${TESSERACT_CDN_ORIGIN}/npm/tesseract.js@v7.0.0/dist/worker.min.js`;

export function tesseractWorkerOptions() {
    return {
        workerPath: TESSERACT_WORKER_PATH,
    };
}
