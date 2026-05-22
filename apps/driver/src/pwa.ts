const SW_URL = '/service-worker.js';

export const initPwa = () => {
  let deferred: any = null;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event;
    window.dispatchEvent(new CustomEvent('lv:install-ready'));
  });

  const promptInstall = async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const result = await deferred.userChoice;
    deferred = null;
    return result.outcome === 'accepted';
  };

  return {
    isInstallReady: () => Boolean(deferred),
    promptInstall
  };
};

export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return;
  await navigator.serviceWorker.register(SW_URL, { scope: '/' });
};
