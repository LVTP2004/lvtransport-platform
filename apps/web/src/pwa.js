const SW_URL = '/service-worker.js';
export const createInstallPromptState = () => {
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredPrompt = event;
        window.dispatchEvent(new CustomEvent('lv:pwa-install-available'));
    });
    return {
        get available() {
            return Boolean(deferredPrompt);
        },
        async promptInstall() {
            if (!deferredPrompt)
                return false;
            await deferredPrompt.prompt();
            const result = await deferredPrompt.userChoice;
            deferredPrompt = null;
            return result.outcome === 'accepted';
        }
    };
};
export const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator))
        return;
    const registration = await navigator.serviceWorker.register(SW_URL, { scope: '/' });
    if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
};
