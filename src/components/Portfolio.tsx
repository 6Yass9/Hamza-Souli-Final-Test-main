import React, { useEffect, useMemo, useState } from 'react';
import { GalleryItem } from '../types';
import { api } from '../services/api';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Filter = 'all' | 'photos' | 'videos';

const isVideoItem = (item: GalleryItem) => {
  if (item.mediaType === 'video') return true;
  if (item.mimeType?.startsWith('video/')) return true;

  const url = (item.url || '').toLowerCase().split('?')[0];
  return (
    url.endsWith('.mp4') ||
    url.endsWith('.webm') ||
    url.endsWith('.mov') ||
    url.endsWith('.m4v') ||
    url.endsWith('.avi')
  );
};

export const Portfolio: React.FC = () => {
  const { t } = useTranslation();

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isFullView, setIsFullView] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [filter, setFilter] = useState<Filter>('all');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const photos = await api.getPublicPhotos();
        setItems(photos);
      } catch (e) {
        console.error('Failed to load public portfolio media', e);
        setItems([]);
      }
    };
    fetchPortfolio();
  }, []);

  // animate on filter change
  useEffect(() => {
    setVisible(false);
    const id = window.setTimeout(() => setVisible(true), 80);
    return () => window.clearTimeout(id);
  }, [filter]);

  const filteredItems = useMemo(() => {
    if (filter === 'photos') return items.filter((i) => !isVideoItem(i));
    if (filter === 'videos') return items.filter((i) => isVideoItem(i));
    return items;
  }, [items, filter]);

  const displayItems = useMemo(
    () => (isFullView ? filteredItems : filteredItems.slice(0, 6)),
    [isFullView, filteredItems]
  );

  const selectedIndex = useMemo(() => {
    if (!selectedId) return null;
    const idx = filteredItems.findIndex((p) => p.id === selectedId);
    return idx >= 0 ? idx : null;
  }, [filteredItems, selectedId]);

  const openLightbox = (id: string) => setSelectedId(id);
  const closeLightbox = () => setSelectedId(null);

  const nextItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null || filteredItems.length === 0) return;
    const next = (selectedIndex + 1) % filteredItems.length;
    setSelectedId(filteredItems[next].id);
  };

  const prevItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null || filteredItems.length === 0) return;
    const prev = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
    setSelectedId(filteredItems[prev].id);
  };

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
    <section id="portfolio" className="py-24 bg-stone-50 px-4 md:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h3 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">{t('portfolio.title')}</h3>
          <p className="text-stone-500 font-light max-w-2xl mx-auto">{t('portfolio.subtitle')}</p>
        </div>

        {/* Animated Filters */}
        <div className="flex items-center justify-center mb-10">
          <div className="inline-flex border-b border-stone-200">
            <FilterButton value="all" label={t('portfolio.filters.all', { defaultValue: 'All' })} />
            <FilterButton value="photos" label={t('portfolio.filters.photos', { defaultValue: 'Photos' })} />
            <FilterButton value="videos" label={t('portfolio.filters.videos', { defaultValue: 'Videos' })} />
          </div>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 transition-all duration-300 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {displayItems.map((item) => (
            <div
              key={item.id}
              onClick={() => openLightbox(item.id)}
              className="group relative aspect-[3/4] overflow-hidden bg-stone-200 cursor-pointer"
            >
              {isVideoItem(item) ? (
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
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}

              <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 transition-colors duration-500 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 font-serif tracking-wide transition-opacity duration-300 flex items-center gap-2">
                  <Maximize2 size={16} /> {t('portfolio.view')}
                </span>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-12 text-stone-400">{t('portfolio.empty')}</div>
          )}
        </div>

        <div className="text-center mt-12">
          {filteredItems.length > 6 && !isFullView && (
            <button
              onClick={() => setIsFullView(true)}
              className="inline-block border-b border-stone-800 pb-1 text-stone-800 hover:text-stone-500 transition-colors uppercase tracking-widest text-xs"
            >
              {t('portfolio.viewFull')}
            </button>
          )}
          {isFullView && (
            <button
              onClick={() => setIsFullView(false)}
              className="inline-block border-b border-stone-800 pb-1 text-stone-800 hover:text-stone-500 transition-colors uppercase tracking-widest text-xs"
            >
              {t('portfolio.showLess')}
            </button>
          )}
        </div>
      </div>

      {selectedIndex !== null && filteredItems[selectedIndex] && (
        <div
          className="fixed inset-0 z-50 bg-stone-900/95 flex items-center justify-center backdrop-blur-sm animate-fade-in"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            onClick={closeLightbox}
          >
            <X size={32} strokeWidth={1} />
          </button>

          <button
            className="absolute left-4 text-white/50 hover:text-white transition-colors p-4 hidden md:block"
            onClick={prevItem}
          >
            <ChevronLeft size={48} strokeWidth={1} />
          </button>

          <div className="max-w-5xl max-h-[85vh] p-4 relative" onClick={(e) => e.stopPropagation()}>
            {isVideoItem(filteredItems[selectedIndex]) ? (
              <video
                src={filteredItems[selectedIndex].url}
                className="max-h-[85vh] w-auto max-w-full object-contain shadow-2xl"
                controls
                playsInline
                autoPlay
              />
            ) : (
              <img
                src={filteredItems[selectedIndex].url}
                alt={filteredItems[selectedIndex].title}
                className="max-h-[85vh] w-auto max-w-full object-contain shadow-2xl"
              />
            )}

            <div className="text-center mt-4 text-white/80 font-serif tracking-wide">
              {filteredItems[selectedIndex].title}
            </div>
          </div>

          <button
            className="absolute right-4 text-white/50 hover:text-white transition-colors p-4 hidden md:block"
            onClick={nextItem}
          >
            <ChevronRight size={48} strokeWidth={1} />
          </button>
        </div>
      )}
    </section>
  );
};