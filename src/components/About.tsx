import React from 'react';
import { useTranslation } from 'react-i18next';

export const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="about" className="py-28 px-6 bg-stone-50">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-400 mb-6">
          {t('about.kicker')}
        </p>

        <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-8">
          {t('about.title')}
        </h2>

        <p className="text-stone-600 text-lg leading-relaxed">
          {t('about.description')}
        </p>
      </div>
    </section>
  );
};
