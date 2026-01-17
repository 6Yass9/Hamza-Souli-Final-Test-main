import React from 'react';
import { ArrowDown } from 'lucide-react';

interface HeroProps {
  scrollToSection: (id: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ scrollToSection }) => {
  return (
    <section
      id="home"
      className="relative h-screen w-full overflow-hidden flex items-center justify-center text-center"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          // Files inside the Vite `public/` folder are served from the site root.
          // So `public/hero_background_picture.jpg` becomes `/hero_background_picture.jpg`.
          src="/hero_background_picture.jpg"
          alt="Couple - Hamza Souli Weddings and Events"
          className="w-full h-full object-cover object-center"
        />
        {/* Soft dark overlay for readability (keeps the photo visible) */}
        <div className="absolute inset-0 bg-stone-900/35" />
      </div>

      {/* Content (Magazine cover style) */}
      <div className="relative z-10 px-4 max-w-5xl mx-auto text-white">
        {/* Top small title */}
        <p className="font-sans text-xs md:text-sm tracking-[0.35em] uppercase text-white/90">
          ABOUT OUR LOVE
        </p>

        {/* Main title */}
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.95] mt-6">
          HAMZA SOULI
        </h1>

        {/* Subtitles like in the PDF */}
        <div className="mt-6 space-y-2">
          <p className="font-sans text-[11px] md:text-xs tracking-[0.35em] uppercase text-white/90">
            LOVE WILL BE FOREVER
          </p>
          <p className="font-sans text-[11px] md:text-xs tracking-[0.35em] uppercase text-white/90">
            I WILL LOVE YOU FOREVER
          </p>
        </div>

        {/* Photographer line */}
        <p className="mt-8 font-sans text-[11px] md:text-xs tracking-[0.25em] uppercase text-white/90">
          HAMZA SOULI — WEDDINGS AND EVENTS PHOTOGRAPHER
        </p>

        {/* CTA button (kept from your current hero) */}
        <div className="mt-10">
          <button
            onClick={() => scrollToSection('portfolio')}
            className="px-8 py-3 border border-white/90 text-white hover:bg-white hover:text-stone-900 transition-all duration-300 tracking-[0.2em] uppercase text-xs md:text-sm"
          >
            Voir le portfolio
          </button>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <button
          onClick={() => scrollToSection('services')}
          className="text-white/80 hover:text-white transition-colors"
          aria-label="Scroll"
        >
          <ArrowDown size={32} strokeWidth={1} />
        </button>
      </div>
    </section>
  );
};
