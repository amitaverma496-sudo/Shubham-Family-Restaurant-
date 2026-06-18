import React, { useState } from 'react';
import { Image, X, ZoomIn, Compass } from 'lucide-react';
import { GalleryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface GalleryLightboxProps {
  galleryItems: GalleryItem[];
}

export default function GalleryLightbox({ galleryItems }: GalleryLightboxProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Restaurant'];

  const filteredItems = galleryItems.filter(item => {
    return activeCategory === 'All' || item.category === activeCategory;
  });

  return (
    <section id="gallery" className="py-24 border-t border-white/5 bg-lux-black relative">
      
      {/* Soft golden particle ambient background */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/3 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Gallery Title */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/30 rounded-full text-[10px] tracking-[0.3em] font-mono text-gold uppercase">
            <Image className="w-3.5 h-3.5" /> Majestic Vignettes & Hotel Exhibits
          </div>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl tracking-widest uppercase">
            <span className="text-3d-white">THE GALLERY </span>
            <span className="text-3d-gold">MUSEUM</span>
          </h2>
          <div className="w-24 h-[1px] bg-gold mx-auto my-3" />
          <p className="max-w-xl mx-auto text-white/50 text-[11px] tracking-widest uppercase leading-relaxed text-center">
            A window into Lucknow fine dining halls, award-winning plates, and premium air-conditioned hotel suites with stellar amenities.
          </p>

          {/* Gallery Category Filter Chips */}
          <div className="flex gap-2 justify-center pt-6 overflow-x-auto max-w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                    : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry-like Grid Cards */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredItems.map((photo, index) => {
            // Safely resolve simulated generated images from /src/assets/images
            let src = photo.imageUrl;
            if (src === 'INTERIOR_PLACEHOLDER') src = '/src/assets/images/shubham_interior_1781759760975.jpg';
            if (src === 'DISH_PLACEHOLDER') src = '/src/assets/images/shubham_dish_1781759777106.jpg';

            // Alternating multi-dimensional motion classes to create a beautiful floating wall
            const liveMotionClass = index % 3 === 0 
              ? 'animate-live-pan' 
              : index % 3 === 1 
              ? 'animate-live-kenburns' 
              : 'animate-live-zoom';

            return (
              <motion.div
                key={photo.id}
                layoutId={`gal-card-${photo.id}`}
                onClick={() => setSelectedPhoto(photo)}
                className="break-inside-avoid relative rounded-3xl overflow-hidden group border border-lux-border cursor-pointer bg-lux-card shadow-lg hover:border-gold/30 hover:scale-[1.01] transition-all duration-500"
              >
                <div className="relative overflow-hidden aspect-video sm:aspect-auto">
                  <img
                    src={src}
                    alt={photo.title}
                    className={`w-full h-auto object-cover max-h-[420px] ${liveMotionClass}`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Frosted details overlay shown on desktop hover / active states */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6 select-none">
                    <span className="text-[9px] font-mono font-bold text-gold uppercase tracking-[0.2em] mb-1">
                      {photo.category} Exhibit
                    </span>
                    <h3 className="font-serif text-base uppercase text-white font-bold tracking-wider mb-2">
                      {photo.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-white/50 tracking-wider">
                      <ZoomIn className="w-4 h-4 text-gold" /> Tap for high-resolution view
                    </div>
                  </div>

                  {/* Corner indicator badge for mobile */}
                  <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-full text-[8.5px] font-mono font-bold uppercase tracking-widest text-gold opacity-100 group-hover:opacity-0 transition-opacity">
                    {photo.category}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20 bg-white/2 rounded-3xl border border-white/5">
            <p className="text-white/50 tracking-wider text-xs uppercase font-mono">No gallery items registered</p>
          </div>
        )}

      </div>

      {/* Lightbox Modal Overlay */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPhoto(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />
            
            <motion.div
              layoutId={`gal-card-${selectedPhoto.id}`}
              className="relative w-full max-w-5xl glass rounded-3xl overflow-hidden border border-white/12 z-10 flex flex-col items-center gold-box-glow"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-black/50 border border-white/10 hover:border-gold hover:bg-gold hover:text-black transition-all text-white/80 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Resolved Image */}
              <div className="w-full max-h-[75vh] min-h-[300px] flex items-center justify-center bg-black/60 overflow-hidden relative">
                <img
                  src={
                    selectedPhoto.imageUrl === 'INTERIOR_PLACEHOLDER' 
                      ? '/src/assets/images/shubham_interior_1781759760975.jpg'
                      : selectedPhoto.imageUrl === 'DISH_PLACEHOLDER'
                      ? '/src/assets/images/shubham_dish_1781759777106.jpg'
                      : selectedPhoto.imageUrl
                  }
                  alt={selectedPhoto.title}
                  className="w-full h-auto max-h-[75vh] object-contain animate-live-zoom"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Caption Footer */}
              <div className="w-full p-6 bg-lux-card/90 border-t border-lux-border text-left">
                <span className="text-[10px] font-mono tracking-[0.3em] text-gold uppercase font-bold block mb-1">
                  {selectedPhoto.category} Exhibition Frame
                </span>
                <h3 className="font-serif text-lg md:text-xl text-white font-extrabold tracking-widest uppercase">
                  {selectedPhoto.title}
                </h3>
                <p className="text-white/50 text-[11px] tracking-wider uppercase mt-1 leading-relaxed">
                  Available exclusively at Shubham Family Restaurant & Hotel (Agra Expressway Lucknow, Uttar Pradesh).
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
