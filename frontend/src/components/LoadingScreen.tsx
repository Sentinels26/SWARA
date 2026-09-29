import { useState, useEffect } from 'react';

const swaraTranslations = [
  'SWARA',
  'स्वरा',
  'স্বর',
  'સ્વરા',
  'ಸ್ವರ',
  'സ്വര',
  'ସ୍ୱର',
  'ਸਵਰਾ',
  'ஸ்வரா',
  'స్వర',
  'سوارا'
];

interface LoadingScreenProps {
  message?: string;
  error?: string;
  onRetry?: () => void;
}
import { useTranslation } from 'react-i18next';

export function LoadingScreen({ message, error, onRetry }: LoadingScreenProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (error || isReducedMotion) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % swaraTranslations.length);
    }, 800); // 800ms per transition for a calm, slow pace

    return () => clearInterval(interval);
  }, [error, isReducedMotion]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
        <div className="w-24 h-24 mb-6 rounded-2xl shadow-sm bg-white dark:bg-slate-800 p-2 flex items-center justify-center">
          <img src="/logo.png" alt="SWARA Logo" className="w-full h-full object-contain opacity-50 grayscale" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4 tracking-tight">SWARA</h1>
        <p className="text-red-500 mb-6 text-center max-w-sm">{error}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-6 py-2.5 bg-[#3c848c] hover:bg-[#316c73] text-white font-medium rounded-xl transition-colors"
          >
            {t('common.try_again', 'Try Again')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="flex flex-col items-center">
        <img src="/logo.png" alt="SWARA Logo" className="w-24 h-24 mb-6 rounded-2xl shadow-md bg-white p-2" />
        
        <div className="h-12 overflow-hidden flex items-center justify-center relative w-64">
          {isReducedMotion ? (
            <h1 className="text-4xl font-bold text-[#3c848c] tracking-wider">SWARA</h1>
          ) : (
            swaraTranslations.map((word, index) => (
              <h1
                key={word}
                className={`absolute text-4xl font-bold text-[#3c848c] tracking-wider transition-all duration-500 ease-in-out ${
                  index === currentIndex
                    ? 'opacity-100 transform translate-y-0'
                    : index < currentIndex
                    ? 'opacity-0 transform -translate-y-8'
                    : 'opacity-0 transform translate-y-8'
                }`}
              >
                {word}
              </h1>
            ))
          )}
        </div>
        
        {message && (
          <p className="mt-8 text-slate-500 dark:text-slate-400 font-medium animate-pulse text-sm">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
