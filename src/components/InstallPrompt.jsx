import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone === true;
    
    if (isStandalone) return;

    // Check if dismissed recently (within 24 hours)
    const dismissedTime = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedTime && Date.now() - parseInt(dismissedTime) < 24 * 60 * 60 * 1000) {
      return;
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // Show iOS install instructions after a short delay
      const timer = setTimeout(() => setShowIOSPrompt(true), 2000);
      return () => clearTimeout(timer);
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install prompt after a short delay
      setTimeout(() => setShowInstallPrompt(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setShowIOSPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Android/Chrome install prompt
  if (showInstallPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <div className="bg-emerald-100 p-2.5 rounded-xl flex-shrink-0">
              <Smartphone className="text-emerald-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 text-sm">Install Kasflow</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pasang aplikasi di perangkat Anda untuk akses lebih cepat dan pengalaman offline.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <Download size={14} />
                  Install
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-xs text-slate-500 hover:text-slate-700 px-3 py-2 transition-colors"
                >
                  Nanti saja
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-600 p-1 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // iOS install instructions
  if (showIOSPrompt && isIOS) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <div className="bg-emerald-100 p-2.5 rounded-xl flex-shrink-0">
              <Smartphone className="text-emerald-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 text-sm">Install Kasflow</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Untuk menginstall aplikasi di iPhone/iPad:
              </p>
              <ol className="text-xs text-slate-600 mt-2 space-y-1 list-decimal list-inside">
                <li>Ketuk tombol <span className="inline-flex items-center"><svg className="w-4 h-4 inline mx-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></span> Share</li>
                <li>Pilih "Add to Home Screen"</li>
                <li>Ketuk "Add"</li>
              </ol>
              <button
                onClick={handleDismiss}
                className="mt-3 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                Mengerti
              </button>
            </div>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-600 p-1 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default InstallPrompt;
