import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, UtensilsCrossed, Sparkles, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { MenuItem, MenuCategory } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { GlowCard } from '@/components/ui/spotlight-card';

interface MenuSectionProps {
  menuItems: MenuItem[];
  onAddToRequest: (dishName: string) => void;
  selectedDishes: string[];
  clearSelectedDishes: () => void;
}

export default function MenuSection({
  menuItems,
  onAddToRequest,
  selectedDishes,
  clearSelectedDishes
}: MenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState<MenuCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Chef's Recommendation carousel states
  const [recommendedDishes, setRecommendedDishes] = useState<MenuItem[]>([]);
  const [activeRecIndex, setActiveRecIndex] = useState(0);

  // Pick unique popular items on mount and select a random initial index
  useEffect(() => {
    if (menuItems && menuItems.length > 0) {
      const populars = menuItems.filter(item => item.isPopular);
      const pool = populars.length >= 3 ? populars : menuItems;
      
      // Shuffle & take top 3
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.min(3, shuffled.length));
      
      setRecommendedDishes(selected);
      if (selected.length > 0) {
        setActiveRecIndex(Math.floor(Math.random() * selected.length));
      }
    }
  }, [menuItems]);

  const categories: (MenuCategory | 'All')[] = [
    'All', 'Starters', 'Main Course', 'Chinese', 'South Indian', 'Desserts', 'Beverages'
  ];

  // Filtering
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="menu" className="py-24 border-t border-white/5 relative bg-lux-black">
      
      {/* Background glow streak */}
      <div className="absolute right-5 top-1/4 w-96 h-96 bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute left-5 bottom-1/4 w-96 h-96 bg-gold/3 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading Frame */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/30 rounded-full text-[10px] tracking-[0.3em] font-mono text-gold uppercase">
            <UtensilsCrossed className="w-3.5 h-3.5 text-gold" /> Traditional Awadhi & Cosmopolitan Cuisine
          </div>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl tracking-widest uppercase md:leading-tight">
            <span className="text-3d-white">THE ROYAL </span>
            <span className="text-3d-gold">GASTRONOMY</span>
          </h2>
          <div className="w-24 h-[1px] bg-gold mx-auto my-3" />
          <p className="max-w-2xl mx-auto text-white/60 text-xs md:text-sm tracking-widest uppercase text-center leading-relaxed">
            Savour royal Awadhi food recipes from the nawabs of Lucknow paired with fresh, modern Indian culinary specialties.
          </p>
        </div>

        {/* Chef's Recommendation Highlight Carousel Panel */}
        {recommendedDishes.length > 0 && (
          <GlowCard 
            customSize={true} 
            glowColor="gold" 
            className="mb-20 p-6 sm:p-8 relative overflow-hidden shadow-[0_15px_45px_rgba(59,130,246,0.06)]"
          >
            <div className="absolute right-0 top-0 w-80 h-80 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute left-0 bottom-0 w-80 h-80 bg-gold/3 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="flex flex-col md:flex-row gap-8 items-center relative z-10 w-full">
              {/* Left Column: Carousel Branding & Switch Actions */}
              <div className="w-full md:w-1/3 flex flex-col justify-between items-center text-center md:items-start md:text-left h-full border-b md:border-b-0 md:border-r border-lux-border pb-6 md:pb-0 md:pr-8 gap-4">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/15 border border-gold/30 rounded-full text-[9px] font-black uppercase tracking-widest text-gold shadow-sm animate-pulse">
                    <Award className="w-3.5 h-3.5 text-gold" /> Highly Recommended
                  </span>
                  <h3 className="font-serif text-2xl lg:text-3xl font-black uppercase tracking-widest leading-tight text-white">
                    CHEF'S <br className="hidden md:inline" />SPECIALS
                  </h3>
                  <p className="text-zinc-450 text-[10px] leading-relaxed font-sans max-w-xs uppercase tracking-wider text-white/50">
                    Our master chefs suggest this curated Awadhi masterpiece for your royal table. Updated on every visit.
                  </p>
                </div>

                {/* Left/Right carousel controllers */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setActiveRecIndex(prev => (prev - 1 + recommendedDishes.length) % recommendedDishes.length)}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-gold hover:text-black border border-lux-border flex items-center justify-center transition-all cursor-pointer text-white active:scale-95"
                    aria-label="Previous recommended dish"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {/* Rounded indicator pills */}
                  <div className="flex gap-1.5 px-1">
                    {recommendedDishes.map((_, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setActiveRecIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          idx === activeRecIndex ? 'bg-gold w-5' : 'bg-white/20 hover:bg-white/40'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveRecIndex(prev => (prev + 1) % recommendedDishes.length)}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-gold hover:text-black border border-lux-border flex items-center justify-center transition-all cursor-pointer text-white active:scale-95"
                    aria-label="Next recommended dish"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Active Dish Detail and Direct Add Action */}
              <div className="flex-1 w-full min-h-[160px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  {recommendedDishes.map((item, idx) => {
                    if (idx !== activeRecIndex) return null;
                    const isSelected = selectedDishes.includes(item.name);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 25 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -25 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            {item.isVeg ? (
                              <span className="w-4 h-4 border border-emerald-500 flex items-center justify-center p-0.5 rounded-sm" title="Pure Vegetarian">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                              </span>
                            ) : (
                              <span className="w-4 h-4 border border-red-500 flex items-center justify-center p-0.5 rounded-sm" title="Halal / Non-Veg">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block" />
                              </span>
                            )}
                            <span className="text-[10px] font-mono tracking-widest text-gold uppercase font-bold">
                              {item.category}
                            </span>
                          </div>
                          <span className="font-mono text-gold text-sm md:text-base font-black tracking-widest bg-gold/5 border border-gold/20 px-3 py-1 rounded-xl">
                            ₹{item.price}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-serif text-lg md:text-xl text-white font-extrabold tracking-wide uppercase transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-zinc-400 text-xs tracking-wide leading-relaxed font-sans max-w-2xl">
                            {item.description}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-lux-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <span className="text-[9px] uppercase tracking-widest text-white/40 block font-mono">
                            ★ GOURMET REVELATION • FRESHLY COMMITTED
                          </span>

                          <button
                            type="button"
                            onClick={() => onAddToRequest(item.name)}
                            className={`text-[10px] uppercase tracking-widest font-extrabold px-6 py-2.5 rounded-full border transition-all duration-300 w-full sm:w-auto text-center cursor-pointer active:scale-95 ${
                              isSelected
                                ? 'bg-red-500/15 text-red-400 border-red-500/40 hover:bg-red-500 hover:text-black hover:border-red-500'
                                : 'bg-gold hover:bg-gold/80 text-black border-gold shadow-[0_4px_12px_rgba(59,130,246,0.15)]'
                            }`}
                          >
                            {isSelected ? 'Remove Selection' : 'Pre-Order Dish'}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </GlowCard>
        )}

        {/* Categories Bar & Search bar */}
        <div className="mb-12 flex flex-col md:flex-row gap-6 md:items-center justify-between border-b border-white/10 pb-6">
          
          {/* Quick categories chips with active status styling */}
          <div className="flex gap-2.5 overflow-x-auto pb-3 md:pb-0 scrollbar-none max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-[11px] font-semibold tracking-wider uppercase transition-all duration-300 relative ${
                  activeCategory === cat 
                    ? 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.25)]' 
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Luxury Search Input Frame */}
          <div className="relative min-w-[260px] md:w-80">
            <Search className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Awadhi delicacies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/4 border border-white/10 hover:border-white/20 focus:border-gold text-xs text-white px-11 py-3 rounded-full outline-none tracking-widest placeholder:text-white/35 transition-all"
            />
          </div>

        </div>

        {/* Selected pre-order cart notification state indicator */}
        {selectedDishes.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-5 rounded-2xl glass border border-gold/30 flex flex-col md:flex-row md:items-center justify-between gap-4 gold-box-glow"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-gold uppercase tracking-wider mb-1">
                <ShoppingBag className="w-4 h-4 text-gold shrink-0" />
                Selected fine dishes ({selectedDishes.length})
              </div>
              <p className="text-[11px] text-white/70 tracking-wider font-mono">
                {selectedDishes.join(' • ')}
              </p>
            </div>
            
            <div className="flex gap-3 shrink-0">
              <button
                onClick={clearSelectedDishes}
                className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 text-[10px] tracking-wider uppercase font-semibold transition-all"
              >
                Clear selection
              </button>
              <a
                href="#booking"
                className="px-5 py-2 rounded-full bg-gold hover:bg-gold/90 text-black text-[10px] tracking-widest uppercase font-extrabold transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] text-center block"
              >
                Pre-Order with Table reservation
              </a>
            </div>
          </motion.div>
        )}

        {/* Menu Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredItems.map((item) => {
              const isSelected = selectedDishes.includes(item.name);
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <GlowCard
                    customSize={true}
                    glowColor="gold"
                    className="group h-full p-5 flex flex-col justify-between"
                  >
                    
                    {/* Decorative faint golden line on top of each card */}
                    <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-gold/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="space-y-4">
                      
                      {/* Header: diet Tag, premium category and rating */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {item.isVeg ? (
                            <span className="w-4 h-4 border border-emerald-500 flex items-center justify-center p-0.5 rounded-sm" title="Pure Vegetarian">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                            </span>
                          ) : (
                            <span className="w-4 h-4 border border-red-500 flex items-center justify-center p-0.5 rounded-sm" title="Halal / Non-Veg">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block" />
                            </span>
                          )}
                          <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 block font-mono">
                            {item.category}
                          </span>
                        </div>
                        
                        {item.isPopular && (
                          <span className="text-[8px] font-mono font-bold tracking-widest text-gold bg-gold/10 border border-gold/30 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-gold" /> Chef Star
                          </span>
                        )}
                      </div>

                      {/* Dish Name & Price */}
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-serif text-base md:text-lg text-white font-extrabold tracking-wide uppercase group-hover:text-gold transition-colors duration-300">
                            {item.name}
                          </h3>
                        </div>
                        <div className="font-mono text-gold text-sm font-semibold tracking-wider mt-1 block">
                          ₹{item.price}
                        </div>
                      </div>

                      {/* Dish Description */}
                      <p className="text-white/60 text-xs tracking-wide leading-relaxed font-sans line-clamp-3">
                        {item.description}
                      </p>

                    </div>

                    {/* Add pre-order CTA footer */}
                    <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[9.5px] tracking-wider text-white/35 font-semibold font-mono">
                        FRESH • MADE TO ORDER
                      </span>
                      <button
                        onClick={() => onAddToRequest(item.name)}
                        className={`text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer ${
                          isSelected 
                            ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500 hover:text-black hover:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                            : 'bg-white/4 hover:bg-gold hover:text-black border-white/8 hover:border-gold'
                        }`}
                      >
                        {isSelected ? 'Remove ✕' : 'Add to Table'}
                      </button>
                    </div>

                  </GlowCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20 bg-white/2 rounded-3xl border border-white/5">
            <p className="text-white/50 tracking-wider text-xs uppercase font-mono mb-2">No royal recipe found matching "{searchQuery}"</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
              className="text-xs text-gold underline tracking-wider uppercase font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
