import React, { useEffect, useMemo, useState } from 'react';
import { GalleryItem } from '../types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  items: GalleryItem[];
}

type Filter = 'all' | 'photos' | 'videos';

const isVideoItem = (item: GalleryItem) => {
  if (item.mediaType === 'video') return true;
  if (item.mimeType?.startsWith('video/')) return true;

  // Fallback: infer from URL extension (works for public URLs)
  const url = (item.url || '').toLowerCase().split('?')[0];
  return (
    url.endsWith('.mp4') ||
    url.endsWith('.webm') ||
    url.endsWith('.mov') ||
    url.endsWith('.m4v') ||
    url.endsWith('.avi')
  );
};

export const Portfolio: React.FC<Props> = ({ items }) => {
  const { t } = useTranslation();

  const [filter, setFilter] = useState<Filter>('all');

  // Simple fade/slide animation when switching filters
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    setVisible(false);
    const id = window.setTimeout(() => setVisible(true), 80);
    return () => window.clearTimeout(id);
  }, [filter]);

  const filtered = useMemo(() => {
    if (filter === 'photos') return items.filter((i) => !isVideoItem(i));
    if (filter === 'videos') return items.filter((i) => isVideoItem(i));
    return items;
  }, [items, filter]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const prev = () => setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
  const next = () => setActiveIndex((i) => (i + 1) % filtered.length);

  const activeItem = filtered[activeIndex];

  const FilterButton = ({ value, label }: { value: Filter; label: string }) => {
    const active = filter === value;
    return (
      <button
        type="button"
        onClick={() => setFilter(value)}
        className={`relative px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${
          active ? 'text-stone-900' : 'text-stone-500 hover:text-stone-700'
        }`}
        aria-pressed={active}
      >
        {label}
        <span
          className={`absolute left-0 right-0 -bottom-[2px] h-[2px] bg-stone-900 transition-transform duration-300 origin-left ${
            active ? 'scale-x-100' : 'scale-x-0'
          }`}
        />
      </button>
    );
  };

  return (
    <section id="portfolio" className="py-24 bg-stone-100 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold tracking-[0.2em] text-stone-500 uppercase">
            {t('portfolio.badge', { defaultValue: 'Portfolio' })}
          </span>
          <h3 className="font-serif text-4xl md:text-5xl text-stone-900 mt-4 mb-6">
            {t('portfolio.title', { defaultValue: 'Our Work' })}
          </h3>
          <p className="text-stone-600 font-light leading-relaxed">
            {t('portfolio.subtitle', { defaultValue: 'Browse photos and videos from our recent projects.' })}
          </p>
        </div>

        {/* Animated filter controls */}
        <div className="flex items-center justify-center mb-10">
          <div className="inline-flex border-b border-stone-200">
            <FilterButton value="all" label={t('portfolio.filters.all', { defaultValue: 'All' })} />
            <FilterButton value="photos" label={t('portfolio.filters.photos', { defaultValue: 'Photos' })} />
            <FilterButton value="videos" label={t('portfolio.filters.videos', { defaultValue: 'Videos' })} />
          </div>
        </div>

        {/* Grid (animates on filter change) */}
        {filtered.length === 0 ? (
          <div className="text-center text-stone-500 text-sm italic border-2 border-dashed border-stone-200 rounded p-10">
            {t('portfolio.empty', { defaultValue: 'No media to show yet.' })}
          </div>
        ) : (
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-300 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            {filtered.map((item, i) => {
              const isVideo = isVideoItem(item);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openLightbox(i)}
                  className="group relative overflow-hidden bg-stone-200 aspect-[3/4] focus:outline-none"
                  aria-label={item.title || (isVideo ? 'Video' : 'Image')}
                >
                  {isVideo ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title || 'Portfolio item'}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}

                  <div className="absolute inset-0 bg-stone-900/35 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {isVideo && (
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] px-2 py-1 uppercase tracking-widest">
                      {t('portfolio.videoTag', { defaultValue: 'Video' })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && activeItem && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <button
            type="button"
            className="absolute top-6 right-6 text-white hover:opacity-80"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <X size={32} />
          </button>

          {filtered.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 md:left-10 text-white hover:opacity-80"
                onClick={prev}
                aria-label="Previous"
              >
                <ChevronLeft size={36} />
              </button>
              <button
                type="button"
                className="absolute right-4 md:right-10 text-white hover:opacity-80"
                onClick={next}
                aria-label="Next"
              >
                <ChevronRight size={36} />
              </button>
            </>
          )}

          <div className="max-w-[95vw] max-h-[85vh]">
            {isVideoItem(activeItem) ? (
              <video
                src={activeItem.url}
                controls
                autoPlay
                playsInline
                className="max-h-[85vh] w-auto max-w-full object-contain shadow-2xl"
              />
            ) : (
              <img
                src={activeItem.url}
                alt={activeItem.title || 'Portfolio item'}
                className="max-h-[85vh] w-auto max-w-full object-contain shadow-2xl"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
};