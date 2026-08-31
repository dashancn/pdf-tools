export const TESSERACT_CDN_ORIGIN = 'https://cdn.jsdelivr.net';
export const TESSERACT_DATA_ORIGIN = 'https://tessdata.projectnaptha.com';
export const TESSERACT_WORKER_PATH = `${TESSERACT_CDN_ORIGIN}/npm/tesseract.js@v7.0.0/dist/worker.min.js`;
export const TESSERACT_LANG_PATH = `${TESSERACT_DATA_ORIGIN}/4.0.0`;

export function tesseractWorkerOptions() {
    return {
        workerPath: TESSERACT_WORKER_PATH,
        langPath: TESSERACT_LANG_PATH,
    };
}
