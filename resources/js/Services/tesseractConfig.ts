export function tesseractWorkerOptions() {
    return {
        workerPath: '/ocr/worker.min.js',
        corePath: '/ocr/core',
        langPath: '/ocr/lang',
    };
}
