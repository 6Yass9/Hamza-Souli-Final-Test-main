import React, { useState } from 'react';
import { GalleryItem } from '../types';
import { X } from 'lucide-react';

interface Props {
  items: GalleryItem[];
}

export const Portfolio: React.FC<Props> = ({ items }) => {
  const images = items.filter(i => i.mediaType !== 'video');
  const videos = items.filter(i => i.mediaType === 'video');

  const [lightboxItems, setLightboxItems] = useState<GalleryItem[] | null>(null);
  const [index, setIndex] = useState(0);

  const open = (list: GalleryItem[], i: number) => {
    setLightboxItems(list);
    setIndex(i);
  };

  return (
    <section id="portfolio" className="py-24 bg-stone-100 px-4">
      <div className="max-w-6xl mx-auto space-y-24">

        {images.length > 0 && (
          <div>
            <h3 className="font-serif text-4xl mb-10 text-center">Pictures</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((item, i) => (
                <img
                  key={item.id}
                  src={item.url}
                  alt={item.title}
                  className="cursor-pointer object-cover w-full h-64"
                  onClick={() => open(images, i)}
                />
              ))}
            </div>
          </div>
        )}

        {videos.length > 0 && (
          <div>
            <h3 className="font-serif text-4xl mb-10 text-center">Videos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.map((item, i) => (
                <video
                  key={item.id}
                  src={item.url}
                  className="cursor-pointer w-full"
                  muted
                  onClick={() => open(videos, i)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {lightboxItems && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <button
            className="absolute top-6 right-6 text-white"
            onClick={() => setLightboxItems(null)}
          >
            <X size={32} />
          </button>

          {lightboxItems[index].mediaType === 'video' ? (
            <video
              src={lightboxItems[index].url}
              controls
              autoPlay
              className="max-h-[85vh] max-w-full"
            />
          ) : (
            <img
              src={lightboxItems[index].url}
              className="max-h-[85vh] max-w-full"
            />
          )}
        </div>
      )}
    </section>
  );
};