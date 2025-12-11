import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPWA: React.FC = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showSafariInstructions, setShowSafariInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Перевірка чи додаток вже встановлено
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Визначення iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Визначення Safari (покращена перевірка)
    const isSafariBrowser = /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(navigator.userAgent) ||
                           (isIOSDevice && !/(crios|fxios|edgios)/i.test(navigator.userAgent));
    setIsSafari(isSafariBrowser);
    
    // Debug log
    console.log('PWA Install Button:', {
      isIOSDevice,
      isSafariBrowser,
      userAgent: navigator.userAgent,
      standalone: (window.navigator as any).standalone
    });

    // ЗАВЖДИ показуємо кнопку встановлення
    setShowInstallButton(true);

    // Для Chrome/Edge - слухаємо beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    console.log('Install button clicked:', { isIOS, isSafari, hasDeferredPrompt: !!deferredPrompt });
    
    // Якщо iOS або Safari - показуємо інструкції
    if (isIOS || isSafari) {
      setShowSafariInstructions(true);
      return;
    }

    // Для Chrome/Edge - викликаємо нативний промпт
    if (!deferredPrompt) {
      // Fallback: якщо немає нативного промпту, показуємо інструкції
      setShowSafariInstructions(true);
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }

    setDeferredPrompt(null);
  };

  const closeSafariInstructions = () => {
    setShowSafariInstructions(false);
  };

  // Не показувати якщо вже встановлено
  if (isInstalled || !showInstallButton) {
    return null;
  }

  return (
    <>
      {/* Кнопка "Встановити" */}
      <button
        onClick={handleInstallClick}
        className="text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full font-medium transition shadow-md flex items-center gap-2"
        title={t('install.button_title') || 'Встановити додаток'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        <span className="hidden sm:inline">{t('install.button') || '📲 Встановити'}</span>
        <span className="inline sm:hidden">📲</span>
      </button>

      {/* Modal з інструкціями для Safari/iOS */}
      {showSafariInstructions && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
            {/* Заголовок */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {t('install.modal_title') || 'Встановити LegalMind'}
              </h3>
              <button
                onClick={closeSafariInstructions}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Інструкції */}
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="text-sm">
                {t('install.instructions_intro') || 'Щоб встановити LegalMind як додаток на ваш пристрій:'}
              </p>

              {isIOS ? (
                // Інструкції для iOS Safari
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span>
                      {t('install.ios_step1') || 'Натисніть кнопку «Поділитися»'} 
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 inline mx-1 text-blue-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
                      </svg>
                      {t('install.ios_step1_location') || 'внизу екрану'}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span>{t('install.ios_step2') || 'Прокрутіть вниз і виберіть «На екран «Домой»»'}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span>{t('install.ios_step3') || 'Натисніть «Додати» у правому верхньому куті'}</span>
                  </li>
                </ol>
              ) : (
                // Інструкції для Safari на Mac
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span>{t('install.safari_step1') || 'Натисніть меню Safari → Налаштування → Веб-сайти'}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span>{t('install.safari_step2') || 'Або додайте сайт до Dock для швидкого доступу'}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span>{t('install.safari_step3') || 'Для iOS: використовуйте кнопку «Поділитися» → «На екран «Домой»»'}</span>
                  </li>
                </ol>
              )}

              {/* Переваги встановлення */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  {t('install.benefits_title') || '✨ Переваги встановлення:'}
                </p>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• {t('install.benefit1') || 'Швидкий доступ з головного екрану'}</li>
                  <li>• {t('install.benefit2') || 'Робота у повноекранному режимі'}</li>
                  <li>• {t('install.benefit3') || 'Відсутність адресного рядка браузера'}</li>
                  <li>• {t('install.benefit4') || 'Офлайн-режим (обмежений)'}</li>
                </ul>
              </div>
            </div>

            {/* Кнопка закриття */}
            <button
              onClick={closeSafariInstructions}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
            >
              {t('install.close') || 'Зрозуміло'}
            </button>
          </div>
        </div>
      )}

      {/* Стилі для анімацій */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

