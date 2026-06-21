import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Building2, Phone, MessageSquare, MapPin, Map, Share2, 
  HelpCircle, Send, Star, ExternalLink, ShieldCheck, Heart, Sparkles, Navigation, Globe, Plane,
  ShoppingBag, Trash2, Plus, Minus, X, ChevronUp, ChevronDown, UtensilsCrossed,
  Calendar, Users, Clock, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import Types
import { MenuItem, Booking, GalleryItem, Inquiry, UserProfile, ActivityLog } from './types';

// Import Firestore database sync and Auth support
import { collection, query, orderBy, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

// Import Seed Data
import { 
  INITIAL_MENU_ITEMS, INITIAL_REVIEWS, INITIAL_GALLERY_ITEMS, 
  INITIAL_BOOKINGS, INITIAL_INQUIRIES 
} from './data';

// Import Modular Extracted Components
import Navbar from './components/Navbar';
import AdminPanel from './components/AdminPanel';
import MenuSection from './components/MenuSection';
import BookingSystem from './components/BookingSystem';
import Reviews from './components/Reviews';
import GalleryLightbox from './components/GalleryLightbox';
import InteractiveMap from './components/InteractiveMap';
import LiquidButton from './components/LiquidButton';
import { Button } from '@/components/ui/neon-button';
import { HeroScrollDemo } from '@/components/ui/demo';
import { HeroSectionDemo } from './components/blocks/demo';
import NeuralBackground from '@/components/ui/flow-field-background';
import Futuristic3DHologram from '@/components/ui/hero-futuristic';
import { SpiralAnimation } from '@/components/ui/spiral-animation';

// Image paths generated earlier
const INTERIOR_URL = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200';
const DISH_URL = 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=1200';

export default function App() {
  // --- GOOGLE FIREBASE AUTHENTICATION FLOW STATE ---
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Helper: Write user activity logs to the Firestore logs collection
  const logUserActivity = async (uid: string, displayName: string | null, email: string | null, action: string) => {
    try {
      const logId = 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      const logRef = doc(db, 'activityLogs', logId);
      await setDoc(logRef, {
        id: logId,
        uid,
        displayName: displayName || 'Anonymous User',
        email: email || '',
        action,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Failed to write to activityLogs collection:", err);
    }
  };

  // Helper: Create or update Firestore profile of active user
  const updateOrCreateUserProfile = async (user: any) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      let createdAt = new Date().toISOString();
      try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.createdAt) {
            createdAt = data.createdAt;
          }
        }
      } catch (e) {
        console.warn("Could not retrieve existing user to read createdAt", e);
      }

      const userData = {
        uid: user.uid,
        displayName: user.displayName || 'Anonymous Guest',
        email: user.email || '',
        photoURL: user.photoURL || '',
        createdAt: createdAt,
        lastLoginAt: new Date().toISOString(),
        provider: 'Google'
      };

      await setDoc(userRef, userData);
    } catch (error) {
      console.error("Error creating/updating user profile in Firestore:", error);
    }
  };

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Silently update user profile (ensures fresh photo / name / lastLoginAt)
        await updateOrCreateUserProfile(user);
      } else {
        setCurrentUser(null);
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Secure interactive Google authentication sign-in
  const handleSignIn = async (): Promise<any> => {
    setIsLoadingAuth(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await updateOrCreateUserProfile(user);
      await logUserActivity(user.uid, user.displayName, user.email, "Logged In via Google Sign-In");
      return user;
    } catch (err) {
      console.error("Authentication Error:", err);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Logout session
  const handleSignOut = async () => {
    try {
      if (auth.currentUser) {
        await logUserActivity(
          auth.currentUser.uid,
          auth.currentUser.displayName,
          auth.currentUser.email,
          "Logged Out from Session"
        );
      }
      await signOut(auth);
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  // Protective Interceptor wrapper for immediate inline actions
  const executeProtectedAction = async (action: () => void | Promise<void>) => {
    if (auth.currentUser) {
      await action();
    } else {
      try {
        const user = await handleSignIn();
        if (user) {
          // Pause slightly to allow Google sign-in state to propagate fully before continuing
          setTimeout(async () => {
            await action();
          }, 300);
        }
      } catch (err) {
        console.error("Interrupted protected action due to cancellation or sign-in issue:", err);
      }
    }
  };

  // --- CORE STATE PERSISTENCE CLIENT-SIDE ENGINE ---
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const local = localStorage.getItem('shubham_menu_items');
    return local ? JSON.parse(local) : INITIAL_MENU_ITEMS;
  });

  const [reviewsList, setReviewsList] = useState(() => {
    const local = localStorage.getItem('shubham_reviews');
    return local ? JSON.parse(local) : INITIAL_REVIEWS;
  });

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    const local = localStorage.getItem('shubham_gallery');
    return local ? JSON.parse(local) : INITIAL_GALLERY_ITEMS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const local = localStorage.getItem('shubham_bookings');
    return local ? JSON.parse(local) : INITIAL_BOOKINGS;
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const local = localStorage.getItem('shubham_inquiries');
    return local ? JSON.parse(local) : INITIAL_INQUIRIES;
  });

  // Keep localStorage sync'd
  useEffect(() => {
    localStorage.setItem('shubham_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('shubham_reviews', JSON.stringify(reviewsList));
  }, [reviewsList]);

  useEffect(() => {
    localStorage.setItem('shubham_gallery', JSON.stringify(galleryItems));
  }, [galleryItems]);

  useEffect(() => {
    localStorage.setItem('shubham_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Sync bookings in real-time from Firestore
  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Booking[] = [];
      snapshot.forEach((d) => {
        fetched.push({ id: d.id, ...d.data() } as Booking);
      });
      
      if (snapshot.empty && fetched.length === 0) {
        // First-time seed of bookings into Firestore so the client context has records
        const local = localStorage.getItem('shubham_bookings');
        const initial = local ? JSON.parse(local) : INITIAL_BOOKINGS;
        initial.forEach(async (b: Booking) => {
          try {
            await setDoc(doc(db, 'bookings', b.id), b);
          } catch (err) {
            try {
              handleFirestoreError(err, OperationType.WRITE, `bookings/${b.id}`);
            } catch (handledErr) {
              console.error("Firestore initialization seed error:", handledErr);
            }
          }
        });
      } else {
        setBookings(fetched);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'bookings');
    });
    return () => unsubscribe();
  }, []);

  // Sync reviews in real-time from Firestore (Guest Testimonials)
  useEffect(() => {
    const q = query(collection(db, 'reviews'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach((d) => {
        fetched.push({ id: d.id, ...d.data() });
      });
      
      if (snapshot.empty && fetched.length === 0) {
        const local = localStorage.getItem('shubham_reviews');
        const initial = local ? JSON.parse(local) : INITIAL_REVIEWS;
        initial.forEach(async (r: any) => {
          try {
            await setDoc(doc(db, 'reviews', r.id), r);
          } catch (err) {
            console.error("Firestore reviews initialization seed error:", err);
          }
        });
      } else {
        fetched.sort((a, b) => b.id.localeCompare(a.id));
        setReviewsList(fetched);
      }
    }, (error) => {
      console.warn("Could not synchronize reviews (requires guest auth or read restricted):", error);
    });
    return () => unsubscribe();
  }, []);

  // Sync inquiries in real-time from Firestore (Admin only)
  useEffect(() => {
    const isAdminUser = currentUser && (currentUser.email === 'amitaverma496@gmail.com');
    if (!isAdminUser) {
      setInquiries([]);
      return;
    }

    const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Inquiry[] = [];
      snapshot.forEach((d) => {
        fetched.push({ id: d.id, ...d.data() } as Inquiry);
      });
      
      if (snapshot.empty && fetched.length === 0) {
        const local = localStorage.getItem('shubham_inquiries');
        const initial = local ? JSON.parse(local) : INITIAL_INQUIRIES;
        initial.forEach(async (inq: Inquiry) => {
          try {
            await setDoc(doc(db, 'inquiries', inq.id), inq);
          } catch (err) {
            console.error("Firestore inquiries initialization seed error:", err);
          }
        });
      } else {
        setInquiries(fetched);
      }
    }, (error) => {
      console.warn("Could not synchronize inquiries (non-admin restricted).");
    });
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('shubham_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  // --- COMPONENT LEVEL STATE ---
  const [loading, setLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [selectedDishesForBooking, setSelectedDishesForBooking] = useState<{ name: string; quantity: number }[]>([]);
  const [showQuantityModalFor, setShowQuantityModalFor] = useState<string | null>(null);
  const [isCartExpanded, setIsCartExpanded] = useState(false);

  // Center pre-order popup states
  const [isPreOrderPopupOpen, setIsPreOrderPopupOpen] = useState(false);
  const [preOrderForm, setPreOrderForm] = useState({
    name: '',
    phone: '',
    guests: 2,
    date: '',
    time: '7:30 PM',
    specialRequest: ''
  });
  const [preOrderSuccess, setPreOrderSuccess] = useState(false);
  const [preOrderTicket, setPreOrderTicket] = useState<any>(null);
  const [preOrderValidationWarning, setPreOrderValidationWarning] = useState<string | null>(null);
  
  // Contact inquiry form state
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    message: ''
  });
  const [contactSuccess, setContactSuccess] = useState('');

  // DOM refs to animate without React triggers (Butter-smooth, 120fps GPU performance)
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const torchRef = useRef<HTMLDivElement>(null);
  const globalBgRef = useRef<HTMLDivElement>(null);

  // State condition only updates when crossing the 300px threshold to trigger loading/unloading of backgrounds
  const [isPastThreshold, setIsPastThreshold] = useState(false);

  // --- INITIAL COMPONENT MOUNT LOADING EFFECT ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Butter-smooth real-time mouse follow without triggering React re-renders
  const handleMouseMove = (e: React.MouseEvent) => {
    if (heroRef.current && torchRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 300;
      const y = e.clientY - rect.top - 300;
      // Using GPU-accelerated transform instead of top/left layout paints
      torchRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  };

  // Butter-smooth real-time scroll parallax without triggering React re-renders
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Update parallax on global background div directly via DOM ref
      if (globalBgRef.current) {
        globalBgRef.current.style.transform = `translate3d(0, ${currentScrollY * -0.15}px, 0)`;
      }

      // Check boundary threshold and update React state only on transition crossings
      const past = currentScrollY > 300;
      setIsPastThreshold(prev => {
        if (prev !== past) {
          return past;
        }
        return prev;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Execute once initially
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- ACTIONS ---
  const handleAddBooking = async (newBooking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    const created: Booking = {
      id: 'b-' + Date.now(),
      ...newBooking,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      bookingType: 'table'
    };
    try {
      await setDoc(doc(db, 'bookings', created.id), created);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `bookings/${created.id}`);
    }
    // Clear selection so cart notification resets
    setSelectedDishesForBooking([]);
  };

  const handlePreOrderFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPreOrderValidationWarning(null);

    if (!preOrderForm.name || !preOrderForm.phone || !preOrderForm.date || !preOrderForm.time) {
      setPreOrderValidationWarning("All required fields with * must be filled!");
      return;
    }

    // 1. Phone number validation: Only digits, exactly 10 digits
    const cleanedPhone = preOrderForm.phone.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      setPreOrderValidationWarning("Mobile Number must be exactly 10 digits. (Please do not try to cheat the booking system!)");
      return;
    }

    // 2. AM or PM Validation
    const parsedTime = preOrderForm.time.toLowerCase();
    if (!parsedTime.includes('am') && !parsedTime.includes('pm')) {
      setPreOrderValidationWarning("Invalid Time Format: Please remember to write 'AM' or 'PM' explicitly in your custom time field (e.g., '7:30 PM' or '1:15 AM') so our chefs can prepare the pre-order on schedule.");
      return;
    }

    const ticketNumber = 'SHUBHAM-' + Math.floor(1000 + Math.random() * 9000);
    
    // Create the booking entry
    const created: Booking = {
      id: 'b-' + Date.now(),
      name: preOrderForm.name,
      phone: cleanedPhone,
      guests: preOrderForm.guests,
      date: preOrderForm.date,
      time: preOrderForm.time,
      specialRequest: preOrderForm.specialRequest,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      bookingType: 'preorder',
      preorderDishes: selectedDishesForBooking.map(item => `${item.name} (x${item.quantity})`).join(', ')
    };

    try {
      await setDoc(doc(db, 'bookings', created.id), created);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `bookings/${created.id}`);
    }
    
    setPreOrderTicket({
      ticketNumber,
      name: preOrderForm.name,
      phone: cleanedPhone,
      guests: preOrderForm.guests,
      date: preOrderForm.date,
      time: preOrderForm.time,
      specialRequest: preOrderForm.specialRequest
    });

    setPreOrderSuccess(true);
    // Note: We don't clear the selected dishes immediately so the success ticket can still compute total and display items. We can clear it if they close the success dialog.
  };

  const handleAddReview = async (newReview: Omit<any, 'id' | 'date' | 'avatar'>) => {
    const created = {
      id: 'rev-' + Date.now(),
      ...newReview,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      avatar: auth.currentUser?.photoURL || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?auto=format&fit=crop&q=80&w=150`
    };
    try {
      await setDoc(doc(db, 'reviews', created.id), created);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, `reviews/${created.id}`);
      } catch (handledErr) {
        console.error("Firestore reviews write error:", handledErr);
      }
    }
    setReviewsList(prev => [created, ...prev]);
  };

  const handleAddInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.message) return;

    const created: Inquiry = {
      id: 'inq-' + Date.now(),
      name: contactForm.name,
      phone: contactForm.phone || 'Not Specified',
      message: contactForm.message,
      status: 'Unread',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'inquiries', created.id), created);
      setContactForm({ name: '', phone: '', message: '' });
      setContactSuccess('Your message was forwarded to the executive desk. Thank you for your inquiry.');
      setTimeout(() => setContactSuccess(''), 4500);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, `inquiries/${created.id}`);
      } catch (handledErr) {
        console.error("Firestore inquiry write error:", handledErr);
      }
    }
    setInquiries(prev => [created, ...prev]);
  };

  // Add/remove/update gastronomy dish item for booking requests with quantity
  const handleAddDishToBookingRequest = (dishName: string) => {
    setSelectedDishesForBooking(prev => {
      const exists = prev.some(item => item.name === dishName);
      if (exists) {
        // If it already exists, clicking again acts as a toggle to REMOVE (as requested)
        return prev.filter(item => item.name !== dishName);
      } else {
        // If it doesn't exist, open our beautiful portion picker modal
        setShowQuantityModalFor(dishName);
        return prev;
      }
    });
  };

  const handleConfirmQuantity = (dishName: string, quantity: number) => {
    setSelectedDishesForBooking(prev => {
      const exists = prev.some(item => item.name === dishName);
      if (exists) {
        return prev.map(item => item.name === dishName ? { name: dishName, quantity } : item);
      }
      return [...prev, { name: dishName, quantity }];
    });
  };

  const handleUpdateDishQty = (dishName: string, delta: number) => {
    setSelectedDishesForBooking(prev => {
      return prev.map(item => {
        if (item.name === dishName) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > 5) return { ...item, quantity: 5 }; // max 5
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as { name: string; quantity: number }[];
    });
  };

  const handleRemoveDishFromCart = (dishName: string) => {
    setSelectedDishesForBooking(prev => prev.filter(item => item.name !== dishName));
  };

  const clearSelectedDishes = () => {
    setSelectedDishesForBooking([]);
  };

  // Auto scroll to smooth section refs
  const scrollToSection = (id: string) => {
    setIsAdminMode(false); // Make sure we turn off admin mode when navigating to main sections
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div ref={containerRef} className="selection:bg-gold selection:text-black min-h-screen bg-lux-black relative overflow-x-hidden w-full max-w-full">
      
      {/* 1. CINEMATIC LUXURY CARD LOADING SCREEN */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 bg-[#0A0A0A] z-999 flex flex-col items-center justify-center p-8 select-none"
          >
            <div className="text-center space-y-6 max-w-md">
              {/* Spinning Monogrammed Gold S */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                className="w-16 h-16 rounded-full border-2 border-dashed border-gold flex items-center justify-center mx-auto bg-black shadow-[0_0_20px_rgba(212,175,55,0.4)]"
              >
                <span className="font-serif font-black text-gold text-2xl tracking-tighter">S</span>
              </motion.div>

              <div className="space-y-2">
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-serif text-white tracking-[0.25em] text-sm font-black uppercase"
                >
                  SHUBHAM
                </motion.h1>
                <p className="text-[10px] tracking-[0.4em] text-gold uppercase font-mono">
                  Family Restaurant & Hotel
                </p>
              </div>

              {/* Gold luxury thin status loading streak */}
              <div className="w-48 h-[1px] bg-white/10 rounded-full overflow-hidden mx-auto">
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  className="w-1/2 h-full bg-gold"
                />
              </div>
              <span className="text-[8px] font-mono uppercase tracking-widest text-white/30 block">Lucknow Excellence • Est. 2026</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. GLASS NAVIGATION BAR */}
      <Navbar 
        onNavClick={scrollToSection} 
        onAdminToggle={() => setIsAdminMode(!isAdminMode)}
        isAdminMode={isAdminMode}
        currentUser={currentUser}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

       {/* 3. CONDITIONAL RENDER: BACK-OF-HOUSE ADMIN CONSOLE vs. FRONT-OF-HOUSE PUBLIC PORTAL */}
      <AnimatePresence mode="wait">
        {isAdminMode ? (
          <motion.div
            key="admin-workspace"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <AdminPanel
              bookings={bookings}
              setBookings={setBookings}
              menuItems={menuItems}
              setMenuItems={setMenuItems}
              galleryItems={galleryItems}
              setGalleryItems={setGalleryItems}
              inquiries={inquiries}
              setInquiries={setInquiries}
              currentUser={currentUser}
              onSignIn={handleSignIn}
            />
          </motion.div>
        ) : (
          <motion.div
            key="public-portal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            
            {/* Global Subtle Parallax 3D background animation across the website, performance optimized */}
            <div 
              ref={globalBgRef}
              className="fixed inset-0 w-full h-full z-0 opacity-[0.08] pointer-events-none blur-[1px]"
              style={{ transform: 'translate3d(0, 0, 0)' }}
            >
              {isPastThreshold && (
                <NeuralBackground 
                  color="#D4AF37"
                  trailOpacity={0.16} 
                  particleCount={120} 
                  speed={0.35} 
                  scale={1}
                />
              )}
            </div>

            {/* 3D Spiral Background Animation - Visible everywhere except Hero section (active after scrollY > 300) */}
            {isPastThreshold && (
              <div className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-80 animate-fadeIn animate-duration-500">
                <SpiralAnimation color="#D4AF37" />
              </div>
            )}

            {/* HER0 DISPLAY LANDING CANVAS */}
            <header 
              id="home" 
              ref={heroRef}
              onMouseMove={handleMouseMove}
              className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-44 px-4 sm:px-6 select-none overflow-hidden z-10"
            >
              
              {/* Pure luxurious black background */}
              <div className="absolute inset-0 bg-[#0a0a0a] w-full h-full" />

              {/* Dynamic Interactive Flow-Field Neural Background (Multi-hue Micro-Fluid 3D Systems) */}
              <div className="absolute inset-0 w-full h-full z-[1] opacity-80 mix-blend-screen pointer-events-none font-sans">
                {!isPastThreshold && (
                  <NeuralBackground 
                    trailOpacity={0.15} 
                    particleCount={150} 
                    speed={0.6} 
                    scale={1.3}
                  />
                )}
              </div>

              {/* Reactive Gold Torch Flare mapping mouse movement */}
              <div 
                ref={torchRef}
                className="absolute pointer-events-none w-[600px] h-[600px] rounded-full mix-blend-screen opacity-15 blur-[120px] bg-[radial-gradient(circle,_rgba(212,175,55,0.2)_0%,_transparent_70%)]"
                style={{
                  left: 0,
                  top: 0,
                  transform: 'translate3d(-300px, -300px, 0)',
                  transition: 'transform 0.1s ease-out'
                }}
              />

              {/* Ambient floating gold stardust effect coordinates */}
              <div className="absolute inset-0 z-10 pointer-events-none opacity-40">
                {[...Array(20)].map((_, index) => (
                  <div
                    key={index}
                    className="absolute bg-gold rounded-full w-1 h-1"
                    style={{
                      top: `${10 + Math.random() * 80}%`,
                      left: `${10 + Math.random() * 80}%`,
                      boxShadow: '0 0 10px #D4AF37',
                      opacity: 0.3 + Math.random() * 0.7,
                      transform: `scale(${0.5 + Math.random()})`
                    }}
                  />
                ))}
              </div>

              {/* Background Ambient Glows from Sleek Interface Theme */}
              <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-gold opacity-10 blur-[120px] rounded-full pointer-events-none" />
              <div className="absolute bottom-[-50px] left-[-50px] w-[300px] h-[300px] bg-gold opacity-[0.08] blur-[100px] rounded-full pointer-events-none" />

              {/* Content Panel Frame */}
              <div className="max-w-6xl mx-auto px-4 z-20 text-center space-y-12 select-none">
                
                {/* Gold emblem badge floating enter */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="inline-flex items-center gap-2 justify-center px-5 py-2 glass rounded-full border border-gold/45 text-[10px] sm:text-xs tracking-[0.45em] font-mono text-gold uppercase md:scale-100 scale-90"
                >
                  <Sparkles className="w-4 h-4 text-gold animate-pulseAndScale animate-duration-1000" /> 
                  A Premium Family Dining Experience
                </motion.div>

                {/* Restaurant Large Typography */}
                <div className="space-y-6">
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-[110px] text-3d-gold tracking-widest leading-none uppercase font-black"
                  >
                    SHUBHAM
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="text-sm sm:text-base md:text-lg font-sans tracking-[0.5em] text-3d-silver block uppercase font-black"
                  >
                    FAMILY RESTAURANT & HOTEL
                  </motion.p>
                  
                  {/* Subtle luxurious quote in between */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="text-xs sm:text-sm font-mono tracking-widest text-[#F4D03F]/80 max-w-2xl mx-auto font-semibold leading-relaxed"
                  >
                    STARTING POINT, SHREE TILAK COMPLEX, AGRA EXPRESSWAY, LUCKNOW
                  </motion.p>
                </div>

                <div className="w-24 h-[1px] bg-gold/50 mx-auto my-4" />

                {/* Theme Stats Grid Indicator */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="grid grid-cols-3 gap-6 max-w-3xl mx-auto pt-4"
                >
                  <div className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-sm hover:border-gold/35 hover:bg-white/[0.05] transition-all duration-300">
                    <div className="text-gold mb-1 font-mono font-bold text-lg sm:text-xl">★ 4.8</div>
                    <div className="text-[10px] tracking-wider text-white/50 uppercase font-mono">Customer Rating</div>
                  </div>
                  <div className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-sm hover:border-gold/35 hover:bg-white/[0.05] transition-all duration-300">
                    <div className="text-white mb-1 font-mono font-bold text-lg sm:text-xl">33k+</div>
                    <div className="text-[10px] tracking-wider text-white/50 uppercase font-mono">Happy Diners</div>
                  </div>
                  <div className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-sm hover:border-gold/35 hover:bg-white/[0.05] transition-all duration-300">
                    <div className="text-white mb-1 font-serif font-bold text-sm sm:text-base pt-0.5">LUCKNOW</div>
                    <div className="text-[10px] tracking-wider text-white/50 uppercase font-mono">Agra Expressway</div>
                  </div>
                </motion.div>

                {/* Call-To-Action buttons in Hero segment */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 md:scale-105 scale-95"
                >
                  <LiquidButton
                    variant="primary"
                    onClick={() => scrollToSection('booking')}
                  >
                    Book Royal Table
                  </LiquidButton>
                  <LiquidButton
                    variant="secondary"
                    onClick={() => scrollToSection('menu')}
                  >
                    View Gourmet Menu
                  </LiquidButton>
                </motion.div>

                {/* Premium Restaurant Imagery Centerpiece */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  className="max-w-5xl mx-auto pt-10"
                >
                  <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_25px_60px_rgba(212,175,55,0.18)] bg-slate-950/40 p-2 backdrop-blur-sm group hover:border-gold/30 transition-all duration-500">
                    <img 
                      src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200" 
                      alt="Shubham Premium Family Dining Experience" 
                      className="w-full h-auto rounded-2xl object-cover aspect-video md:aspect-[21/9] filter brightness-95 group-hover:scale-[1.01] transition-transform duration-700 select-none"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-65" />
                  </div>
                </motion.div>

              </div>

              {/* Chevron scroll guide indicator */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-20" onClick={() => scrollToSection('features')}>
                <div className="w-5 h-8 border border-white/20 rounded-full flex justify-center p-1">
                  <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-1.5 h-1.5 bg-gold rounded-full"
                  />
                </div>
              </div>

            </header>

            {/* BENTO GRID LUXURY VALUES SECTION */}
            <section id="features" className="py-24 border-t border-white/5 bg-lux-black relative overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                
                {/* Header title */}
                <div className="text-center mb-16 space-y-4">
                  <span className="text-[10px] font-mono tracking-[0.35em] text-gold uppercase block">The Signature Standard</span>
                  <h2 className="font-serif text-3xl md:text-5xl text-3d-white tracking-widest uppercase">THE LUXURY CRITERIA</h2>
                  <div className="w-16 h-[1px] bg-gold mx-auto" />
                </div>

                {/* Bento layout grids */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Item 1: Dining family Atmosphere (Thick 2 cols) */}
                  <div className="glass p-8 rounded-3xl border border-white/8 relative overflow-hidden md:col-span-2 group min-h-[240px] flex flex-col justify-between">
                    <div className="absolute right-0 top-0 w-44 h-44 bg-gold/5 blur-3xl rounded-full" />
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-6">
                        <Heart className="w-5 h-5 text-gold" />
                      </div>
                      <h3 className="font-serif text-xl md:text-2xl text-white uppercase tracking-wider mb-2 font-black">
                        Family Friendly Awadhi Hospitality
                      </h3>
                      <p className="text-white/60 text-xs md:text-sm tracking-wide leading-relaxed font-sans max-w-xl">
                        At Shubham, family values are at the absolute heart of our hospitality. We carry on Lucknow's traditional 'Tehzeeb' (courteous culture), ensuring a dining environment where young ones, parents, and grandparents gather comfortably over gourmet delicacies.
                      </p>
                    </div>
                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-6 block">Warmth • Generations</span>
                  </div>

                  {/* Item 2: Fresh Quality (1 col) */}
                  <div className="glass p-8 rounded-3xl border border-white/8 relative overflow-hidden group flex flex-col justify-between">
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-6">
                        <Sparkles className="w-5 h-5 text-gold" />
                      </div>
                      <h3 className="font-serif text-lg md:text-xl text-white uppercase tracking-wider mb-2 font-bold">
                        Pristine Fresh Ingredients
                      </h3>
                      <p className="text-white/60 text-xs tracking-wide leading-relaxed font-sans">
                        100% pure organic vegetarian materials, hand-picked authentic Lucknowi saffron, homemade farm khoya, and slow-pressed healthy oils. No artificial tasting agents.
                      </p>
                    </div>
                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-6 block font-bold">Farm-To-Fork • Purity</span>
                  </div>

                  {/* Item 3: Pricing (1 col) */}
                  <div className="glass p-8 rounded-3xl border border-white/8 relative overflow-hidden group flex flex-col justify-between">
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-6">
                        <Star className="w-5 h-5 text-gold" />
                      </div>
                      <h3 className="font-serif text-lg md:text-xl text-white uppercase tracking-wider mb-2 font-bold">
                        Delightful Affordable Values
                      </h3>
                      <p className="text-white/60 text-xs tracking-wide leading-relaxed font-sans">
                        Experience 7-Star fine dining ambiance, professional uniformed butler response, and culinary mastery at absolute delightful standard family pricing.
                      </p>
                    </div>
                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-6 block font-bold">Luxury Value Ratio</span>
                  </div>

                  {/* Item 4: Atmosphere Atmosphere (Thick 2 cols) */}
                  <div className="glass p-8 rounded-3xl border border-white/8 relative overflow-hidden md:col-span-2 group min-h-[240px] flex flex-col justify-between">
                    <div className="absolute right-0 bottom-0 w-52 h-52 bg-white/2 blur-2xl rounded-full" />
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-6">
                        <Building2 className="w-5 h-5 text-gold" />
                      </div>
                      <h3 className="font-serif text-xl md:text-2xl text-white uppercase tracking-wider mb-2 font-black">
                        Opulent Palace Ambiance & Prime Location
                      </h3>
                      <p className="text-white/60 text-xs md:text-sm tracking-wide leading-relaxed font-sans max-w-xl">
                        Strategically located right at the starting entrance of the Agra-Lucknow Expressway, Shri Tilak Complex. Framed with majestic, eye-soothing soft warm architecture lighting, dust-free indoor air management, acoustic padding, and absolute premium furniture.
                      </p>
                    </div>
                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-6 block">Tilak Complex • Agra Expressway</span>
                  </div>

                </div>

              </div>
            </section>

            {/* DYNAMIC EXTRACTED MENU DELICACY CATALOG */}
            <MenuSection 
              menuItems={menuItems}
              onAddToRequest={handleAddDishToBookingRequest}
              selectedDishes={selectedDishesForBooking.map(item => item.name)}
              clearSelectedDishes={clearSelectedDishes}
            />

            {/* UNIQUE HIGH-END FEATURE: PRESTIGE HOTEL ACCOMMODATION SUITES (HOTEL ASPECT) */}
            <section className="py-24 border-t border-white/5 relative bg-lux-secondary">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  
                  {/* Left Column: text features */}
                  <div className="space-y-6 text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/30 rounded-full text-[10px] tracking-[0.3em] font-mono text-gold uppercase">
                      <Building2 className="w-3.5 h-3.5 text-gold" /> Luxury Accommodation Stay
                    </div>
                    <h2 className="font-serif text-3xl md:text-5xl tracking-widest uppercase">
                      <span className="text-3d-white">SHUBHAM </span>
                      <span className="text-3d-gold">HOTEL</span>
                      <span className="text-3d-white"> SUITES</span>
                    </h2>
                    <p className="text-white/70 text-xs md:text-sm tracking-wider leading-relaxed font-sans font-medium uppercase text-gold">
                      Relax. Rejoice. Rest. High-spec Comfort right beside the expressway.
                    </p>
                    <p className="text-white/60 text-xs md:text-sm leading-relaxed font-sans">
                      Perfect for elite travelers, family excursions, and wedding groups coming to Lucknow, Uttar Pradesh. Our boutique hotel wing is fully loaded with top-tier hospitality assets:
                    </p>

                    <div className="grid grid-cols-2 gap-4 font-mono text-[10px] md:text-xs text-white/80 uppercase tracking-widest">
                      <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" /> Full Air Conditioning
                      </div>
                      <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" /> 24/7 Room Dine In
                      </div>
                      <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" /> High-Speed Wi-Fi
                      </div>
                      <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" /> Secure Premium Parking
                      </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                      <a
                        href="#booking"
                        className="px-6 py-3 rounded-full bg-gold hover:bg-gold/90 text-black text-[10.5px] font-extrabold tracking-widest uppercase transition-all"
                      >
                        Inquire Stay Suite
                      </a>
                      <a
                        href="tel:7800335000"
                        className="px-6 py-3 rounded-full border border-white/10 hover:border-gold hover:bg-gold/10 text-white text-[10.5px] font-bold tracking-widest uppercase transition-all block text-center"
                      >
                        Call Concierge
                      </a>
                    </div>
                  </div>

                  {/* Right Column: gorgeous parallax visual overlay of double rooms */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gold/10 rounded-2xl blur-2xl group-hover:bg-gold/15 transition-all duration-500 scale-95 pointer-events-none" />
                    
                    {/* Double stacked images styled to look ultra premium */}
                    <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-video lg:aspect-square">
                      <img
                        src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1200"
                        alt="Shubham Premium Stay Double Room"
                        className="w-full h-full object-cover animate-live-pan"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-5 left-5 right-5 glass p-4 rounded-xl border border-white/10 select-none">
                        <span className="text-[9px] font-mono text-gold uppercase tracking-widest font-bold">Presidential Wing Suite</span>
                        <p className="font-serif text-sm text-white uppercase font-extrabold tracking-widest mt-0.5">Classic Awadhi Suite Room</p>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </section>

            {/* MASONRY PICTURES LIGHTBOX MUSEUM */}
            <GalleryLightbox galleryItems={galleryItems} />

            {/* GUEST TESTIMONIAL STAR DIRECTORY */}
            <Reviews 
              onAddReview={(rev) => executeProtectedAction(() => handleAddReview(rev))}
              reviewsList={reviewsList}
            />

            {/* INTERACTIVE TABLE ACCORDION RESERVATION */}
            <BookingSystem 
              onAddBooking={(bk) => executeProtectedAction(() => handleAddBooking(bk))} 
              selectedDishes={selectedDishesForBooking.map(item => `${item.name} (x${item.quantity})`)}
              bookings={bookings}
            />

            {/* NEUMORPHIC LUXURY CONTACT AREA + INTEGRATED MAPS */}
            <section id="contact" className="py-24 border-t border-white/5 bg-lux-secondary relative">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                
                {/* Heading */}
                <div className="text-center mb-16 space-y-4">
                  <span className="text-[10px] font-mono tracking-[0.35em] text-gold uppercase block">Arriving at Shubham</span>
                  <h2 className="font-serif text-3xl md:text-5xl text-white tracking-widest uppercase">
                    DIRECTIONS & <span className="text-gold">TELEPHONY</span>
                  </h2>
                  <div className="w-16 h-[1px] bg-gold mx-auto" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                  
                  {/* Left details pane */}
                  <div className="space-y-8 text-left">
                    
                    {/* Glass Details cards */}
                    <div className="glass p-6 rounded-3xl border border-white/8 space-y-4">
                      
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-gold uppercase tracking-widest font-bold block mb-1">Our Heritage Location</span>
                          <p className="text-xs text-white/90 uppercase tracking-widest font-serif font-black leading-relaxed">
                            STARTING POINT, SHRI TILAK COMPLEX, <br />
                            BADI NAHAR MOHAN ROAD, <br />
                            AGRA EXPRESSWAY, <br />
                            Lucknow, Uttar Pradesh 226008
                          </p>
                        </div>
                      </div>

                      <div className="h-[1px] bg-white/5" />

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                          <Phone className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-gold uppercase tracking-widest font-bold block mb-1">Direct Telephony</span>
                          <a href="tel:7800335000" className="text-base font-bold font-mono text-white tracking-widest hover:text-gold block transition-colors mt-0.5">
                            +91 7800335000
                          </a>
                        </div>
                      </div>

                    </div>

                    {/* Integrated Quick Inquiries form */}
                    <div className="glass p-6 rounded-3xl border border-white/8 space-y-4">
                      <span className="text-[10px] font-mono text-gold uppercase tracking-widest font-bold block mb-1">Send Instant Note</span>
                      <h3 className="font-serif text-base text-white uppercase tracking-wider font-extrabold mb-3">Concierge Inquiry desk</h3>
                      
                      {contactSuccess && (
                        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs tracking-wider text-center uppercase font-bold">
                          {contactSuccess}
                        </div>
                      )}

                      <form onSubmit={(e) => { e.preventDefault(); executeProtectedAction(() => handleAddInquiry(e)); }} className="space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            required
                            placeholder="Your Name*"
                            value={contactForm.name}
                            onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-black/50 border border-white/12 text-white px-4 py-2.5 rounded-xl outline-none focus:border-gold transition-colors placeholder:text-white/20"
                          />
                          <input
                            type="tel"
                            placeholder="Phone (optional)"
                            value={contactForm.phone}
                            onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="bg-black/50 border border-white/12 text-white px-4 py-2.5 rounded-xl outline-none focus:border-gold transition-colors placeholder:text-white/20 font-mono"
                          />
                        </div>
                        <textarea
                          rows={3}
                          required
                          placeholder="Your message, banquet booking proposal, or wedding suite rates inquiries..."
                          value={contactForm.message}
                          onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                          className="w-full bg-black/50 border border-white/12 text-white px-4 py-2.5 rounded-xl outline-none focus:border-gold transition-colors placeholder:text-white/20 resize-none font-sans leading-relaxed"
                        />
                        <Button
                          neon={true}
                          variant="solid"
                          type="submit"
                          className="w-full py-2.5 text-black hover:text-white border-gold/40 text-[11px] font-bold tracking-widest uppercase mt-2 select-none"
                        >
                          <Send className="w-3 h-3 inline mr-1.5" /> Forward note to desk
                        </Button>
                      </form>
                    </div>

                  </div>

                  {/* Right: Premium Interactive Google Map */}
                  <div className="h-[420px] w-full">
                    <InteractiveMap />
                  </div>

                </div>

              </div>
            </section>

          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FOOTER COMPARTMENT --- */}
      <footer className="bg-[#111111] border-t border-white/10 py-12 px-12 relative z-10 select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          
          <div className="flex flex-col md:flex-row gap-12 text-left">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-gold mb-1 font-mono font-bold">Location</span>
              <span className="text-[11px] text-white/60 font-sans tracking-wide">Shri Tilak Complex, Agra Expressway Entrance, Lucknow</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-gold mb-1 font-mono font-bold">Contact</span>
              <span className="text-[11px] text-white/60 font-sans tracking-wide">+91 78003 35000</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6 items-center justify-center">
            <div className="flex gap-2 items-center">
               <div className="w-1.5 h-1.5 bg-gold rounded-full"></div>
               <span className="text-[10px] uppercase tracking-tighter text-white/70 font-mono font-semibold">Fresh Ingredients</span>
            </div>
            <div className="flex gap-2 items-center">
               <div className="w-1.5 h-1.5 bg-gold rounded-full"></div>
               <span className="text-[10px] uppercase tracking-tighter text-white/70 font-mono font-semibold">Premium Atmosphere</span>
            </div>
            <div className="flex gap-2 items-center">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] uppercase tracking-tighter text-emerald-400 font-mono font-bold">Open Now</span>
            </div>
          </div>

          {/* Floating WhatsApp Button (Visual only) */}
          <a href="https://wa.me/917800335000" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#25D366] hover:bg-[#20ba5a] rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 cursor-pointer overflow-hidden transform hover:scale-110 transition-transform">
             <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M12.012 2c-5.508 0-9.987 4.479-9.987 9.988 0 1.757.463 3.407 1.268 4.839L2 22l5.354-1.405c1.393.759 2.977 1.196 4.658 1.196 5.507 0 9.988-4.479 9.988-9.988S17.52 2 12.012 2z"></path></svg>
          </a>

        </div>

        <div className="max-w-7xl mx-auto border-t border-white/5 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          
          {/* Brand Frame */}
          <div className="space-y-1">
            <span className="font-serif font-black text-gold text-sm tracking-widest uppercase block">
              SHUBHAM FAMILY
            </span>
            <p className="text-[9px] tracking-[0.25em] text-white/40 block font-mono">
              ESTABLISHED IN LUCKNOW • DELIVERING MUGHLAI & COMFORT FINE DINING
            </p>
          </div>

          {/* Copyright details */}
          <div className="space-y-1.5 font-mono text-[9px] sm:text-[10px] tracking-widest text-white/35 md:text-right">
            <p>© 2026 SHUBHAM FAMILY RESTAURANT & HOTEL.</p>
            <p className="flex items-center justify-center md:justify-end gap-1 font-bold text-gold">
              MADE WITH PREMISE 'TEHZEEB' <Heart className="w-3 h-3 text-red-500 fill-current animate-pulse" /> IN LUCKNOW
            </p>
          </div>

        </div>
      </footer>

      {/* --- ZOMATO-STYLE BOTTOM STICKY CART POPUP --- */}
      <AnimatePresence>
        {selectedDishesForBooking.length > 0 && !isAdminMode && (
          <motion.div
            initial={{ y: 100, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            exit={{ y: 100, x: '-50%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-4 left-1/2 w-[calc(100%-2rem)] max-w-lg md:max-w-xl z-50 font-sans"
          >
            {/* Main Bar Card with luxury gold theme */}
            <div className="bg-[#111111]/95 backdrop-blur-md border border-gold/40 rounded-2xl md:rounded-3xl shadow-[0_20px_50px_rgba(212,175,55,0.35)] overflow-hidden">
              
              {/* Expandable Drawer Content */}
              <AnimatePresence>
                {isCartExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-b border-white/10 max-h-60 overflow-y-auto"
                  >
                    <div className="p-4 md:p-6 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-serif text-xs uppercase tracking-widest font-black flex items-center gap-2">
                          <UtensilsCrossed className="w-3.5 h-3.5 text-gold" />
                          Selected Royal Dishes
                        </h4>
                        <button 
                          onClick={() => {
                            setSelectedDishesForBooking([]);
                            setIsCartExpanded(false);
                          }}
                          className="text-[10px] text-red-400 hover:text-red-300 font-bold tracking-widest uppercase transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Clear All
                        </button>
                      </div>

                      <div className="space-y-2">
                        {selectedDishesForBooking.map(cartItem => {
                          const name = cartItem.name;
                          const quantity = cartItem.quantity;
                          const item = menuItems.find(i => i.name === name);
                          return (
                            <div key={name} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                              <div className="flex items-center gap-2">
                                {item?.isVeg ? (
                                  <span className="w-3 h-3 border border-emerald-500 flex items-center justify-center p-0.5 rounded-sm shrink-0" title="Veg">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                  </span>
                                ) : (
                                  <span className="w-3 h-3 border border-red-500 flex items-center justify-center p-0.5 rounded-sm shrink-0" title="Non-Veg">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                  </span>
                                )}
                                <span className="text-white font-medium uppercase tracking-wide text-[11px] font-sans">
                                  {name}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-gold font-bold">₹{(item?.price || 0) * quantity}</span>
                                
                                {/* Quantity Toggler inside Cart List */}
                                <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5 font-mono">
                                  <button
                                    onClick={() => handleUpdateDishQty(name, -1)}
                                    className="w-5 h-5 rounded hover:bg-white/10 text-white flex items-center justify-center font-bold text-xs"
                                    title="Decrease quantity"
                                  >
                                    -
                                  </button>
                                  <span className="text-[11px] text-gold font-bold px-1.5 min-w-[12px] text-center">
                                    {quantity}
                                  </span>
                                  <button
                                    onClick={() => handleUpdateDishQty(name, 1)}
                                    disabled={quantity >= 5}
                                    className="w-5 h-5 rounded hover:bg-white/10 text-white disabled:text-white/20 disabled:hover:bg-transparent flex items-center justify-center font-bold text-xs"
                                    title="Increase quantity (Max 5)"
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleRemoveDishFromCart(name)}
                                  className="w-6 h-6 rounded-md bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-black flex items-center justify-center transition-colors cursor-pointer border border-red-500/20"
                                  title="Remove item"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Compressed Bottom Bar Row */}
              <div className="p-4 flex items-center justify-between gap-4">
                
                {/* Left Side: item counters and quick detail toggler */}
                <div 
                  onClick={() => setIsCartExpanded(!isCartExpanded)}
                  className="flex items-center gap-3 cursor-pointer select-none group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center relative">
                    <ShoppingBag className="w-5 h-5 text-gold" />
                    <span className="absolute -top-1.5 -right-1.5 bg-gold text-black font-mono text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">
                      {selectedDishesForBooking.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-white text-[11px] tracking-widest uppercase font-serif">
                      <span>Awadhi pre-order</span>
                      {isCartExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-gold group-hover:translate-y-0.5 transition-transform" />
                      ) : (
                        <ChevronUp className="w-3.5 h-3.5 text-gold group-hover:-translate-y-0.5 transition-transform" />
                      )}
                    </div>
                    <span className="font-mono text-xs text-gold font-extrabold tracking-widest mt-0.5 block">
                      ₹{selectedDishesForBooking.reduce((sum, cartItem) => {
                        const item = menuItems.find(i => i.name === cartItem.name);
                        return sum + (item ? item.price * cartItem.quantity : 0);
                      }, 0)}
                    </span>
                  </div>
                </div>

                {/* Right Side: Primary book action CTA button */}
                <Button
                  neon={true}
                  variant="solid"
                  onClick={() => {
                    const dishStrings = selectedDishesForBooking.map(item => `${item.name} (x${item.quantity})`).join(', ');
                    setPreOrderForm({
                      name: '',
                      phone: '',
                      guests: 2,
                      date: new Date().toISOString().split('T')[0],
                      time: '19:30',
                      specialRequest: `Pre-ordered culinary: ${dishStrings}`
                    });
                    setPreOrderSuccess(false);
                    setPreOrderTicket(null);
                    setIsPreOrderPopupOpen(true);
                  }}
                  className="px-5 py-3 text-black hover:text-white border-gold/40 text-[11px] font-extrabold tracking-widest uppercase flex items-center gap-1.5 cursor-pointer select-none"
                >
                  <span>Book & Pre-Order</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-black hover:bg-white animate-ping" />
                </Button>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ROYAL PORTION QUANTITY SELECTOR MODAL */}
      <AnimatePresence>
        {showQuantityModalFor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111111]/95 text-white border border-gold/40 p-6 rounded-3xl max-w-sm w-full text-center space-y-5 shadow-[0_0_50px_rgba(212,175,55,0.25)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
              
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono text-gold uppercase tracking-[0.25em] block">Royal Taste Portioning</span>
                <h3 className="font-serif text-white text-base md:text-lg uppercase font-black tracking-wide leading-snug">
                  Select Quantity for <br />
                  <span className="text-gold font-bold italic">{showQuantityModalFor}</span>
                </h3>
              </div>

              <p className="text-white/60 text-[11px] leading-relaxed font-sans max-w-xs mx-auto">
                How many exquisite servings would you like to request for your banquet pre-order? (Max 5 portions)
              </p>
              
              <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      handleConfirmQuantity(showQuantityModalFor, num);
                      setShowQuantityModalFor(null);
                    }}
                    className="w-11 h-11 md:w-12 md:h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-gold hover:text-black font-mono font-black text-sm md:text-base flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 duration-200"
                  >
                    {num}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowQuantityModalFor(null)}
                className="text-[9px] tracking-[0.2em] text-white/40 uppercase hover:text-white transition-colors duration-200 font-bold font-mono"
              >
                Cancel selection
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ROYAL PORTION QUANTITY SELECTOR MODAL */}
      <AnimatePresence>
        {showQuantityModalFor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111111]/95 text-white border border-gold/40 p-6 rounded-3xl max-w-sm w-full text-center space-y-5 shadow-[0_0_50px_rgba(212,175,55,0.25)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
              
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono text-gold uppercase tracking-[0.25em] block">Royal Taste Portioning</span>
                <h3 className="font-serif text-white text-base md:text-lg uppercase font-black tracking-wide leading-snug">
                  Select Quantity for <br />
                  <span className="text-gold font-bold italic">{showQuantityModalFor}</span>
                </h3>
              </div>

              <p className="text-white/60 text-[11px] leading-relaxed font-sans max-w-xs mx-auto">
                How many exquisite servings would you like to request for your banquet pre-order? (Max 5 portions)
              </p>
              
              <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      handleConfirmQuantity(showQuantityModalFor, num);
                      setShowQuantityModalFor(null);
                    }}
                    className="w-11 h-11 md:w-12 md:h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-gold hover:text-black font-mono font-black text-sm md:text-base flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 duration-200"
                  >
                    {num}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowQuantityModalFor(null)}
                className="text-[9px] tracking-[0.2em] text-white/40 uppercase hover:text-white transition-colors duration-200 font-bold font-mono"
              >
                Cancel selection
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ROYAL BESPOKE PRE-ORDER CENTER POPUP MODAL */}
      <AnimatePresence>
        {isPreOrderPopupOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9990] flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="bg-[#0C0C0C] border border-gold/45 text-white p-6 md:p-8 rounded-3xl max-w-lg w-full shadow-[0_0_60px_rgba(212,175,55,0.3)] relative overflow-hidden my-8 text-left"
            >
              {/* Elegant golden strip */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent" />
              
              {/* Close Button top right */}
              <button
                onClick={() => {
                  setIsPreOrderPopupOpen(false);
                  setPreOrderSuccess(false);
                }}
                className="absolute top-4 right-4 text-white/50 hover:text-gold transition-colors p-1"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {!preOrderSuccess ? (
                /* Preorder details input form */
                <form onSubmit={(e) => { e.preventDefault(); executeProtectedAction(() => handlePreOrderFormSubmit(e)); }} className="space-y-5">
                  <div className="text-center space-y-1">
                    <span className="text-[9px] font-mono text-gold uppercase tracking-[0.25em] block">Saffron Dining Experience</span>
                    <h3 className="font-serif text-white text-xl uppercase font-black tracking-widest text-center">
                      Banqueting Pre-Order Form
                    </h3>
                    <p className="text-white/50 text-[10px] uppercase tracking-wide text-center">
                      Fill accurate details to lock your luxury table booking
                    </p>
                  </div>

                  {/* REAL-TIME VALIDATION WARNINGS */}
                  {preOrderValidationWarning && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-500/15 border border-red-500/40 rounded-2xl p-4 text-center space-y-1"
                    >
                      <span className="font-mono text-[9px] uppercase font-black text-red-400 tracking-wider block">Format Error</span>
                      <p className="text-white text-xs leading-relaxed">
                        {preOrderValidationWarning}
                      </p>
                    </motion.div>
                  )}

                  {/* Pre-ordered items list preview in modal */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                    <span className="text-[9px] font-mono text-gold uppercase tracking-widest font-black block">Pre-ordered Gastronomy</span>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {selectedDishesForBooking.map(cartItem => {
                        const item = menuItems.find(i => i.name === cartItem.name);
                        return (
                          <div key={cartItem.name} className="flex justify-between items-center text-xs">
                            <span className="text-white/80 font-sans font-medium">
                              {cartItem.name} <span className="text-gold font-bold">x{cartItem.quantity}</span>
                            </span>
                            <span className="font-mono text-gold/80">
                              ₹{(item?.price || 0) * cartItem.quantity}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                      <span className="text-[10px] uppercase text-white/50 font-bold tracking-widest">Pre-order Total Cost</span>
                      <span className="font-mono text-gold font-extrabold text-sm">
                        ₹{selectedDishesForBooking.reduce((sum, cartItem) => {
                          const item = menuItems.find(i => i.name === cartItem.name);
                          return sum + (item ? item.price * cartItem.quantity : 0);
                        }, 0)}
                      </span>
                    </div>
                  </div>

                  {/* Customer Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-white/60 uppercase tracking-widest text-[8px] font-bold">Full Name*</label>
                      <input
                        type="text"
                        required
                        value={preOrderForm.name}
                        onChange={(e) => setPreOrderForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Vikramaditya"
                        className="w-full bg-black/40 border border-white/10 text-white px-4 py-2.5 rounded-full text-xs outline-none focus:border-gold transition-colors placeholder:text-white/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-white/60 uppercase tracking-widest text-[8px] font-bold">Mobile Phone (Strict 10 Digits)*</label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        value={preOrderForm.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setPreOrderForm(prev => ({ ...prev, phone: val }));
                          if (preOrderValidationWarning) setPreOrderValidationWarning(null);
                        }}
                        placeholder="10 digit number e.g. 7800335000"
                        className="w-full bg-black/40 border border-white/10 text-white px-4 py-2.5 rounded-full text-xs outline-none focus:border-gold transition-colors placeholder:text-white/20 font-mono"
                      />
                    </div>
                  </div>

                  {/* Date & Guest size */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-white/60 uppercase tracking-widest text-[8px] font-bold">Reservation Date*</label>
                      <input
                        type="date"
                        required
                        value={preOrderForm.date}
                        onChange={(e) => setPreOrderForm(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 text-white px-4 py-2.5 rounded-full text-xs outline-none focus:border-gold transition-colors font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-white/60 uppercase tracking-widest text-[8px] font-bold">Total Guests (Diners): <span className="text-gold font-bold">{preOrderForm.guests} Guests</span></label>
                      <select
                        value={preOrderForm.guests}
                        onChange={(e) => setPreOrderForm(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                        className="w-full bg-black/40 border border-white/10 text-white px-4 py-2.5 rounded-full text-xs outline-none focus:border-gold transition-colors"
                      >
                        {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20].map(s => (
                          <option key={s} value={s} className="bg-[#111] text-white">{s} Guests</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Custom Time Slot Picker */}
                  <div className="space-y-1">
                    <label className="block text-white/60 uppercase tracking-widest text-[8px] font-bold">Custom Dinner Time (must write AM or PM)*</label>
                    <input
                      type="text"
                      required
                      value={preOrderForm.time}
                      onChange={(e) => {
                        setPreOrderForm(prev => ({ ...prev, time: e.target.value }));
                        if (preOrderValidationWarning) setPreOrderValidationWarning(null);
                      }}
                      placeholder="e.g. 7:30 PM, 1:15 AM"
                      className="w-full bg-black/40 border border-white/10 text-white px-4 py-2.5 rounded-full text-xs outline-none focus:border-gold transition-colors placeholder:text-white/20 font-mono"
                    />
                    <span className="text-[10px] text-white/40 block mt-1">Please write custom dining hours with "AM" or "PM" explicitly.</span>
                  </div>

                  {/* Submit Button */}
                  <Button
                    neon={true}
                    variant="solid"
                    type="submit"
                    className="w-full py-3.5 text-black hover:text-white border-gold/40 text-[11px] font-extrabold tracking-widest uppercase cursor-pointer mt-4 select-none"
                  >
                    Confirm & Submit Royal Pre-Order
                  </Button>
                </form>
              ) : (
                /* --- CELEBRATION CONFIRMED SCREEN --- */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center py-4"
                >
                  <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-gold animate-bounce" />
                  </div>

                  <div className="space-y-3">
                    <h2 className="font-serif text-2xl md:text-3xl font-black text-gold tracking-widest uppercase animate-pulse">
                      PRE-ORDER CONFIRMED!
                    </h2>
                    <p className="text-white font-serif text-sm tracking-widest uppercase font-bold">
                      Reservation Received Successfully
                    </p>
                    <div className="bg-gold/10 border border-gold/30 rounded-xl p-3 inline-block">
                      <p className="text-white/80 font-mono text-[11px] leading-relaxed select-all">
                        Our team will call you for confirmation shortly.
                      </p>
                    </div>
                  </div>

                  {/* Digital Premium Banquet Invitation card info */}
                  <div className="bg-black/90 border border-white/10 p-5 rounded-2xl text-left font-mono text-[11px] space-y-2.5 relative">
                    <div className="absolute right-2 top-2 text-[8px] uppercase tracking-widest text-gold font-bold">
                      TICKET {preOrderTicket?.ticketNumber}
                    </div>
                    <div className="border-b border-white/10 pb-2 flex justify-between">
                      <span className="text-white/40 uppercase text-[9px]">Guest name:</span>
                      <strong className="text-white uppercase">{preOrderTicket?.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40 uppercase text-[9px]">Diners count:</span>
                      <span className="text-white/80">{preOrderTicket?.guests} Guests</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-white/40 uppercase text-[9px]">Date & Slot:</span>
                      <span className="text-gold">{preOrderTicket?.date} @ {preOrderTicket?.time} IST</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-2 font-mono">
                      <span className="text-white/40 uppercase text-[9px] block">Dishes Selected:</span>
                      <span className="text-white/90 text-right max-w-[200px] truncate" title={preOrderTicket?.specialRequest}>
                        {selectedDishesForBooking.map(item => `${item.name} (${item.quantity})`).join(', ') || 'No dishes preordered'}
                      </span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <a
                      href={`https://wa.me/917800335000?text=Hello%20Shubham%20Family%20Restaurant,%20I%20have%20just%20secured%20a%20table%20pre-order%20for%20${preOrderForm?.guests}%20guests%20on%20${preOrderForm?.date}%20at%20${preOrderForm?.time}.%20Preorder%20Ticket:%20${preOrderTicket?.ticketNumber}.`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold tracking-wider text-[10px] uppercase rounded-full flex items-center justify-center gap-1 transition-colors"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-black">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.431 2.5 1.157 3.476L6.5 18l2.673-.89c.928.618 2.038.981 3.238.982 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766h.02zm3.43 8.169c-.147.411-.734.75-1.016.792-.257.039-.588.062-1.636-.347-1.127-.439-1.851-1.579-1.907-1.656-.057-.076-.454-.597-.454-1.144s.284-.817.385-.92c.1-.102.218-.128.29-.128.058 0 .117.001.168.006.059.006.136-.021.213.16.082.195.285.698.311.75.026.052.026.111-.009.18-.035.069-.052.111-.103.171-.052.06-.11.135-.157.181-.052.052-.107.108-.046.211.061.103.271.442.582.716.4.354.737.464.84.515.103.051.164.043.224-.026.06-.068.257-.297.325-.399.069-.102.137-.086.231-.051s.599.282.702.333c.103.051.171.076.197.12.026.043.026.248-.121.659z" />
                      </svg>
                      Direct WhatsApp Invoice
                    </a>
                    
                    <button
                      onClick={() => {
                        setIsPreOrderPopupOpen(false);
                        setPreOrderSuccess(false);
                        setSelectedDishesForBooking([]); // Clear cart of selected items
                      }}
                      className="w-full py-2.5 border border-white/10 hover:bg-white/5 text-white/80 font-bold tracking-wider text-[10px] uppercase rounded-full"
                    >
                      Close & Finish
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FLOATING PREMIUM BUTLER ASSIST (WHATSAPP DRIVEN) --- */}
      <a
        href="https://wa.me/917800335000?text=Hello!%20I%20am%20visiting%20your%20website%20and%20would%20love%20to%20inquire%20about%20a%20luxury%20dining%20table%20/%20hotel%20room%20suit%20reservation."
        target="_blank"
        rel="noreferrer"
        className={`fixed z-45 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
          selectedDishesForBooking.length > 0 && !isAdminMode 
            ? 'bottom-24 right-3 md:bottom-28 md:right-4' 
            : 'bottom-3 right-3 md:bottom-4 md:right-4'
        }`}
        title="WhatsApp Assistant Concierge"
      >
        <svg 
          viewBox="0 0 24 24" 
          className="w-4 h-4 md:w-5 md:h-5 fill-white"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.84 0c3.15 0 6.112 1.233 8.339 3.468C22.406 5.703 23.63 8.673 23.627 11.84c-.004 6.517-5.33 11.843-11.843 11.843-2.004-.001-3.978-.515-5.734-1.498L0 24zm4.996-3.882c1.652.981 3.272 1.498 4.998 1.499 5.485 0 9.948-4.469 10.001-9.95.025-2.656-.993-5.153-2.868-7.03C15.31 2.76 12.82 1.745 10.157 1.745c-5.484 0-9.948 4.47-10.001 9.95-.001 1.832.502 3.618 1.448 5.161L.608 22.45l5.808-1.52c-1.12.721-2.012 1.1-2.363 1.189z" />
        </svg>
      </a>

    </div>
  );
}
