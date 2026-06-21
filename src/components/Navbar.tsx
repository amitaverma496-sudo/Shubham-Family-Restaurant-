import React, { useState } from 'react';
import { Menu, X, Landmark, Compass, ShieldCheck, LogIn, LogOut, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onNavClick: (sectionId: string) => void;
  onAdminToggle: () => void;
  isAdminMode: boolean;
  currentUser: any;
  onSignIn: () => void;
  onSignOut: () => void;
}

export default function Navbar({ 
  onNavClick, 
  onAdminToggle, 
  isAdminMode, 
  currentUser, 
  onSignIn, 
  onSignOut 
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] tracking-wider font-semibold uppercase transition-all duration-300 cursor-pointer ${
                isAdminMode
                  ? 'bg-gold text-black border-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                  : 'bg-white/5 hover:bg-gold/10 text-white/80 border-white/10 hover:border-gold'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {isAdminMode ? 'Exit Suite' : 'Executive Suite'}
            </button>

            {/* Google Authentication Control */}
            {currentUser ? (
              <div className="relative">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1.5 pl-3 rounded-full">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || 'User'} 
                      className="w-5.5 h-5.5 rounded-full border border-gold/30 object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="w-5.5 h-5.5 rounded-full bg-gold/20 flex items-center justify-center text-[10px] text-gold font-black">
                      {currentUser.displayName ? currentUser.displayName.charAt(0) : 'U'}
                    </div>
                  )}
                  <span className="text-[10px] text-white/95 font-semibold font-sans tracking-wide max-w-[100px] truncate">
                    {currentUser.displayName ? currentUser.displayName.split(' ')[0] : 'Guest'}
                  </span>
                  
                  {/* Three Dots Button */}
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                    className={`p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer ${isDropdownOpen ? 'bg-white/10 text-gold' : ''}`}
                    title="Account options"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Elegant 3-dots dropdown menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsDropdownOpen(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-56 z-50 glass border border-white/10 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden"
                      >
                        <div className="p-3.5 border-b border-white/5 bg-white/[0.01]">
                          <p className="text-[9px] font-mono tracking-widest text-gold uppercase mb-1">Executive Officer</p>
                          <p className="text-xs font-bold text-white max-w-full truncate">{currentUser.displayName || 'Guest User'}</p>
                          <p className="text-[9px] font-mono text-white/40 truncate mt-0.5">{currentUser.email}</p>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                          {/* Logout Button (Requested) */}
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              onSignOut();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[11px] font-sans font-bold hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-xl transition-all duration-200 cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Logout Session</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gold/40 hover:border-gold hover:bg-gold/5 bg-gold/10 text-[10px] tracking-widest font-black text-gold uppercase transition-all duration-300 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-gold" />
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
                {/* Mobile Google Auth Block */}
                {currentUser ? (
                  <div className="flex flex-col bg-white/5 border border-white/10 p-3.5 rounded-2xl mb-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {currentUser.photoURL ? (
                          <img 
                            src={currentUser.photoURL} 
                            alt={currentUser.displayName || 'User'} 
                            className="w-8 h-8 rounded-full border border-gold/30 object-cover" 
                            referrerPolicy="no-referrer" 
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-xs text-gold font-bold">
                            {currentUser.displayName ? currentUser.displayName.charAt(0) : 'U'}
                          </div>
                        )}
                        <div>
                          <div className="text-xs text-white/95 font-semibold font-sans">{currentUser.displayName || 'Guest User'}</div>
                          <div className="text-[9px] text-white/40 truncate max-w-[140px] font-mono">{currentUser.email}</div>
                        </div>
                      </div>
                      
                      {/* Three Dots More options for mobile */}
                      <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                        className={`p-1.5 rounded-full text-white/50 hover:text-white transition-all duration-200 cursor-pointer ${isDropdownOpen ? 'bg-white/10' : ''}`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Collapsible Mobile 3-dots section logout options */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-2 border-t border-white/5 overflow-hidden"
                        >
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              setIsDropdownOpen(false);
                              onSignOut();
                            }}
                            className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold tracking-wider transition-all cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Logout Session</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onSignIn();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-gold/30 bg-gold/5 text-xs text-gold font-bold tracking-widest uppercase transition-all hover:bg-gold/10 cursor-pointer mb-2"
                  >
                    <LogIn className="w-4 h-4 text-gold" />
                    <span>Sign In With Google</span>
                  </button>
                )}

                <button
                  onClick={() => handleLinkClick('booking')}
                  className="w-full text-center px-6 py-3 rounded-full border border-gold bg-gold text-black transition-all duration-300 text-xs font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(212,175,55,0.2)] cursor-pointer"
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
