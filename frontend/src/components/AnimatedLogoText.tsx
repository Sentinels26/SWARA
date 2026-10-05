import { useState, useEffect } from 'react';

const swaraTranslations = [
  'SWARA',
  'स्वारा',
  'স্বরা',
  'સ્વરા',
  'ಸ್ವರಾ',
  'സ്വരാ',
  'ସ୍ୱରା',
  'ਸਵਰਾ',
  'ஸ்வரா',
  'స్వరా',
  'سوارا',
];

interface AnimatedLogoTextProps {
  className?: string;
  isPaused?: boolean;
}

export function AnimatedLogoText({
  className = '',
  isPaused = false,
}: AnimatedLogoTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    setIsReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', listener);

    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  useEffect(() => {
    if (isPaused || isReducedMotion) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        return (prev + 1) % swaraTranslations.length;
      });
    }, 1500);

    return () => {
      clearInterval(interval);
    };
  }, [isPaused, isReducedMotion]);

  if (isReducedMotion) {
    return (
      <div className={`text-center ${className}`}>
        <h1 className="font-bold tracking-wider">
          SWARA
        </h1>
      </div>
    );
  }

  return (
    <div
      className={`relative h-[1.2em] overflow-hidden flex items-center justify-center w-full ${className}`}
    >
      {swaraTranslations.map((word, index) => {
        let position =
          'translate-y-8 opacity-0';

        if (index === currentIndex) {
          position =
            'translate-y-0 opacity-100';
        } else if (
          index ===
          (currentIndex -
            1 +
            swaraTranslations.length) %
            swaraTranslations.length
        ) {
          position =
            '-translate-y-8 opacity-0';
        } else {
          position =
            'translate-y-12 opacity-0 hidden';
        }

        return (
          <h1
            key={`${word}-${index}`}
            className={`absolute font-bold tracking-wider transition-all duration-700 ease-in-out ${position}`}
          >
            {word}
          </h1>
        );
      })}
    </div>
  );
}
