const SW_URL = '/service-worker.js';

export type InstallPromptState = {
  available: boolean;
  promptInstall: () => Promise<boolean>;
};

let installState: InstallPromptState | null = null;

export const createInstallPromptState = (): InstallPromptState => {
  if (installState) return installState;

  let deferredPrompt: BeforeInstallPromptEvent | null = null;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
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
      if (!deferredPrompt) return false;
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      deferredPrompt = null;
      return result.outcome === 'accepted';
    }
  };

  return installState;
};

export const getInstallPromptState = (): InstallPromptState => createInstallPromptState();

export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.register(SW_URL, { scope: '/' });
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
};

declare global {
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
    prompt(): Promise<void>;
  }
}
