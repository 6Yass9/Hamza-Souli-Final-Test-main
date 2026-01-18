import React from 'react';

export const About: React.FC = () => {
  return (
    <section id="about" className="py-28 px-6 bg-stone-50">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-400 mb-6">
          À propos
        </p>

        <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-8">
          Hamza Souli Weddings & Events
        </h2>

        <p className="text-stone-600 text-lg leading-relaxed">
          Hamza Souli Weddings and Events Photographer capture des histoires d’amour
          authentiques à travers une approche élégante, naturelle et intemporelle.
          Spécialisé dans la photographie de mariages et d’événements, chaque image
          est pensée pour refléter l’émotion, la beauté et la singularité de chaque
          instant.
        </p>
      </div>
    </section>
  );
};
