import React, { useState } from 'react';
import { Menu, X, Landmark, Compass, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onNavClick: (sectionId: string) => void;
  onAdminToggle: () => void;
  isAdminMode: boolean;
  user: any;
  onSignOut: () => void;
  onSignIn: () => void;
}

export default function Navbar({ onNavClick, onAdminToggle, isAdminMode, user, onSignOut, onSignIn }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'Features', id: 'features' },
    { label: 'Menu', id: 'menu' },
    { label: 'Gallery', id: 'gallery' },
    { label: 'Reviews', id: 'reviews' },
    { label: 'Contact', id: 'contact' },
  ];

  const handleLinkClick = (id: string) => {
    setIsOpen(false);
    onNavClick(id);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 glass-intense border-b border-white/10 px-6 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand Frame */}
          <div 
            onClick={() => handleLinkClick('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-gold rounded-sm rotate-45 flex items-center justify-center group-hover:scale-105 transition-all duration-300">
              <span className="text-black font-bold text-xs -rotate-45 font-bold">S</span>
            </div>
            <span className="font-serif font-bold tracking-tighter text-lg text-white">
              SHUBHAM <span className="text-gold font-light font-sans uppercase text-[15px]">LUXURY</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className="text-xs tracking-[0.2em] font-medium text-white/70 hover:text-gold transition-colors duration-200 uppercase relative group py-2"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Call-to-actions / Admin portal */}
          <div className="hidden md:flex items-center gap-4">
            {/* Executive Admin Portal Button */}
            <button
              onClick={onAdminToggle}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] tracking-wider font-semibold uppercase transition-all duration-300 ${
                isAdminMode
                  ? 'bg-gold text-black border-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                  : 'bg-white/5 hover:bg-gold/10 text-white/80 border-white/10 hover:border-gold'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {isAdminMode ? 'Exit Suite' : 'Executive Suite'}
            </button>

            {/* Google Authentication Status Widget */}
            {user ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] text-white/90">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full border border-gold/40"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gold/25 flex items-center justify-center text-gold font-serif text-[9px] font-black border border-gold/30">
                    {user.displayName ? user.displayName.substring(0, 1).toUpperCase() : 'G'}
                  </div>
                )}
                <span className="font-serif text-white/80 font-bold tracking-tight max-w-[90px] truncate">{user.displayName || 'Guest'}</span>
                <span className="text-white/20">|</span>
                <button
                  id="google-signout-btn"
                  onClick={onSignOut}
                  className="font-mono text-[9px] text-gold hover:text-white uppercase tracking-wider font-bold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                id="google-signin-btn"
                onClick={onSignIn}
                className="px-4 py-1.5 rounded-full border border-white/10 hover:border-gold/30 bg-white/5 hover:bg-gold/10 text-white/85 text-[11px] tracking-wider font-semibold uppercase transition-all duration-300"
              >
                Sign In
              </button>
            )}

            {/* Direct Booking CTA */}
            <button
              onClick={() => handleLinkClick('booking')}
              className="px-5 py-2 rounded-full border border-gold hover:bg-gold hover:text-black bg-gold/10 transition-all duration-300 text-xs font-semibold tracking-wider text-gold shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] cursor-pointer uppercase"
            >
              Book Royal Table
            </button>
          </div>

          {/* Mobile Right Bar buttons */}
          <div className="flex lg:hidden items-center gap-3">
            {user && (
              <img
                src={user.photoURL}
                alt=""
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full border border-gold/40"
              />
            )}

            <button
              onClick={onAdminToggle}
              className={`p-1.5 rounded-full border text-[10px] uppercase transition-all duration-300 ${
                isAdminMode ? 'bg-gold text-black border-gold' : 'bg-white/5 text-white/80 border-white/10'
              }`}
              title="Admin Suite"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {/* Hamburger button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white/85 hover:text-gold transition-colors duration-200"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Drawer Overlay and Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-4/5 max-w-sm h-full bg-lux-secondary border-l border-white/10 z-40 p-8 flex flex-col justify-between lg:hidden"
            >
              <div className="space-y-8 pt-16">
                <div className="flex flex-col gap-6">
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleLinkClick(link.id)}
                      className="text-base tracking-widest text-white/80 hover:text-gold transition-colors duration-200 text-left font-serif uppercase font-medium"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {user ? (
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="" 
                        referrerPolicy="no-referrer" 
                        className="w-10 h-10 rounded-full border border-gold/40" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gold/25 flex items-center justify-center text-gold font-serif font-black border border-gold/30">
                        {user.displayName ? user.displayName.substring(0, 1).toUpperCase() : 'G'}
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <div className="text-xs font-serif font-black text-white">{user.displayName || 'Distinguished Guest'}</div>
                      <div className="text-[10px] font-mono text-white/45 truncate">{user.email}</div>
                    </div>
                    <button 
                      id="google-signout-btn"
                      onClick={() => {
                        setIsOpen(false);
                        onSignOut();
                      }}
                      className="text-xs text-red-400 font-mono tracking-wider font-bold uppercase transition-colors hover:text-red-300"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    id="google-signin-btn"
                    onClick={() => {
                      setIsOpen(false);
                      onSignIn();
                    }}
                    className="w-full text-center px-6 py-3 rounded-full bg-white text-black transition-all duration-300 text-xs font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-pointer"
                  >
                    Guest Sign In
                  </button>
                )}

                <button
                  onClick={() => handleLinkClick('booking')}
                  className="w-full text-center px-6 py-3 rounded-full border border-gold bg-gold text-black transition-all duration-300 text-xs font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                >
                  Book Royal Table
                </button>
                <div className="text-[10px] text-white/40 tracking-wider text-center font-mono">
                  LUCKNOW, IND • SHUBHAM
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
