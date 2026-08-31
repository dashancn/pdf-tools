const RELOAD_MARKER = 'pwa-controller-reloaded';

export function registerServiceWorker(): void {
    if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;

        if (sessionStorage.getItem(RELOAD_MARKER) === '1') {
            sessionStorage.removeItem(RELOAD_MARKER);
            return;
        }

        sessionStorage.setItem(RELOAD_MARKER, '1');
        window.location.reload();
    });

    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
            await registration.update();

            if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }

            registration.addEventListener('updatefound', () => {
                const worker = registration.installing;
                worker?.addEventListener('statechange', () => {
                    if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                        worker.postMessage({ type: 'SKIP_WAITING' });
                    }
                });
            });
        } catch (error) {
            console.warn('[PWA] Service worker registration failed:', error);
        }
    });
}
