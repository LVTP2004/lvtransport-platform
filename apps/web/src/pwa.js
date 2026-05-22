const SW_URL = '/service-worker.js';
let installState = null;
export const createInstallPromptState = () => {
    if (installState)
        return installState;
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredPrompt = event;
        window.dispatchEvent(new CustomEvent('lv:pwa-install-available'));
    });
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        window.dispatchEvent(new CustomEvent('lv:pwa-installed'));
    });
    installState = {
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
    return installState;
};
export const getInstallPromptState = () => createInstallPromptState();
export const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator))
        return;
    const registration = await navigator.serviceWorker.register(SW_URL, { scope: '/' });
    if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
};
