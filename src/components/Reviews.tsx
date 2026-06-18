import React, { useState } from 'react';
import { Star, MessageSquareQuote, Send, Compass, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  avatar: string;
}

interface ReviewsProps {
  onAddReview: (review: Omit<ReviewItem, 'id' | 'date' | 'avatar'>) => void;
  reviewsList: ReviewItem[];
}

export default function Reviews({ onAddReview, reviewsList }: ReviewsProps) {
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    text: ''
  });
  
  const [isAdding, setIsAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.text) return;

    onAddReview({
      name: formData.name,
      rating: formData.rating,
      text: formData.text
    });

    setFormData({ name: '', rating: 5, text: '' });
    setSuccessMsg('Thank you for your valuable feedback, your review is published!');
    setTimeout(() => {
      setSuccessMsg('');
      setIsAdding(false);
    }, 3500);
  };

  return (
    <section id="reviews" className="py-24 border-t border-white/5 bg-lux-secondary relative">
      
      {/* Absolute visual ambient golden orb */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 z-10 relative">
        
        {/* Section Heading Frame */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/30 rounded-full text-[10px] tracking-[0.3em] font-mono text-gold uppercase mb-3">
              <MessageSquareQuote className="w-3.5 h-3.5 text-gold" /> High Society Reviews & Word of Mouth
            </div>
            <h2 className="font-serif text-3xl md:text-5xl tracking-widest uppercase">
              <span className="text-3d-white">GUEST </span>
              <span className="text-3d-gold">JOURNALS</span>
            </h2>
            <p className="max-w-xl text-white/50 text-[11px] tracking-widest uppercase leading-relaxed mt-2">
              Discover why families and food enthusiasts along the Agra Expressway rank Shubham as Lucknow’s premium culinary experience.
            </p>
          </div>

          {/* Rating Summary Indicator */}
          <div className="flex items-center gap-4 border border-white/10 bg-black/40 px-6 py-4 rounded-2xl w-fit">
            <div className="text-center shrink-0">
              <span className="text-3xl font-bold text-white font-mono leading-none block">4.8</span>
              <span className="text-[10px] uppercase text-white/40 tracking-wider font-semibold block mt-1">Average Star</span>
            </div>
            <div className="h-10 w-[1px] bg-white/10" />
            <div>
              <div className="flex gap-0.5 mb-1 text-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-gold" />
                ))}
              </div>
              <span className="text-[10px] uppercase text-gold tracking-widest block font-bold">33+ Authentic Reviews</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column testimonies list (2 columns thick) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviewsList.map((rev) => (
                <div 
                  key={rev.id} 
                  className="bg-lux-card p-6 rounded-3xl border border-lux-border relative flex flex-col justify-between hover:border-gold/20 hover:scale-[1.01] transition-all duration-300"
                >
                  <Quote className="w-10 h-10 text-gold/8 absolute right-6 top-6 shrink-0" />
                  
                  <div className="space-y-3">
                    <div className="flex gap-0.5 text-gold">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 fill-current ${i < rev.rating ? 'text-gold' : 'text-white/20'}`} 
                        />
                      ))}
                    </div>
                    
                    <p className="text-xs text-white/80 tracking-wide leading-relaxed font-sans italic relative z-10">
                      "{rev.text}"
                    </p>
                  </div>

                  {/* Profile info footer */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-4">
                    <div className="w-8 h-8 rounded-full border border-gold/20 overflow-hidden shrink-0">
                      <img 
                        src={rev.avatar} 
                        alt={rev.name} 
                        className="w-full h-full object-cover animate-live-zoom"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-serif font-semibold uppercase text-white block">{rev.name}</span>
                      <span className="text-[9px] font-mono text-white/40">{rev.date} • Verified Guest</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Toggle and Button */}
            {!isAdding && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setIsAdding(true)}
                  className="px-6 py-2.5 rounded-full border border-gold text-gold text-xs font-bold tracking-widest uppercase hover:bg-gold hover:text-black transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.05)]"
                >
                  Write Your Royal Review
                </button>
              </div>
            )}
          </div>

          {/* Review adding sidebar Form box */}
          <div className="lg:col-span-1">
            <AnimatePresence>
              {isAdding && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-lux-card p-6 rounded-3xl border border-lux-border space-y-4 text-xs text-left gold-box-glow"
                >
                  <div className="border-b border-gold/12 pb-3 flex items-center justify-between">
                    <h3 className="font-serif text-base text-gold uppercase tracking-wider">Leave Feedback</h3>
                    <button
                      onClick={() => setIsAdding(false)}
                      className="text-[10px] tracking-wider text-white/40 hover:text-white uppercase font-mono"
                    >
                      Cancel
                    </button>
                  </div>

                  {successMsg ? (
                    <div className="py-8 text-center text-teal-400 font-bold uppercase tracking-wider space-y-2">
                      <p>✓ Published!</p>
                      <p className="text-white/60 font-medium text-[10px] tracking-wide mt-2">{successMsg}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      
                      <div>
                        <label className="block text-white/60 uppercase tracking-widest text-[9px] mb-1.5 font-semibold">Your Name*</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mrs. Gupta"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-black/60 border border-white/12 text-white px-4 py-2.5 rounded-xl outline-none focus:border-gold transition-colors placeholder:text-white/20"
                        />
                      </div>

                      {/* Stars count slider */}
                      <div>
                        <label className="block text-white/60 uppercase tracking-widest text-[9px] mb-1.5 font-semibold">Star Rating: <span className="text-gold">{formData.rating} Stars</span></label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((starValue) => (
                            <button
                              type="button"
                              key={starValue}
                              onClick={() => setFormData(prev => ({ ...prev, rating: starValue }))}
                              className="text-gold focus:outline-none hover:scale-110 transition-transform"
                            >
                              <Star 
                                className={`w-5 h-5 fill-current ${
                                  starValue <= formData.rating ? 'text-gold' : 'text-white/20'
                                }`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-white/60 uppercase tracking-widest text-[9px] mb-1.5 font-semibold">Your Review Details*</label>
                        <textarea
                          rows={4}
                          required
                          placeholder="How did our Kashmiri Dum Aloo, Dal Bukhara, and hotel room suite treat you?"
                          value={formData.text}
                          onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                          className="w-full bg-black/60 border border-white/12 text-white px-4 py-2 rounded-xl outline-none focus:border-gold transition-colors placeholder:text-white/20 resize-none font-sans leading-relaxed text-[11px]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-full bg-gold hover:bg-gold/90 text-black font-extrabold tracking-widest uppercase transition-all duration-300 shadow-[0_4px_15px_rgba(212,175,55,0.2)] cursor-pointer"
                      >
                        <Send className="w-3 h-3 inline mr-1.5" /> Submit Guest Entry
                      </button>

                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
