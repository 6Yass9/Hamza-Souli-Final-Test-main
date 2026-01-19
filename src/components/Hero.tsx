import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';

interface HeroProps {
  scrollToSection: (id: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ scrollToSection }) => {
  // Lightweight scroll-reveal for hero text
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // reveal once
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -15% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="home" className="relative min-h-screen lg:min-h-[210vh] w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero_background_picture.jpg"
          alt="Couple - Hamza Souli Weddings and Events"
          className="w-full h-full
            object-cover
            object-[50%_70%]
            transition-transform"
        />
        <div className="absolute inset-0 bg-stone-900/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full min-h-screen lg:min-h-[150vh] flex flex-col items-center text-center text-white px-4">
        {/* Animated reveal block */}
        <div
          ref={ref}
          className={[
            'pt-16 sm:pt-20 lg:pt-24 transition-all duration-700 ease-out will-change-transform',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          ].join(' ')}
        >
          <p className="font-serif text-sm tracking-[0.25em] uppercase text-white/90">ABOUT</p>

          <div className="mt-2 leading-none">
            <div className="font-serif font-light text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.08em]">
              OUR
            </div>
            <div className="font-serif font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.18em] mt-2">
              LOVE
            </div>
          </div>

          <div className="mt-5 flex justify-center gap-3 opacity-80">
            <span className="w-8 h-px bg-white/80" />
            <span className="w-8 h-px bg-white/80" />
            <span className="w-8 h-px bg-white/80" />
          </div>

          <div className="mt-4 space-y-1">
            <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-white/85">LOVE WILL BE FOREVER</p>
            <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-white/85">I WILL LOVE YOU FOREVER</p>
          </div>

          <div className="mt-12">
            {/* Replace photographer line with logo (white version for dark hero) */}
            <div className="mt-4 flex justify-center">
              <img src="/brand-logo-white.png" 
              alt="Hamza Souli" 
              className="h-10 md:h-20 w-auto opacity-95" 
              />
            </div>
          </div>

          <div className="mt-12">
            <button
              onClick={() => scrollToSection('portfolio')}
              className="px-8 py-3 border border-white/80 text-white hover:bg-white hover:text-stone-900 transition-all duration-300 tracking-[0.25em] uppercase text-xs"
            >
              Voir le portfolio
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-auto pb-10 animate-bounce">
          <button
            onClick={() => scrollToSection('services')}
            className="text-white/80 hover:text-white"
            aria-label="Scroll"
            type="button"
          >
            <ArrowDown size={32} strokeWidth={1} />
          </button>
        </div>
      </div>
    </section>
  );
};
