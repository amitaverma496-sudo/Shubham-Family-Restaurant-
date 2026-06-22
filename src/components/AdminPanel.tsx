import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, Calendar, NotebookTabs, Image, MailCheck, Trash2, CheckCircle2, 
  XCircle, Filter, Plus, Compass, Sparkles, Check, KeySquare, ShieldCheck,
  Search, Edit, X, MessageSquare, Utensils, LogIn
} from 'lucide-react';
import { Booking, MenuItem, GalleryItem, Inquiry, MenuCategory, UserProfile, ActivityLog } from '../types';
import { motion } from 'motion/react';
import { doc, setDoc, deleteDoc, collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface AdminPanelProps {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  galleryItems: GalleryItem[];
  setGalleryItems: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
  inquiries: Inquiry[];
  setInquiries: React.Dispatch<React.SetStateAction<Inquiry[]>>;
  currentUser: any;
  onSignIn: () => void;
}

type TabType = 'table_bookings' | 'preorders' | 'menu' | 'gallery' | 'inquiries' | 'users' | 'activity_logs';

export default function AdminPanel({
  bookings, setBookings,
  menuItems, setMenuItems,
  galleryItems, setGalleryItems,
  inquiries, setInquiries,
  currentUser, onSignIn
}: AdminPanelProps) {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('table_bookings');
  
  const menuFormRef = useRef<HTMLDivElement>(null);
  
  // States of forms
  const [newDish, setNewDish] = useState({
    name: '', price: '', category: 'Starters' as MenuCategory,
    description: '', isVeg: true, isPopular: false
  });
  const [newGalleryPhoto, setNewGalleryPhoto] = useState({
    title: '', imageUrl: '', category: 'Culinary'
  });
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [deletingDishId, setDeletingDishId] = useState<string | null>(null);

  // Filter state for bookings
  const [bookingFilter, setBookingFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Cancelled'>('All');
  const [preorderFilter, setPreorderFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Cancelled'>('All');

    // Real-time Firestore users & logs states
  const [dbUsers, setDbUsers] = useState<UserProfile[]>([]);
  const [dbActivityLogs, setDbActivityLogs] = useState<ActivityLog[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [logSearchQuery, setLogSearchQuery] = useState('');

  useEffect(() => {
    if (currentUser && currentUser.email === 'amitaverma496@gmail.com') {
      setIsUnlocked(true);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!isUnlocked) return;
    
    // Listen to users collection in Firestore
    const usersQuery = query(collection(db, 'users'), orderBy('lastLoginAt', 'desc'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const fetched: UserProfile[] = [];
      snapshot.forEach(docSnap => {
        fetched.push(docSnap.data() as UserProfile);
      });
      setDbUsers(fetched);
    }, (err) => {
      console.error("Error listening to users:", err);
    });

    // Listen to activity logs collection in Firestore
    const logsQuery = query(collection(db, 'activityLogs'), orderBy('timestamp', 'desc'));
    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      const fetched: ActivityLog[] = [];
      snapshot.forEach(docSnap => {
        fetched.push(docSnap.data() as ActivityLog);
      });
      setDbActivityLogs(fetched);
    }, (err) => {
      console.error("Error listening to activityLogs:", err);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeLogs();
    };
  }, [isUnlocked]);

  // Derived filter states
  const filteredUsers = dbUsers.filter(u => {
    const q = userSearchQuery.toLowerCase();
    return (u.displayName || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || u.uid.includes(q);
  });

  const filteredLogs = dbActivityLogs.filter(l => {
    const q = logSearchQuery.toLowerCase();
    return (l.displayName || '').toLowerCase().includes(q) || (l.email || '').toLowerCase().includes(q) || (l.action || '').toLowerCase().includes(q);
  });

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'lucknow123' || password.trim().toLowerCase() === 'lucknow') {
      setIsUnlocked(true);
      setUnlockError('');
    } else {
      setUnlockError('Incorrect secret passkey. Access Denied.');
    }
  };

  // Booking actions
  const updateBookingStatus = async (id: string, newStatus: 'Confirmed' | 'Cancelled') => {
    const booking = bookings.find(bk => bk.id === id);
    
    // Also write to Firestore in real-time
    if (booking) {
      try {
        await setDoc(doc(db, 'bookings', id), { ...booking, status: newStatus });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `bookings/${id}`);
      }
    }

    setBookings(prev => prev.map(bk => bk.id === id ? { ...bk, status: newStatus } : bk));

    if (booking && newStatus === 'Confirmed') {
      const cleanedPhone = booking.phone.replace(/\D/g, '');
      const validPhone = cleanedPhone.length === 10 ? '91' + cleanedPhone : cleanedPhone;
      
      const message = `*Pre-Order Confirmed! 🌟*\n\nHello *${booking.name}*,\n\nWe are delighted to inform you that your dining pre-order at *Shubham Family Restaurant & Hotel* is now *CONFIRMED*!\n\n*Reservation Details:*\n📅 *Date:* ${booking.date}\n⏰ *Time:* ${booking.time}\n👥 *Guests:* ${booking.guests} Guests\n\nOur team is looking forward to hosting you for an exquisite dining experience. If you need any adjustments, please feel free to reach out to us.\n\nWarm regards,\n*Shubham Family Restaurant & Hotel Team*`;
      
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${validPhone}?text=${encodedMessage}`;
      
      // Automatically navigate to WhatsApp to send the message
      try {
        window.open(whatsappUrl, '_blank');
      } catch (err) {
        console.error("Popup was blocked, fallback redirecting", err);
        window.location.href = whatsappUrl;
      }
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'bookings', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `bookings/${id}`);
    }
    setBookings(prev => prev.filter(bk => bk.id !== id));
  };

  // Menu actions
  const handleAddDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDish.name || !newDish.price) return;

    if (editingDishId) {
      // Update existing item
      setMenuItems(prev => prev.map(item => item.id === editingDishId ? {
        ...item,
        name: newDish.name,
        price: Number(newDish.price),
        category: newDish.category,
        description: newDish.description || 'Award-winning royal recipe cooked with fresh premium local ingredients and rich spices.',
        isVeg: newDish.isVeg,
        isPopular: newDish.isPopular
      } : item));
      setEditingDishId(null);
    } else {
      // Create new item
      const item: MenuItem = {
        id: 'dish-' + Date.now(),
        name: newDish.name,
        price: Number(newDish.price),
        category: newDish.category,
        description: newDish.description || 'Award-winning royal recipe cooked with fresh premium local ingredients and rich spices.',
        isVeg: newDish.isVeg,
        isPopular: newDish.isPopular
      };
      setMenuItems(prev => [item, ...prev]);
    }

    setNewDish({
      name: '', price: '', category: 'Starters', description: '', isVeg: true, isPopular: false
    });
  };

  const handleEditClick = (item: MenuItem) => {
    setEditingDishId(item.id);
    setNewDish({
      name: item.name,
      price: String(item.price),
      category: item.category,
      description: item.description,
      isVeg: item.isVeg,
      isPopular: item.isPopular
    });
    // Scroll smoothly to the edit form card so the user sees it immediately on mobile
    setTimeout(() => {
      menuFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const handleCancelEdit = () => {
    setEditingDishId(null);
    setNewDish({
      name: '', price: '', category: 'Starters', description: '', isVeg: true, isPopular: false
    });
  };

  const handleDeleteDish = (id: string) => {
    if (editingDishId === id) {
      handleCancelEdit();
    }
    setMenuItems(prev => prev.filter(item => item.id !== id));
    if (deletingDishId === id) {
      setDeletingDishId(null);
    }
  };

  // Gallery actions
  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryPhoto.imageUrl) return;
    const photo: GalleryItem = {
      id: 'gal-' + Date.now(),
      title: newGalleryPhoto.title || 'Exclusive Exhibit',
      imageUrl: newGalleryPhoto.imageUrl,
      category: newGalleryPhoto.category
    };
    setGalleryItems(prev => [photo, ...prev]);
    setNewGalleryPhoto({ title: '', imageUrl: '', category: 'Culinary' });
  };

  const handleDeletePhoto = (id: string) => {
    setGalleryItems(prev => prev.filter(item => item.id !== id));
  };

  // Inquiries actions
  const toggleInquiryReplied = async (id: string) => {
    const inquiry = inquiries.find(inq => inq.id === id);
    if (inquiry) {
      const updatedStatus = inquiry.status === 'Unread' ? 'Replied' as const : 'Unread' as const;
      try {
        await setDoc(doc(db, 'inquiries', id), { ...inquiry, status: updatedStatus });
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.WRITE, `inquiries/${id}`);
        } catch (e) {
          console.error("Firestore inquiry status update error:", e);
        }
      }
    }
    setInquiries(prev => prev.map(inq => 
      inq.id === id ? { ...inq, status: inq.status === 'Unread' ? 'Replied' as const : 'Unread' as const } : inq
    ));
  };

  const deleteInquiry = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'inquiries', id));
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `inquiries/${id}`);
      } catch (e) {
        console.error("Firestore inquiry deletion error:", e);
      }
    }
    setInquiries(prev => prev.filter(inq => inq.id !== id));
  };

  // Bookings stats
  const totalInquiries = inquiries.length;
  const pendingInquiries = inquiries.filter(i => i.status === 'Unread').length;
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed').length;

  const tableBookings = bookings.filter(b => b.bookingType === 'table' || !b.bookingType);
  const foodPreorders = bookings.filter(b => b.bookingType === 'preorder');

  const filteredTableBookings = tableBookings.filter(bk => {
    if (bookingFilter === 'All') return true;
    return bk.status === bookingFilter;
  });

  const filteredFoodPreorders = foodPreorders.filter(bk => {
    if (preorderFilter === 'All') return true;
    return bk.status === preorderFilter;
  });

  // Passcode unlock gate block (lucknow / lucknow123)
  if (!isUnlocked) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass p-8 sm:p-10 rounded-3xl border border-gold/20 shadow-[0_0_50px_rgba(212,175,55,0.05)] text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.02] to-transparent pointer-events-none" />
          
          <div className="w-16 h-16 mx-auto rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full border border-gold/10 animate-ping opacity-30" />
            <KeySquare className="w-7 h-7 text-gold" />
          </div>
          
          <h2 className="font-serif text-2xl text-white tracking-widest uppercase mb-2 gold-glow">Executive Suite</h2>
          <p className="text-white/60 text-xs tracking-wider uppercase mb-8 leading-relaxed max-w-xs mx-auto">
            Please enter your BOH secret passkey to access the Shubham Panel.
          </p>

          <form onSubmit={handleUnlock} className="space-y-5 relative z-10">
            <div className="relative">
              <input
                type="password"
                placeholder="Enter Secret Passkey..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-gold/30 rounded-full px-6 py-4 text-xs tracking-widest text-center text-white placeholder-white/30 outline-none transition-all focus:bg-white/[0.08]"
                required
              />
            </div>

            {unlockError && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[11px] text-red-400 font-mono tracking-wider bg-red-500/10 py-2.5 px-4 rounded-xl border border-red-500/10"
              >
                {unlockError}
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-full bg-gold hover:bg-gold/90 text-black text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.15)] cursor-pointer active:scale-98 flex items-center justify-center gap-2 text-center"
            >
              Unlock Terminal
            </button>

            {/* Google Identity SSO Provider */}
            <div className="relative pt-2">
              <div className="flex items-center my-2">
                <div className="flex-1 border-t border-white/5"></div>
                <span className="px-3 text-[9px] text-white/30 uppercase tracking-[0.2em] font-mono">OR</span>
                <div className="flex-1 border-t border-white/5"></div>
              </div>

              {currentUser ? (
                currentUser.email === 'amitaverma496@gmail.com' ? (
                  <button
                    onClick={() => setIsUnlocked(true)}
                    type="button"
                    className="w-full py-3.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Enter with Admin Session
                  </button>
                ) : (
                  <div className="text-center space-y-1 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                    <p className="text-[9px] text-red-400 tracking-wider uppercase font-mono truncate">
                      Signed in: {currentUser.email}
                    </p>
                    <p className="text-[8px] text-white/40 uppercase leading-normal">
                      Access Denied. Use Admin Google ID or enter passkey.
                    </p>
                  </div>
                )
              ) : (
                <button
                  onClick={onSignIn}
                  type="button"
                  className="w-full py-3.5 rounded-full border border-gold/30 bg-gold/10 hover:bg-gold/20 text-gold text-[10px] font-bold tracking-widest uppercase transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.05)]"
                >
                  <LogIn className="w-3.5 h-3.5 text-gold animate-pulse" />
                  Unlock with Google
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      
      {/* Admin Title Banner */}
      <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] tracking-[0.25em] font-mono text-emerald-400 p-1.5 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" /> Executive Access • Admin Active
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-white tracking-widest uppercase">
            SHUBHAM PANEL
          </h1>
          <p className="text-xs text-white/50 tracking-wide font-sans mt-1">
            Active session control for Reservations, Gastronomy Menu, and Lucknowi Guest Queries.
          </p>
        </div>

        {/* Short stats panel */}
        <div className="flex flex-wrap gap-4 justify-center md:justify-end">
          <div className="glass px-4 py-2.5 rounded-xl border border-white/8 min-w-[100px] text-center">
            <span className="text-[9px] uppercase tracking-widest text-white/40 block">Reservations</span>
            <span className="text-lg font-bold font-mono text-gold">{totalBookings}</span>
          </div>
          <div className="glass px-4 py-2.5 rounded-xl border border-white/8 min-w-[100px] text-center">
            <span className="text-[9px] uppercase tracking-widest text-white/40 block">Total Users</span>
            <span className="text-lg font-bold font-mono text-[#EAB308]">{dbUsers.length}</span>
          </div>
          <div className="glass px-4 py-2.5 rounded-xl border border-white/8 min-w-[100px] text-center">
            <span className="text-[9px] uppercase tracking-widest text-white/40 block">Unread Msgs</span>
            <span className="text-lg font-bold font-mono text-teal-400">{pendingInquiries}</span>
          </div>
        </div>
      </div>

      {/* Admin Tab Selectors */}
      <div className="flex overflow-x-auto gap-2 border-b border-white/5 pb-4 mb-8">
        <button
          onClick={() => setActiveTab('table_bookings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 whitespace-nowrap ${
            activeTab === 'table_bookings' ? 'bg-gold text-black' : 'bg-white/5 hover:bg-white/10 text-white/80'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Table Bookings ({tableBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('preorders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 whitespace-nowrap ${
            activeTab === 'preorders' ? 'bg-gold text-black' : 'bg-white/5 hover:bg-white/10 text-white/80'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          Gastronomy Pre-Orders ({foodPreorders.length})
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 whitespace-nowrap ${
            activeTab === 'menu' ? 'bg-gold text-black' : 'bg-white/5 hover:bg-white/10 text-white/80'
          }`}
        >
          <NotebookTabs className="w-3.5 h-3.5" />
          Menu Dishes ({menuItems.length})
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 whitespace-nowrap ${
            activeTab === 'gallery' ? 'bg-gold text-black' : 'bg-white/5 hover:bg-white/10 text-white/80'
          }`}
        >
          <Image className="w-3.5 h-3.5" />
          Gallery Items ({galleryItems.length})
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 whitespace-nowrap ${
            activeTab === 'inquiries' ? 'bg-gold text-black' : 'bg-white/5 hover:bg-white/10 text-white/80'
          }`}
        >
          <MailCheck className="w-3.5 h-3.5" />
          Inquiries ({totalInquiries})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 whitespace-nowrap ${
            activeTab === 'users' ? 'bg-gold text-black' : 'bg-white/5 hover:bg-white/10 text-white/80'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Registered Users ({dbUsers.length})
        </button>

        <button
          onClick={() => setActiveTab('activity_logs')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 whitespace-nowrap ${
            activeTab === 'activity_logs' ? 'bg-gold text-black' : 'bg-white/5 hover:bg-white/10 text-white/80'
          }`}
        >
          <NotebookTabs className="w-3.5 h-3.5" />
          Activity Logs ({dbActivityLogs.length})
        </button>


      </div>

      {/* Tab Panels */}
      <div>

        {/* 1. TABLE BOOKINGS LIST PANEL */}
        {activeTab === 'table_bookings' && (
          <div className="space-y-6">

            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="font-serif text-lg text-gold uppercase tracking-wider">Restaurant Table Bookings</h2>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-white/45" />
                <select
                  value={bookingFilter}
                  onChange={(e: any) => setBookingFilter(e.target.value)}
                  className="bg-lux-secondary text-white/90 border border-white/10 px-3 py-1.5 rounded-lg text-xs tracking-wider outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending Only</option>
                  <option value="Confirmed">Confirmed Only</option>
                  <option value="Cancelled">Cancelled Only</option>
                </select>
              </div>
            </div>

            {filteredTableBookings.length === 0 ? (
              <div className="glass text-center py-12 rounded-2xl border border-white/8">
                <Calendar className="w-8 h-8 text-white/30 mx-auto mb-3" />
                <p className="text-sm text-white/40 tracking-wider uppercase font-mono">No table bookings matched this filter</p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Mobile View */}
                <div className="block md:hidden space-y-4">
                  {filteredTableBookings.map(bk => (
                    <div key={bk.id} className="glass p-4 rounded-2xl border border-white/10 space-y-3.5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.05),transparent_70%)] pointer-events-none" />
                      
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-0.5">
                          <h4 className="font-serif font-extrabold text-[#F3F4F6] text-sm tracking-wider uppercase">{bk.name}</h4>
                          <p className="font-mono text-[10px] text-white/50">{bk.phone}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-bold tracking-widest uppercase shrink-0 ${
                          bk.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          bk.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/25' :
                          'bg-amber-500/15 text-amber-400 border border-amber-500/25 animate-pulse'
                        }`}>
                          {bk.status}
                        </span>
                      </div>

                      {bk.specialRequest && (
                        <div className="bg-black/40 border border-white/5 rounded-xl p-2.5">
                          <span className="text-[8px] uppercase tracking-widest text-gold font-bold block mb-0.5">Special Request:</span>
                          <p className="text-[10px] text-white/80 tracking-wide font-sans italic leading-relaxed">
                            "{bk.specialRequest}"
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-white/5 pt-2 text-white/70">
                        <div className="flex flex-col">
                          <span className="text-[7.5px] font-bold uppercase tracking-wider text-white/40 mb-0.5">Guests Count</span>
                          <span className="font-sans font-extrabold text-gold">{bk.guests} Members</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[7.5px] font-bold uppercase tracking-wider text-white/40 mb-0.5">Scheduled Date</span>
                          <span className="font-sans font-bold text-white/90">{bk.date} @ {bk.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-3 pr-1 gap-2">
                        <div className="flex gap-2">
                          {bk.status !== 'Confirmed' && (
                            <button
                              onClick={() => updateBookingStatus(bk.id, 'Confirmed')}
                              className="px-3.5 py-2.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer active:scale-95 shadow-md flex items-center justify-center"
                            >
                              Accept
                            </button>
                          )}
                          {bk.status === 'Confirmed' && (
                            <button
                              onClick={() => {
                                const cleanedPhone = bk.phone.replace(/\D/g, '');
                                const validPhone = cleanedPhone.length === 10 ? '91' + cleanedPhone : cleanedPhone;
                                const message = `*Table Reservation Confirmed! 🌟*\n\nHello *${bk.name}*,\n\nWe are delighted to inform you that your table reservation at *Shubham Family Restaurant & Hotel* is now *CONFIRMED*!\n\n*Reservation Details:*\n📅 *Date:* ${bk.date}\n⏰ *Time:* ${bk.time}\n👥 *Guests:* ${bk.guests} Guests\n\nOur team is looking forward to hosting you for an exquisite dining experience.\n\nWarm regards,\n*Shubham Family Restaurant & Hotel Team*`;
                                const whatsappUrl = `https://wa.me/${validPhone}?text=${encodeURIComponent(message)}`;
                                window.open(whatsappUrl, '_blank');
                              }}
                              className="px-3 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-[9px] uppercase font-bold tracking-widest transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              WhatsApp
                            </button>
                          )}
                          {bk.status !== 'Cancelled' && (
                            <button
                              onClick={() => updateBookingStatus(bk.id, 'Cancelled')}
                              className="px-3.5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/20 text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer active:scale-95"
                            >
                              Decline
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => deleteBooking(bk.id)}
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete Reservation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10 bg-black/40">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-white/60 tracking-wider uppercase">
                        <th className="p-4">Customer</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4 text-center">Guests Count</th>
                        <th className="p-4">Date & Time</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredTableBookings.map(bk => (
                        <tr key={bk.id} className="hover:bg-white/2 transition-colors">
                          <td className="p-4 font-serif font-extrabold text-white text-sm">
                            {bk.name}
                            {bk.specialRequest && (
                              <span className="block font-sans text-[10px] text-amber-300 italic font-normal mt-1">
                                Req: "{bk.specialRequest}"
                              </span>
                            )}
                          </td>
                          <td className="p-4 font-mono text-white/70">{bk.phone}</td>
                          <td className="p-4 font-mono text-center">
                            <span className="px-2 py-1 bg-white/5 rounded-md font-bold text-gold">{bk.guests} Guests</span>
                          </td>
                          <td className="p-4">
                            <span className="block font-bold">{bk.date}</span>
                            <span className="font-mono text-white/40 text-[10px]">{bk.time} IST</span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase ${
                              bk.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              bk.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                            }`}>
                              {bk.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1.5 animate-fade-in">
                              {bk.status === 'Confirmed' && (
                                <button
                                  onClick={() => {
                                    const cleanedPhone = bk.phone.replace(/\D/g, '');
                                    const validPhone = cleanedPhone.length === 10 ? '91' + cleanedPhone : cleanedPhone;
                                    const message = `*Table Reservation Confirmed! 🌟*\n\nHello *${bk.name}*,\n\nWe are delighted to inform you that your table reservation at *Shubham Family Restaurant & Hotel* is now *CONFIRMED*!\n\n*Reservation Details:*\n📅 *Date:* ${bk.date}\n⏰ *Time:* ${bk.time}\n👥 *Guests:* ${bk.guests} Guests\n\nOur team is looking forward to hosting you for an exquisite dining experience.\n\nWarm regards,\n*Shubham Family Restaurant & Hotel Team*`;
                                    const whatsappUrl = `https://wa.me/${validPhone}?text=${encodeURIComponent(message)}`;
                                    window.open(whatsappUrl, '_blank');
                                  }}
                                  className="p-1 px-2.5 rounded-md bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-[10px] uppercase font-bold transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </button>
                              )}
                              {bk.status !== 'Confirmed' && (
                                <button
                                  onClick={() => updateBookingStatus(bk.id, 'Confirmed')}
                                  className="p-1 px-2.5 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] uppercase font-bold transition-all cursor-pointer"
                                >
                                  Accept
                                </button>
                              )}
                              {bk.status !== 'Cancelled' && (
                                <button
                                  onClick={() => updateBookingStatus(bk.id, 'Cancelled')}
                                  className="p-1 px-2.5 rounded-md bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-[10px] uppercase font-bold transition-all cursor-pointer"
                                >
                                  Decline
                                </button>
                              )}
                              <button
                                onClick={() => deleteBooking(bk.id)}
                                className="p-1 rounded-md text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>
        )}

        {/* 1.5 GASTROMONY PRE-ORDERS LIST PANEL */}
        {activeTab === 'preorders' && (
          <div className="space-y-6">

            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="font-serif text-lg text-gold uppercase tracking-wider">Gastronomy Food Pre-orders</h2>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-white/45" />
                <select
                  value={preorderFilter}
                  onChange={(e: any) => setPreorderFilter(e.target.value)}
                  className="bg-lux-secondary text-white/90 border border-white/10 px-3 py-1.5 rounded-lg text-xs tracking-wider outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending Only</option>
                  <option value="Confirmed">Confirmed Only</option>
                  <option value="Cancelled">Cancelled Only</option>
                </select>
              </div>
            </div>

            {filteredFoodPreorders.length === 0 ? (
              <div className="glass text-center py-12 rounded-2xl border border-white/8">
                <Utensils className="w-8 h-8 text-white/30 mx-auto mb-3" />
                <p className="text-sm text-white/40 tracking-wider uppercase font-mono">No food pre-orders matched this filter</p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Mobile View */}
                <div className="block md:hidden space-y-4">
                  {filteredFoodPreorders.map(bk => (
                    <div key={bk.id} className="glass p-4 rounded-2xl border border-white/10 space-y-3.5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.05),transparent_70%)] pointer-events-none" />
                      
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-0.5">
                          <h4 className="font-serif font-extrabold text-[#F3F4F6] text-sm tracking-wider uppercase">{bk.name}</h4>
                          <p className="font-mono text-[10px] text-white/50">{bk.phone}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-bold tracking-widest uppercase shrink-0 ${
                          bk.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          bk.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/25' :
                          'bg-amber-500/15 text-amber-400 border border-amber-500/25 animate-pulse'
                        }`}>
                          {bk.status}
                        </span>
                      </div>

                      <div className="bg-gold/10 border border-gold/20 rounded-xl p-3 space-y-1">
                        <span className="text-[8px] uppercase tracking-widest text-gold font-black block">Pre-ordered Gastronomy:</span>
                        <p className="text-xs font-semibold text-white/95 leading-relaxed font-mono">
                          {bk.preorderDishes || 'Exquisite Cuisines (Custom preorder)'}
                        </p>
                      </div>

                      {bk.specialRequest && (
                        <div className="bg-black/40 border border-white/5 rounded-xl p-2.5">
                          <span className="text-[8px] uppercase tracking-widest text-white/50 font-bold block mb-0.5">Customer Comment / Request:</span>
                          <p className="text-[10px] text-white/80 tracking-wide font-sans italic leading-relaxed">
                            "{bk.specialRequest}"
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-white/5 pt-2 text-white/70">
                        <div className="flex flex-col">
                          <span className="text-[7.5px] font-bold uppercase tracking-wider text-white/40 mb-0.5">Guests Count</span>
                          <span className="font-sans font-extrabold text-gold">{bk.guests} Members</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[7.5px] font-bold uppercase tracking-wider text-white/40 mb-0.5">Scheduled Date</span>
                          <span className="font-sans font-bold text-white/90">{bk.date} @ {bk.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-3 pr-1 gap-2">
                        <div className="flex gap-2">
                          {bk.status !== 'Confirmed' && (
                            <button
                              onClick={() => updateBookingStatus(bk.id, 'Confirmed')}
                              className="px-3.5 py-2.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer active:scale-95 shadow-md flex items-center justify-center"
                            >
                              Accept
                            </button>
                          )}
                          {bk.status === 'Confirmed' && (
                            <button
                              onClick={() => {
                                const cleanedPhone = bk.phone.replace(/\D/g, '');
                                const validPhone = cleanedPhone.length === 10 ? '91' + cleanedPhone : cleanedPhone;
                                const message = `*Gastronomy Pre-Order Confirmed! 🌟*\n\nHello *${bk.name}*,\n\nWe are delighted to inform you that your Lucknowi family food pre-order is now *CONFIRMED*!\n\n*Preordered Dishes:*\n🍽️ ${bk.preorderDishes || 'Exquisite Royal Cuisines'}\n\n*Reservation Slot:*\n📅 *Date:* ${bk.date}\n⏰ *Time:* ${bk.time}\n👥 *Guests:* ${bk.guests} Guests\n\nOur kitchen has started preparing details for your select menu. Looking forward to hosting you soon.\n\nWarm regards,\n*Shubham Family Restaurant & Hotel Team*`;
                                const whatsappUrl = `https://wa.me/${validPhone}?text=${encodeURIComponent(message)}`;
                                window.open(whatsappUrl, '_blank');
                              }}
                              className="px-3 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-[9px] uppercase font-bold tracking-widest transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              WhatsApp
                            </button>
                          )}
                          {bk.status !== 'Cancelled' && (
                            <button
                              onClick={() => updateBookingStatus(bk.id, 'Cancelled')}
                              className="px-3.5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/20 text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer active:scale-95"
                            >
                              Decline
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => deleteBooking(bk.id)}
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10 bg-black/40">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-white/60 tracking-wider uppercase">
                        <th className="p-4">Customer</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Pre-ordered Gastronomy Dishes</th>
                        <th className="p-4 text-center">Diners Count</th>
                        <th className="p-4">Date & Slot</th>
                        <th className="p-5 text-center">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredFoodPreorders.map(bk => (
                        <tr key={bk.id} className="hover:bg-white/2 transition-colors">
                          <td className="p-4 font-serif font-extrabold text-white text-sm">
                            {bk.name}
                            {bk.specialRequest && (
                              <span className="block font-sans text-[10px] text-white/40 italic font-normal mt-1">
                                Comment: "{bk.specialRequest}"
                              </span>
                            )}
                          </td>
                          <td className="p-4 font-mono text-white/70">{bk.phone}</td>
                          <td className="p-4 max-w-xs">
                            <span className="px-2.5 py-1.5 bg-gold/15 rounded-lg font-mono text-xs font-semibold text-gold leading-normal block border border-gold/10">
                              {bk.preorderDishes || 'Exquisite Cuisines (Custom preorder)'}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-center">
                            <span className="px-2 py-1 bg-white/5 rounded-md font-bold text-white/90">{bk.guests} Diners</span>
                          </td>
                          <td className="p-4">
                            <span className="block font-bold">{bk.date}</span>
                            <span className="font-mono text-white/40 text-[10px]">{bk.time} IST</span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold tracking-widest uppercase shrink-0 ${
                              bk.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              bk.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                            }`}>
                              {bk.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1.5 animate-fade-in">
                              {bk.status === 'Confirmed' && (
                                <button
                                  onClick={() => {
                                    const cleanedPhone = bk.phone.replace(/\D/g, '');
                                    const validPhone = cleanedPhone.length === 10 ? '91' + cleanedPhone : cleanedPhone;
                                    const message = `*Gastronomy Pre-Order Confirmed! 🌟*\n\nHello *${bk.name}*,\n\nWe are delighted to inform you that your Lucknowi family food pre-order is now *CONFIRMED*!\n\n*Preordered Dishes:*\n🍽️ ${bk.preorderDishes || 'Exquisite Royal Cuisines'}\n\n*Reservation Slot:*\n📅 *Date:* ${bk.date}\n⏰ *Time:* ${bk.time}\n👥 *Guests:* ${bk.guests} Guests\n\nOur kitchen has started preparing details for your select menu. Looking forward to hosting you soon.\n\nWarm regards,\n*Shubham Family Restaurant & Hotel Team*`;
                                    const whatsappUrl = `https://wa.me/${validPhone}?text=${encodeURIComponent(message)}`;
                                    window.open(whatsappUrl, '_blank');
                                  }}
                                  className="p-1 px-2.5 rounded-md bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-[10px] uppercase font-bold transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </button>
                              )}
                              {bk.status !== 'Confirmed' && (
                                <button
                                  onClick={() => updateBookingStatus(bk.id, 'Confirmed')}
                                  className="p-1 px-2.5 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] uppercase font-bold transition-all cursor-pointer"
                                >
                                  Accept
                                </button>
                              )}
                              {bk.status !== 'Cancelled' && (
                                <button
                                  onClick={() => updateBookingStatus(bk.id, 'Cancelled')}
                                  className="p-1 px-2.5 rounded-md bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-[10px] uppercase font-bold transition-all cursor-pointer"
                                >
                                  Decline
                                </button>
                              )}
                              <button
                                onClick={() => deleteBooking(bk.id)}
                                className="p-1 rounded-md text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>
        )}

        {/* 2. MENU DISHES MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Box form */}
            <div 
              ref={menuFormRef} 
              className={`glass p-6 rounded-2xl border h-fit space-y-4 transition-all duration-300 ${
                editingDishId 
                  ? 'border-gold shadow-[0_0_25px_rgba(212,175,55,0.15)] bg-gold/5' 
                  : 'border-white/10'
              }`}
            >
              <h2 className="font-serif text-lg text-gold uppercase tracking-wider mb-2 flex items-center gap-2">
                {editingDishId ? (
                  <>
                    <Edit className="w-5 h-5 text-gold" /> Edit Dish
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-gold" /> Create New Dish
                  </>
                )}
              </h2>
              
              <form onSubmit={handleAddDish} className="space-y-4 text-xs">
                <div>
                  <label className="block text-white/60 uppercase tracking-widest text-[9px] mb-1.5">Dish Name*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tandoori Paneer Malai Momos"
                    value={newDish.name}
                    onChange={(e) => setNewDish(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-black/60 border border-white/12 text-white px-4 py-2.5 rounded-xl outline-none focus:border-gold transition-colors placeholder:text-white/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 uppercase tracking-widest text-[9px] mb-1.5">Price (INR)*</label>
                    <input
                      type="number"
                      required
                      placeholder="425"
                      value={newDish.price}
                      onChange={(e) => setNewDish(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full bg-black/60 border border-white/12 text-white px-4 py-2.5 rounded-xl outline-none focus:border-gold transition-colors placeholder:text-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 uppercase tracking-widest text-[9px] mb-1.5">Category</label>
                    <select
                      value={newDish.category}
                      onChange={(e: any) => setNewDish(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-black/60 border border-white/12 text-white px-3 py-2.5 rounded-xl outline-none focus:border-gold transition-colors"
                    >
                      <option value="Starters">Starters</option>
                      <option value="Main Course">Main Course</option>
                      <option value="Chinese">Chinese</option>
                      <option value="South Indian">South Indian</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Beverages">Beverages</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white/60 uppercase tracking-widest text-[9px] mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Short description of taste and plating layout"
                    value={newDish.description}
                    onChange={(e) => setNewDish(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-black/60 border border-white/12 text-white px-4 py-2.5 rounded-xl outline-none focus:border-gold transition-colors placeholder:text-white/20 resize-none"
                  />
                </div>

                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-white/85">
                    <input
                      type="checkbox"
                      checked={newDish.isVeg}
                      onChange={(e) => setNewDish(prev => ({ ...prev, isVeg: e.target.checked }))}
                      className="accent-emerald-500 w-4 h-4"
                    />
                    Green Veg Tag
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-white/85">
                    <input
                      type="checkbox"
                      checked={newDish.isPopular}
                      onChange={(e) => setNewDish(prev => ({ ...prev, isPopular: e.target.checked }))}
                      className="accent-gold w-4 h-4"
                    />
                    Sardar Popular Star ⭐
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gold text-black text-[11px] font-bold tracking-widest uppercase hover:bg-gold/90 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {editingDishId ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Save Changes
                      </>
                    ) : (
                      'Publish to Menu'
                    )}
                  </button>
                  {editingDishId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-bold tracking-widest uppercase hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Right list table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/30 p-3.5 rounded-2xl border border-white/5">
                <div>
                  <h2 className="font-serif text-base text-gold uppercase tracking-wider mb-0.5">Active Gastronomy Collection</h2>
                  <p className="text-[9px] text-white/50 tracking-wider font-mono">
                    {menuItems.length} items registered on live public menu
                  </p>
                </div>
                
                {/* Search / Filter Input */}
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/40">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search dish to delete..."
                    value={menuSearchQuery}
                    onChange={(e) => setMenuSearchQuery(e.target.value)}
                    className="w-full bg-black/60 border border-white/12 text-white pl-9 pr-4 py-2 rounded-xl text-xs outline-none focus:border-gold transition-colors placeholder:text-white/20 font-mono"
                  />
                  {menuSearchQuery && (
                    <button 
                      onClick={() => setMenuSearchQuery('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/40 hover:text-white text-xs font-mono"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-y-auto max-h-[500px] border border-white/10 rounded-2xl bg-black/20 divide-y divide-white/5 font-sans">
                {menuItems
                  .filter(item => 
                    item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                    item.category.toLowerCase().includes(menuSearchQuery.toLowerCase())
                  )
                  .map(item => (
                    <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/2 transition-colors">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {item.isVeg ? (
                            <span className="w-3.5 h-3.5 border border-emerald-500/80 flex items-center justify-center p-0.5 rounded-sm shrink-0">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                            </span>
                          ) : (
                            <span className="w-3.5 h-3.5 border border-red-500/80 flex items-center justify-center p-0.5 rounded-sm shrink-0">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block" />
                            </span>
                          )}
                          <span className="font-serif font-extrabold text-sm text-white tracking-wide">{item.name}</span>
                          <span className="text-[8px] px-2 py-0.5 rounded-md bg-white/5 text-white/50 border border-white/5 uppercase tracking-wider font-mono font-bold">
                            {item.category}
                          </span>
                          {item.isPopular && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-gold/10 text-gold border border-gold/20 font-bold tracking-widest uppercase">
                              ★ Star
                            </span>
                          )}
                        </div>
                        <p className="text-white/60 text-[10.5px] leading-relaxed">{item.description}</p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0 shrink-0">
                        <span className="font-mono text-gold font-bold text-sm">₹{item.price}</span>
                        
                        <div className="flex items-center gap-2">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditClick(item)}
                            className={`px-3 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 min-h-[38px] ${
                              editingDishId === item.id 
                                ? 'bg-gold text-black border border-transparent font-black' 
                                : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-gold/30'
                            }`}
                            title="Edit Dish"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {/* Red, Mobile-Friendly, High-Contrast Delete Option Button */}
                          {deletingDishId === item.id ? (
                            <div className="flex items-center gap-1.5 bg-red-950/20 p-1 rounded-xl border border-red-500/30">
                              <button
                                onClick={() => handleDeleteDish(item.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[9px] uppercase font-black tracking-widest cursor-pointer flex items-center gap-1 transition-all"
                                title="Confirm Permanent Deletion"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Yes, Delete</span>
                              </button>
                              <button
                                onClick={() => setDeletingDishId(null)}
                                className="px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-[9px] uppercase font-bold tracking-widest cursor-pointer transition-all"
                                title="Cancel Deletion"
                              >
                                <span>No</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingDishId(item.id)}
                              className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black border border-red-500/20 hover:border-transparent text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 min-h-[38px]"
                              title="Delete Dish"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                }

                {menuItems.filter(item => 
                  item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                  item.category.toLowerCase().includes(menuSearchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="p-12 text-center text-white/30 space-y-2">
                    <p className="text-sm font-mono tracking-wider uppercase">No matching active gastronomy dishes found</p>
                    <button 
                      onClick={() => setMenuSearchQuery('')}
                      className="text-gold text-xs underline uppercase tracking-widest"
                    >
                      Reset Filter Search Query
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. GALLERY MANAGEMENT */}
        {activeTab === 'gallery' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="glass p-6 rounded-2xl border border-white/10 h-fit space-y-4 text-xs">
              <h2 className="font-serif text-lg text-gold uppercase tracking-wider mb-2 flex items-center gap-2">
                <Plus className="w-5 h-5 text-gold" /> Add Gallery Photo
              </h2>

              <form onSubmit={handleAddPhoto} className="space-y-4">
                <div>
                  <label className="block text-white/60 uppercase tracking-widest text-[9px] mb-1.5 font-semibold">Photo Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Awadhi Saffron Royal Dessert"
                    value={newGalleryPhoto.title}
                    onChange={(e) => setNewGalleryPhoto(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-black/60 border border-white/12 text-white px-4 py-2.5 rounded-xl outline-none focus:border-gold transition-colors placeholder:text-white/20"
                  />
                </div>

                <div>
                  <label className="block text-white/60 uppercase tracking-widest text-[9px] mb-1.5 font-semibold">Image URL*</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={newGalleryPhoto.imageUrl}
                    onChange={(e) => setNewGalleryPhoto(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full bg-black/60 border border-white/12 text-white px-4 py-2.5 rounded-xl outline-none focus:border-gold transition-colors placeholder:text-white/20 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-white/60 uppercase tracking-widest text-[9px] mb-1.5 font-semibold">Location / Category Tag</label>
                  <select
                    value={newGalleryPhoto.category}
                    onChange={(e) => setNewGalleryPhoto(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-black/60 border border-white/12 text-white px-3 py-2.5 rounded-xl outline-none focus:border-gold"
                  >
                    <option value="Culinary">Culinary Treats</option>
                    <option value="Restaurant">Fine Dining Hall</option>
                    <option value="Hotel">Luxury Stay Hotel Room</option>
                  </select>
                </div>

                <div className="p-3 bg-white/2 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-amber-300 block uppercase tracking-wider font-semibold">💡 Custom Image Tips:</span>
                  <span className="text-[9px] text-white/50 block">You can paste any direct Unsplash or food photo link. Leave Title blank, and it defaults to "Exclusive Exhibit".</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gold text-black text-[11px] font-bold tracking-widest uppercase hover:bg-gold/90 transition-all cursor-pointer"
                >
                  Insert Photo Frame
                </button>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-serif text-lg text-gold uppercase tracking-wider">Bespoke Mosaic Grid Exhibits</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-[500px] p-1">
                {galleryItems.map(photo => {
                  // Resolve custom generated image placeholders safely
                  let src = photo.imageUrl;
                  if (src === 'INTERIOR_PLACEHOLDER') src = '/src/assets/images/shubham_interior_1781759760975.jpg';
                  if (src === 'DISH_PLACEHOLDER') src = '/src/assets/images/shubham_dish_1781759777106.jpg';

                  return (
                    <div key={photo.id} className="glass rounded-xl overflow-hidden border border-white/8 relative group aspect-square">
                      <img
                        src={src}
                        alt={photo.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                        <span className="text-[10px] text-gold uppercase font-mono tracking-widest block font-bold">{photo.category}</span>
                        <p className="text-xs text-white uppercase font-serif tracking-wider font-extrabold line-clamp-2">{photo.title}</p>
                        
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/20 hover:bg-red-500/80 text-white transition-all text-xs"
                          title="Remove Photograph"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 4. INQUIRIES & CONTACT MESSAGES */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <h2 className="font-serif text-lg text-gold uppercase tracking-wider">Guest & Client Messages</h2>
            
            {inquiries.length === 0 ? (
              <div className="glass text-center py-12 rounded-2xl border border-white/8">
                <MailCheck className="w-8 h-8 text-white/30 mx-auto mb-3" />
                <p className="text-sm text-white/40 tracking-wider uppercase font-mono">No incoming requests or inquiries yet</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto p-1">
                {inquiries.map(inq => (
                  <div 
                    key={inq.id} 
                    className={`glass p-5 rounded-2xl border transition-all duration-300 ${
                      inq.status === 'Unread' ? 'border-amber-500/30 bg-white/4' : 'border-white/5 opacity-70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-white/5 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-sm font-extrabold text-white">{inq.name}</span>
                          {inq.status === 'Unread' && (
                            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-300 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-sm">
                              Unread
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-white/45 text-[10px] block mt-0.5">Phone: {inq.phone}</span>
                      </div>

                      <div className="text-[10px] font-mono text-white/40">
                        {new Date(inq.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <p className="text-xs text-white/80 tracking-wider leading-relaxed mb-4 whitespace-pre-wrap italic font-sans dark-gothic p-3 bg-black/40 rounded-xl">
                      "{inq.message}"
                    </p>

                    <div className="flex items-center justify-end gap-2 text-xs">
                      <button
                        onClick={() => toggleInquiryReplied(inq.id)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase transition-all duration-300 ${
                          inq.status === 'Replied'
                            ? 'bg-white/10 text-white/60 hover:bg-white/15'
                            : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20'
                        }`}
                      >
                        {inq.status === 'Replied' ? 'Mark Unread' : 'Mark Reviewed'}
                      </button>
                      <button
                        onClick={() => deleteInquiry(inq.id)}
                        className="p-1 px-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors py-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. REGISTERED USERS LIST PANEL */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="font-serif text-lg text-gold uppercase tracking-wider">Registered Officers & Guests</h2>
                <p className="text-white/40 text-[10px] tracking-wider uppercase font-mono mt-0.5">
                  Total Accounts Registered: {dbUsers.length} • Real-Time Cloud Base
                </p>
              </div>

              {/* Search user */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search user profiles..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="bg-lux-secondary text-white/90 border border-white/10 px-9 py-2 rounded-lg text-xs placeholder:text-white/30 outline-none w-64 focus:border-gold transition-colors duration-250 font-sans"
                />
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="glass text-center py-12 rounded-2xl border border-white/8">
                <Users className="w-8 h-8 text-white/30 mx-auto mb-3" />
                <p className="text-sm text-white/40 tracking-wider uppercase font-mono">No registered users matched your query</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Desktop Users Table */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10 bg-black/40">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-white/60 tracking-wider uppercase">
                        <th className="p-4">Officer/User</th>
                        <th className="p-4">Email Address</th>
                        <th className="p-4">Google UID</th>
                        <th className="p-4">Account Created</th>
                        <th className="p-4">Last Activity</th>
                        <th className="p-4 text-center">Provider</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/80">
                      {filteredUsers.map(u => (
                        <tr key={u.uid} className="hover:bg-white/2 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            {u.photoURL ? (
                              <img 
                                src={u.photoURL} 
                                alt={u.displayName} 
                                className="w-7 h-7 rounded-full border border-gold/30 object-cover" 
                                referrerPolicy="no-referrer" 
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center text-[10px] text-gold font-bold">
                                {u.displayName ? u.displayName.charAt(0) : 'U'}
                              </div>
                            )}
                            <div>
                              <span className="font-serif font-extrabold text-white text-sm block">
                                {u.displayName || 'Anonymous Guest'}
                              </span>
                              {u.email === 'amitaverma496@gmail.com' && (
                                <span className="text-[8px] bg-gold/20 text-gold border border-gold/30 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest mt-0.5 inline-block">
                                  Owner/Admin
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 font-mono text-white/70">{u.email}</td>
                          <td className="p-4 font-mono text-[10px] text-white/50">{u.uid}</td>
                          <td className="p-4 font-sans text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            <span className="block text-[9px] font-mono text-white/40">
                              {new Date(u.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="p-4 font-sans text-[11px] text-gold">
                            {new Date(u.lastLoginAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            <span className="block text-[9px] font-mono text-white/40">
                              {new Date(u.lastLoginAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="p-4 text-center font-mono text-[10px]">
                            <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-bold uppercase tracking-wider text-[8px]">
                              {u.provider || 'Google'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile List View */}
                <div className="block md:hidden space-y-4">
                  {filteredUsers.map(u => (
                    <div key={u.uid} className="glass p-4 rounded-2xl border border-white/10 space-y-3 relative overflow-hidden">
                      <div className="flex items-center gap-3">
                        {u.photoURL ? (
                          <img 
                            src={u.photoURL} 
                            alt={u.displayName} 
                            className="w-9 h-9 rounded-full border border-gold/30 object-cover" 
                            referrerPolicy="no-referrer" 
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-xs text-gold font-bold">
                            {u.displayName ? u.displayName.charAt(0) : 'U'}
                          </div>
                        )}
                        <div>
                          <div className="font-serif font-extrabold text-white text-sm">
                            {u.displayName || 'Anonymous Guest'}
                          </div>
                          <div className="text-[10px] text-white/50 font-mono">{u.email}</div>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-2 text-[10px] font-mono space-y-1 text-white/70">
                        <div className="flex justify-between">
                          <span className="text-white/40 uppercase text-[8px] tracking-wider">UID:</span>
                          <span className="truncate max-w-[150px]">{u.uid}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40 uppercase text-[8px] tracking-wider">Created:</span>
                          <span>{new Date(u.createdAt).toLocaleDateString()} @ {new Date(u.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gold/60 uppercase text-[8px] tracking-wider">Last Activity:</span>
                          <span className="text-gold">{new Date(u.lastLoginAt).toLocaleDateString()} @ {new Date(u.lastLoginAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/40 uppercase text-[8px] tracking-wider">Provider:</span>
                          <span className="text-[8px] px-2 py-0.2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-bold uppercase tracking-wider">
                            {u.provider || 'Google'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. SYSTEM OPERATIONS & ACTIVITY LOGS PANEL */}
        {activeTab === 'activity_logs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="font-serif text-lg text-gold uppercase tracking-wider">Back-of-House System Audit Trails</h2>
                <p className="text-white/40 text-[10px] tracking-wider uppercase font-mono mt-0.5">
                  Total Captured Activities: {dbActivityLogs.length} • Real-Time Session Audit
                </p>
              </div>

              {/* Search log query */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-white/40" />
                <input
                  type="text"
                  placeholder="Filter logs by keyword..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="bg-lux-secondary text-white/90 border border-white/10 px-9 py-2 rounded-lg text-xs placeholder:text-white/30 outline-none w-64 focus:border-gold transition-colors duration-250 font-sans"
                />
              </div>
            </div>

            {filteredLogs.length === 0 ? (
              <div className="glass text-center py-12 rounded-2xl border border-white/8">
                <NotebookTabs className="w-8 h-8 text-white/30 mx-auto mb-3" />
                <p className="text-sm text-white/40 tracking-wider uppercase font-mono">No matching system activity logs found</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-white/60 tracking-wider uppercase">
                      <th className="p-4">Action Taken</th>
                      <th className="p-4">User Name</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">UID / Actor</th>
                      <th className="p-4">Logged At (Timestamp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-[11px] text-white/85">
                    {filteredLogs.map(l => (
                      <tr key={l.id} className="hover:bg-white/2 transition-colors">
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded border text-[10px] font-bold ${
                            l.action.includes('Logged In') ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' :
                            l.action.includes('Booking') || l.action.includes('Pre-order') ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                            l.action.includes('Inquiry') ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' :
                            'bg-stone-500/10 text-stone-300 border-stone-500/20'
                          }`}>
                            {l.action}
                          </span>
                        </td>
                        <td className="p-4 font-sans font-bold text-white/95">{l.displayName}</td>
                        <td className="p-4 text-white/70">{l.email}</td>
                        <td className="p-4 text-white/40 text-[10px]">{l.uid}</td>
                        <td className="p-4 font-sans text-white/70">
                          {new Date(l.timestamp).toLocaleDateString()} @ {new Date(l.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
