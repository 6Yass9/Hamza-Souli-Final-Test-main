import React from 'react';
import { ArrowDown } from 'lucide-react';

interface HeroProps {
  scrollToSection: (id: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ scrollToSection }) => {
  return (
    <section
      id="home"
      className="relative min-h-screen lg:min-h-[120vh] w-full overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero_background_picture.jpg"
          alt="Couple - Hamza Souli Weddings and Events"
          // Focus slightly above center so the couple + arch stay visible on wide screens
          className="w-full h-full object-cover object-[50%_32%]"
        />
        {/* Lighter overlay to resemble the PDF (keep sky rich) */}
        <div className="absolute inset-0 bg-stone-900/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full min-h-screen lg:min-h-[120vh] flex flex-col items-center text-center text-white px-4">
        {/* Top block (ABOUT / OUR / LOVE + lines + small captions) */}
        <div className="pt-16 sm:pt-20 lg:pt-24">
          <p className="font-serif text-sm sm:text-base tracking-[0.25em] uppercase text-white/90">
            ABOUT
          </p>

          <div className="mt-2 leading-none">
            <div className="font-serif font-light text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.08em]">
              OUR
            </div>
            <div className="font-serif font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.18em] mt-2">
              LOVE
            </div>
          </div>

          {/* Three short divider lines like the PDF */}
          <div className="mt-5 flex items-center justify-center gap-3 opacity-80">
            <span className="inline-block w-8 h-px bg-white/80" />
            <span className="inline-block w-8 h-px bg-white/80" />
            <span className="inline-block w-8 h-px bg-white/80" />
          </div>

          {/* Small centered captions */}
          <div className="mt-4 space-y-1">
            <p className="font-sans text-[10px] sm:text-[11px] tracking-[0.35em] uppercase text-white/85">
              LOVE WILL BE FOREVER
            </p>
            <p className="font-sans text-[10px] sm:text-[11px] tracking-[0.35em] uppercase text-white/85">
              I WILL LOVE YOU FOREVER
            </p>
          </div>
        </div>

        {/* Middle title block (HAMZA SOULI + subtitle) */}
        <div className="mt-10 sm:mt-12 lg:mt-14">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.18em]">
            HAMZA SOULI
          </h1>
          <p className="mt-3 font-sans text-[10px] sm:text-[11px] tracking-[0.45em] uppercase text-white/85">
            WEDDINGS AND EVENTS PHOTOGRAPHER
          </p>
        </div>

        {/* CTA (keep but make it subtle so it doesn't ruin the magazine look) */}
        <div className="mt-10 sm:mt-12">
          <button
            onClick={() => scrollToSection('portfolio')}
            className="px-8 py-3 border border-white/80 text-white hover:bg-white hover:text-stone-900 transition-all duration-300 tracking-[0.25em] uppercase text-xs"
          >
            Voir le portfolio
          </button>
        </div>

        {/* Scroll hint */}
        <div className="mt-auto pb-8 sm:pb-10 animate-bounce">
          <button
            onClick={() => scrollToSection('services')}
            className="text-white/80 hover:text-white transition-colors"
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
