// /js/app.js
class App {
  constructor() {
    this.initServiceWorker();
    this.initInstallPrompt();
  }

  async initServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('[App] SW registered:', registration.scope);

      // Eğer waiting varsa (yeni sürüm hazır), kullanıcıya bildir
      if (registration.waiting) {
        this.showUpdateNotification(registration);
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.showUpdateNotification(registration);
          }
        });
      });

      // SW değişince sayfayı reload et (güncel içerik gelsin)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

    } catch (e) {
      console.error('[App] SW registration failed:', e);
    }
  }

  initInstallPrompt() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('[App] beforeinstallprompt fired');
      e.preventDefault();
      deferredPrompt = e;

      const installBtn = document.getElementById('installBtn');
      if (!installBtn) return;

      installBtn.classList.remove('hidden');
      installBtn.onclick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('[App] Install outcome:', outcome);
        deferredPrompt = null;
        installBtn.classList.add('hidden');
      };
    });

    window.addEventListener('appinstalled', () => {
      console.log('[App] PWA installed');
    });
  }

  showUpdateNotification(registration) {
    // aynı bildirim tekrar tekrar basılmasın
    if (document.getElementById('swUpdateToast')) return;

    const toast = document.createElement('div');
    toast.id = 'swUpdateToast';
    toast.className = 'fixed bottom-4 right-4 max-w-sm bg-white border shadow-xl rounded-2xl p-4 z-50';

    toast.innerHTML = `
      <div class="font-black text-gray-900">Yeni sürüm hazır</div>
      <div class="text-sm text-gray-600 font-semibold mt-1">
        Güncellemeyi uygulamak için yenileyin.
      </div>
      <div class="mt-3 flex gap-2">
        <button id="swUpdateBtn" class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-extrabold">
          Güncelle
        </button>
        <button id="swLaterBtn" class="flex-1 border py-2 rounded-xl font-extrabold">
          Sonra
        </button>
      </div>
    `;

    document.body.appendChild(toast);

    document.getElementById('swLaterBtn').onclick = () => toast.remove();
    document.getElementById('swUpdateBtn').onclick = () => {
      // waiting worker'a skipWaiting mesajı gönder
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    };
  }

  showLoading(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16">
        <div class="h-12 w-12 rounded-full border-4 border-gray-200 border-t-red-500 animate-spin"></div>
        <p class="mt-4 text-gray-600 font-extrabold">Yükleniyor...</p>
      </div>
    `;
  }

  showError(container, message, onRetryCallString) {
    if (!container) return;
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div class="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <span class="text-red-600 font-black text-2xl">!</span>
        </div>
        <h3 class="mt-4 text-xl font-black">Bir sorun oluştu</h3>
        <p class="mt-2 text-gray-600 font-semibold">${message}</p>
        ${onRetryCallString ? `
          <button onclick="${onRetryCallString}" class="mt-5 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-extrabold shadow">
            Tekrar Dene
          </button>` : ''
        }
      </div>
    `;
  }

  showEmpty(container, message) {
    if (!container) return;
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
          <span class="text-gray-700 font-black text-xl">—</span>
        </div>
        <h3 class="mt-4 text-xl font-black">Sonuç bulunamadı</h3>
        <p class="mt-2 text-gray-600 font-semibold">${message}</p>
      </div>
    `;
  }

  showFallbackWarning() {
    const warning = document.createElement('div');
    warning.className = 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded-xl font-semibold';
    warning.innerHTML = `<strong>Uyarı:</strong> Canlı API erişilemiyor, örnek veri gösteriliyor.`;
    return warning;
  }
}

const app = new App();
