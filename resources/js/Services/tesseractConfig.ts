function appOrigin(): string {
    if (typeof location !== 'undefined' && location.origin) return location.origin;
    return 'http://localhost';
}

export function tesseractWorkerOptions() {
    const origin = appOrigin();
    return {
        workerPath: `${origin}/ocr/worker.min.js`,
        corePath: `${origin}/ocr/core`,
        langPath: `${origin}/ocr/lang`,
    };
}
