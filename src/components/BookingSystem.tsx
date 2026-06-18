import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Sparkles, BookOpen, Smile, FileCheck, X, AlertTriangle, Search, History, Smartphone, Check, MessageSquare, Utensils, ShieldCheck } from 'lucide-react';
import { Booking } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface BookingSystemProps {
  onAddBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => void;
  selectedDishes: string[];
  bookings?: Booking[];
}

export default function BookingSystem({ onAddBooking, selectedDishes, bookings = [] }: BookingSystemProps) {
  const [activeTab, setActiveTab] = useState<'reserve' | 'history'>('reserve');
  const [historyQuery, setHistoryQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    guests: 2,
    date: '',
    time: '19:30',
    specialRequest: ''
  });
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<any>(null);
  const [showCustomGuestInput, setShowCustomGuestInput] = useState(false);
  const [showCustomTimeInput, setShowCustomTimeInput] = useState(false);
  const [customTimeVal, setCustomTimeVal] = useState('7:30 PM');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successInfoMessage, setSuccessInfoMessage] = useState<string | null>(null);

  // Check URL query parameters for dynamic ticket lookup & auto-confirm invitation mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ticketParam = params.get('ticket') || params.get('lookup') || params.get('confirm');
    if (ticketParam) {
      setHistoryQuery(ticketParam);
      setHasSearched(true);
      setActiveTab('history');
      
      const section = document.getElementById('reservations');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  // Auto populate special requests if pre-ordered dishes exist
  useEffect(() => {
    if (selectedDishes.length > 0) {
      setFormData(prev => ({
        ...prev,
        specialRequest: `Pre-ordered Culinary Delicacies: ${selectedDishes.join(', ')}`
      }));
    }
  }, [selectedDishes]);

  // Quick guest size picker
  const guestSizes = [1, 2, 4, 6, 8, 10];

  // Quick dinner timings
  const timeslots = ['12:30', '14:00', '18:00', '19:30', '21:00', '22:30'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.name || !formData.phone || !formData.date) {
      setValidationError("All required fields marked with * must be filled to complete the table reservation!");
      return;
    }

    // Phone validation
    const cleanedPhone = formData.phone.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      setValidationError("Please enter a valid 10-digit mobile number so we can register your reservation card and notify you over WhatsApp!");
      return;
    }

    const finalTime = showCustomTimeInput ? customTimeVal : formData.time;

    // AM/PM check for custom time
    if (showCustomTimeInput) {
      const parsedTime = finalTime.toLowerCase();
      if (!parsedTime.includes('am') && !parsedTime.includes('pm')) {
        setValidationError("Please enter a valid time specifying 'AM' or 'PM' explicitly! For example, enter '1:30 PM' or '9:15 PM'. This ensures our banqueting team sets your table at the correct hour.");
        return;
      }
    }

    onAddBooking({
      name: formData.name,
      phone: cleanedPhone,
      guests: formData.guests,
      date: formData.date,
      time: finalTime,
      specialRequest: formData.specialRequest
    });

    const ticketNumber = 'SHUBHAM-' + Math.floor(1000 + Math.random() * 9000);
    setCreatedTicket({
      ticketNumber,
      name: formData.name,
      phone: cleanedPhone,
      guests: formData.guests,
      date: formData.date,
      time: finalTime,
      specialRequest: formData.specialRequest
    });

    setIsSuccess(true);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      guests: 2,
      date: '',
      time: '19:30',
      specialRequest: ''
    });
    setShowCustomTimeInput(false);
    setCustomTimeVal('7:30 PM');
    setValidationError(null);
    setIsSuccess(false);
    setCreatedTicket(null);
  };

  const handleConfirmPreorderPublicly = async (booking: Booking) => {
    try {
      const updated: Booking = {
        ...booking,
        status: 'Confirmed'
      };
      await setDoc(doc(db, 'bookings', booking.id), updated);
      setSuccessInfoMessage(`Excellent choice! Royal Pre-order ticket ${booking.id} has been authenticated & confirmed in real-time. Kitchen & Admin notified!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `bookings/${booking.id}`);
    }
  };

  // Filter bookings for history lookup based on the query input
  const filteredBookings = bookings.filter(b => {
    const term = historyQuery.toLowerCase().trim();
    if (!term) return false;
    const cleanedBPhone = b.phone.replace(/\D/g, '');
    const cleanedTerm = term.replace(/\D/g, '');
    return (
      (cleanedTerm && cleanedBPhone.includes(cleanedTerm)) ||
      b.id.toLowerCase().includes(term) ||
      b.name.toLowerCase().includes(term) ||
      (b.specialRequest && b.specialRequest.toLowerCase().includes(term))
    );
  });

  return (
    <section id="booking" className="py-24 border-t border-white/5 relative bg-lux-black">
      
      {/* Decorative ambient gold shine */}
      <div className="absolute inset-0 bg-radial-gradient from-gold/5 via-transparent to-transparent opacity-5" />

      <div className="max-w-4xl mx-auto px-4 z-10 relative">
        
        {/* Section header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/30 rounded-full text-[10px] tracking-[0.3em] font-mono text-gold uppercase">
            <BookOpen className="w-3.5 h-3.5" /> Bespoke Grand Dining Tables
          </div>
          <h2 className="font-serif text-3xl md:text-5xl tracking-widest uppercase">
            <span className="text-3d-white">RESERVE A </span>
            <span className="text-3d-gold">TABLE</span>
          </h2>
          <p className="max-w-lg mx-auto text-white/50 text-[11px] tracking-widest uppercase leading-relaxed">
            Secure your preferred banquet seat or romantic corner table. Experience majestic service alongside Agra Expressway.
          </p>
        </div>

        {/* Reservation vs History Tabs */}
        <div className="flex justify-center gap-1.5 mb-8 max-w-xs mx-auto bg-lux-card p-1 rounded-full border border-lux-border relative z-20">
          <button
            type="button"
            onClick={() => {
              setActiveTab('reserve');
            }}
            className={`flex-1 py-1.5 rounded-full font-serif text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'reserve'
                ? 'bg-gold text-black shadow-md font-extrabold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Book Table
          </button>
          
          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
            }}
            className={`flex-1 py-1.5 rounded-full font-serif text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-gold text-black shadow-md font-extrabold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-3.5 h-3.5" /> History Lookup
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'reserve' ? (
            !isSuccess ? (
              <motion.div
                key="booking-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-lux-card p-8 rounded-3xl border border-lux-border gold-box-glow"
            >
              <form onSubmit={handleSubmit} className="space-y-6 text-xs text-left">
                
                {/* Name & Phone in Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-white/70 uppercase tracking-widest text-[9px] font-semibold">Your Full Name*</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Aditya Lucknow"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-black/50 border border-white/12 text-white px-5 py-3 rounded-full outline-none focus:border-gold transition-colors placeholder:text-white/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-white/70 uppercase tracking-widest text-[9px] font-semibold">Mobile Phone Number*</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 7800335000"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-black/50 border border-white/12 text-white px-5 py-3 rounded-full outline-none focus:border-gold transition-colors placeholder:text-white/20 font-mono"
                    />
                  </div>
                </div>

                {/* Guest Counts Selection */}
                <div className="space-y-2">
                  <label className="block text-white/70 uppercase tracking-widest text-[9px] font-semibold">
                    Number of Diners / Guests: <span className="text-gold font-bold">{formData.guests} persons</span>
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {guestSizes.map(size => (
                      <button
                        type="button"
                        key={size}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, guests: size }));
                          setShowCustomGuestInput(false);
                        }}
                        className={`px-4 py-2 rounded-full font-mono text-xs font-bold transition-all duration-300 ${
                          formData.guests === size && !showCustomGuestInput
                            ? 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                            : 'bg-white/5 text-white/80 border border-white/6 hover:bg-white/10'
                        }`}
                      >
                        {size} {size === 1 ? 'Guest' : 'Guests'}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const nextCustomState = !showCustomGuestInput;
                        setShowCustomGuestInput(nextCustomState);
                        if (nextCustomState) {
                          if (guestSizes.includes(formData.guests)) {
                            setFormData(prev => ({ ...prev, guests: 12 }));
                          }
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-[11px] uppercase tracking-wider font-semibold transition-all ${
                        showCustomGuestInput || !guestSizes.includes(formData.guests)
                          ? 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                          : 'bg-white/5 text-gold border border-gold/20 hover:bg-white/10'
                      }`}
                    >
                      {(!guestSizes.includes(formData.guests)) ? `+ Custom (${formData.guests})` : '+ Custom Count'}
                    </button>
                  </div>

                  {/* Beautiful custom guest counter with elegant animations */}
                  <AnimatePresence>
                    {(showCustomGuestInput || !guestSizes.includes(formData.guests)) && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between mt-3 overflow-hidden"
                      >
                        <div>
                          <span className="text-white text-xs font-bold block">Enter Custom Count</span>
                          <span className="text-white/40 text-[9px] block">For larger banquets or personalized requests</span>
                        </div>
                        <div className="flex items-center gap-3 bg-black/40 border border-white/10 p-1.5 rounded-full">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, guests: Math.max(1, prev.guests - 1) }))}
                            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold text-sm cursor-pointer animate-fade-in"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="200"
                            value={formData.guests}
                            onChange={(e) => {
                              const val = Math.min(200, Math.max(1, parseInt(e.target.value) || 1));
                              setFormData(prev => ({ ...prev, guests: val }));
                            }}
                            className="w-12 text-center bg-transparent text-white font-mono text-sm font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, guests: Math.min(200, prev.guests + 1) }))}
                            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold text-sm cursor-pointer animate-fade-in"
                          >
                            +
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Date & Time Slot in Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-white/70 uppercase tracking-widest text-[9px] font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gold" /> Select Reservation Date*
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full bg-black/50 border border-white/12 text-white px-5 py-3 rounded-full outline-none focus:border-gold transition-colors text-center text-xs tracking-wider"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-white/70 uppercase tracking-widest text-[9px] font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gold" /> Dinner / Lunch Time Preset
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !showCustomTimeInput;
                          setShowCustomTimeInput(nextState);
                          if (!nextState) {
                            setFormData(prev => ({ ...prev, time: '19:30' }));
                          }
                        }}
                        className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded border transition-all cursor-pointer active:scale-95 ${
                          showCustomTimeInput
                            ? 'bg-gold text-black border-gold'
                            : 'text-gold/80 border-gold/20 hover:bg-gold/5'
                        }`}
                      >
                        {showCustomTimeInput ? 'Use Preset' : '+ Custom Time'}
                      </button>
                    </div>

                    {!showCustomTimeInput ? (
                      <div className="grid grid-cols-3 gap-1.5 animate-fade-in">
                        {timeslots.map(t => (
                          <button
                            type="button"
                            key={t}
                            onClick={() => setFormData(prev => ({ ...prev, time: t }))}
                            className={`py-2 rounded-lg font-mono text-[10px] transition-all cursor-pointer ${
                              formData.time === t
                                ? 'bg-gold/15 text-gold border border-gold/40'
                                : 'bg-white/2 hover:bg-white/5 text-white/60 border border-white/4'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 animate-fade-in">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required={showCustomTimeInput}
                            placeholder="e.g. 7:30 PM"
                            value={customTimeVal}
                            onChange={(e) => {
                              setCustomTimeVal(e.target.value);
                              if (validationError) setValidationError(null);
                            }}
                            className="flex-1 bg-black/50 border border-gold/40 text-gold px-4 py-2.5 rounded-xl outline-none focus:border-gold font-mono text-center text-xs tracking-wider"
                          />
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                let base = customTimeVal.replace(/\s*(am|pm)/i, '').trim();
                                if (base) {
                                  setCustomTimeVal(base + ' AM');
                                } else {
                                  setCustomTimeVal('12:00 AM');
                                }
                              }}
                              className={`px-3 py-2 rounded-xl text-[10px] font-mono uppercase font-black tracking-widest transition-all border cursor-pointer active:scale-95 ${
                                customTimeVal.toUpperCase().includes('AM')
                                  ? 'bg-gold text-black border-gold'
                                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              AM
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                let base = customTimeVal.replace(/\s*(am|pm)/i, '').trim();
                                if (base) {
                                  setCustomTimeVal(base + ' PM');
                                } else {
                                  setCustomTimeVal('12:00 PM');
                                }
                              }}
                              className={`px-3 py-2 rounded-xl text-[10px] font-mono uppercase font-black tracking-widest transition-all border cursor-pointer active:scale-95 ${
                                customTimeVal.toUpperCase().includes('PM')
                                  ? 'bg-gold text-black border-gold'
                                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              PM
                            </button>
                          </div>
                        </div>
                        <span className="text-[8px] text-white/40 block text-center uppercase tracking-wide">
                          * Enter custom digital hour (e.g. 1:30 or 8:45) and tap the <strong>AM</strong> or <strong>PM</strong> helper pills.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Request Area */}
                <div className="space-y-1.5">
                  <label className="block text-white/70 uppercase tracking-widest text-[9px] font-semibold">Special Requests / Occasion Details</label>
                  <textarea
                    rows={3}
                    placeholder="e.g., Anniversary dinner, vegetarian menu preference, extra hot spice, toddler high-chair, premium suite queries..."
                    value={formData.specialRequest}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialRequest: e.target.value }))}
                    className="w-full bg-black/50 border border-white/12 text-white px-5 py-3.5 rounded-2xl outline-none focus:border-gold transition-colors placeholder:text-white/25 resize-none leading-relaxed font-sans"
                  />
                  {selectedDishes.length > 0 && (
                    <p className="text-[10px] text-gold/80 italic font-mono">
                      ✓ Saffron menu pre-order choices are automatically binded.
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-gold hover:bg-gold/90 text-black text-[11px] font-extrabold tracking-[0.25em] uppercase transition-all duration-300 shadow-[0_5px_22px_rgba(212,175,55,0.25)] hover:shadow-[0_8px_30px_rgba(212,175,55,0.4)] cursor-pointer"
                >
                  Confirm Table Booking Instantly
                </button>

              </form>
            </motion.div>
          ) : (
            <motion.div
              key="booking-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-lux-card p-8 rounded-3xl border border-lux-border text-center space-y-6 max-w-md mx-auto gold-box-glow"
            >
              <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center mx-auto">
                <FileCheck className="w-8 h-8 text-gold" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-white tracking-wider uppercase">TABLE SECURED</h3>
                <p className="text-white/60 text-xs tracking-wider font-mono">Your luxurious seat is reserved. Bring the card below:</p>
              </div>

              {/* Gold luxury certificate table ticket representation */}
              <div className="bg-lux-black border border-lux-border p-5 rounded-2xl text-left space-y-3 font-mono relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-gold/5 blur-xl rounded-full" />
                
                <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2 text-[10px] uppercase text-white/50 tracking-widest font-bold">
                  <span>Shubham Luxury Dine</span>
                  <span className="text-gold font-mono text-xs">{createdTicket?.ticketNumber}</span>
                </div>

                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] tracking-wide text-white/80">
                  <span className="text-white/40 font-sans uppercase text-[9px] block">Guest Name</span>
                  <span className="font-serif text-white font-extrabold uppercase truncate">{createdTicket?.name}</span>

                  <span className="text-white/40 font-sans uppercase text-[9px] block">Diners Size</span>
                  <span className="text-gold font-bold">{createdTicket?.guests} Guests</span>

                  <span className="text-white/40 font-sans uppercase text-[9px] block">Date / Time</span>
                  <span>{createdTicket?.date} • {createdTicket?.time} IST</span>

                  <span className="text-white/40 font-sans uppercase text-[9px] block">Contact Phone</span>
                  <span className="text-white/60">{createdTicket?.phone}</span>
                </div>

                {createdTicket?.specialRequest && (
                  <div className="pt-2 border-t border-white/5 mt-2">
                    <span className="text-white/40 font-sans uppercase text-[9px] block mb-1">Arrangement requests:</span>
                    <p className="text-[10px] text-amber-300 italic font-sans max-w-full truncate">
                      "{createdTicket.specialRequest}"
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="w-full py-2.5 rounded-full border border-white/10 hover:bg-white/5 text-white/70 font-semibold tracking-wider text-[10px] uppercase transition-colors"
                >
                  Book Another Table
                </button>
                <a
                  href={`https://wa.me/917800335000?text=Hello%20Shubham%20Family%20Restaurant,%20I%20have%20just%20secured%20a%20table%20reservation%20for%20${createdTicket?.guests}%20guests%20on%20${createdTicket?.date}%20at%20${createdTicket?.time}.%20Booking%20Code:%20${createdTicket?.ticketNumber}.`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-full bg-emerald-500 text-black font-extrabold tracking-wider text-[10px] uppercase hover:bg-emerald-400 transition-colors block text-center"
                >
                  WhatsApp Ticket
                </a>
              </div>

            </motion.div>
          )) : (
            <motion.div
              key="order-history"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-lux-card p-6 sm:p-8 rounded-3xl border border-lux-border gold-box-glow space-y-6"
            >
              <div className="text-center space-y-2 mb-4">
                <h3 className="font-serif text-lg md:text-xl tracking-wider text-white uppercase flex items-center justify-center gap-2">
                  <History className="w-5 h-5 text-gold" /> PAST PRE-ORDERS & TABLES
                </h3>
                <p className="text-white/50 text-[10px] uppercase tracking-widest max-w-md mx-auto">
                  Find your previously registered banquet seating card and pre-ordered dishes in real-time.
                </p>
              </div>

              {/* Lookup form */}
              <div className="space-y-4 max-w-md mx-auto">
                <div className="flex gap-2 relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                    <Smartphone className="w-4 h-4 text-gold/60" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter Phone, Name or Reservation ID..."
                    value={historyQuery}
                    onChange={(e) => {
                      setHistoryQuery(e.target.value);
                      setHasSearched(true);
                    }}
                    className="w-full bg-black/50 border border-lux-border text-white pl-10 pr-4 py-3 rounded-2xl outline-none focus:border-gold transition-colors font-mono text-[11px] tracking-wider"
                  />
                  {historyQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setHistoryQuery('');
                        setHasSearched(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHasSearched(true);
                    }}
                    className="flex-1 py-3 bg-gold hover:bg-gold/90 text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(59,130,246,0.15)]"
                  >
                    <Search className="w-3.5 h-3.5" /> Search Reservation records
                  </button>
                </div>
              </div>

              {/* Results display */}
              <div className="space-y-4 pt-4 border-t border-lux-border">
                {!hasSearched || !historyQuery.trim() ? (
                  <div className="text-center py-8 text-white/30 space-y-2">
                    <Smile className="w-8 h-8 text-gold/30 mx-auto" />
                    <p className="text-[10px] uppercase tracking-wider">Please type to retrieve live credentials immediately.</p>
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="text-center py-10 bg-black/20 rounded-2xl border border-lux-border p-6 space-y-3">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-white font-serif text-sm uppercase tracking-wide">No reservation ticket found</p>
                      <p className="text-white/50 text-[10px] uppercase tracking-wider max-w-sm mx-auto leading-relaxed">
                        We couldn't locate any records matching "{historyQuery}". Double check your 10-digit mobile number or Reservation ID, or make a fresh table booking!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('reserve');
                        handleReset();
                      }}
                      className="mt-2 px-4 py-2 border border-gold/40 text-gold hover:bg-gold/10 rounded-xl text-[9px] uppercase font-bold tracking-widest transition-all cursor-pointer active:scale-95 mx-auto block"
                    >
                      Reserve Table Now &rarr;
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold">
                        FOUND {filteredBookings.length} RESERVATION{filteredBookings.length > 1 ? 'S' : ''}
                      </span>
                      <span className="text-[9px] text-gold uppercase tracking-widest font-mono font-black animate-pulse">
                        ● Live Sync System
                      </span>
                    </div>

                    <div className="grid gap-4 max-h-[380px] overflow-y-auto pr-1">
                      {filteredBookings.map((b) => {
                        const isConfirmed = b.status === 'Confirmed';
                        const isCancelled = b.status === 'Cancelled';
                        
                        // Parse pre-ordered dishes comprehensively from either field
                        let preorderedDishes: string[] = [];
                        if (b.preorderDishes) {
                          preorderedDishes = b.preorderDishes.split(',').map(s => s.trim()).filter(Boolean);
                        } else if (b.specialRequest && b.specialRequest.includes('Pre-ordered Culinary Delicacies:')) {
                          const parts = b.specialRequest.split('Pre-ordered Culinary Delicacies:');
                          if (parts[1]) {
                            preorderedDishes = parts[1].split(',').map(s => s.trim()).filter(Boolean);
                          }
                        } else if (b.specialRequest && b.specialRequest.includes('Pre-ordered culinary:')) {
                          const parts = b.specialRequest.split('Pre-ordered culinary:');
                          if (parts[1]) {
                            preorderedDishes = parts[1].split(',').map(s => s.trim()).filter(Boolean);
                          }
                        }

                        return (
                          <div 
                            key={b.id} 
                            className="bg-lux-black border border-lux-border rounded-2xl p-5 text-left space-y-4 relative overflow-hidden transition-all hover:border-gold/30"
                          >
                            <div className="flex justify-between items-center border-b border-white/5 pb-3 font-mono">
                              <div className="space-y-0.5">
                                <span className="text-[9px] text-white/40 uppercase tracking-widest">RESERV. TICKET</span>
                                <h4 className="text-white text-xs font-black select-all text-gold">
                                  {b.id}
                                </h4>
                              </div>
                              <span className={`text-[8px] font-mono tracking-widest px-2.5 py-1 rounded-full border uppercase ${
                                isConfirmed
                                  ? 'bg-success/10 text-success border-success/35'
                                  : isCancelled
                                    ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                    : 'bg-gold/10 text-gold border-gold/30'
                              }`}>
                                {b.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[10px] tracking-wide font-mono text-white/80">
                              <div>
                                <span className="text-white/40 font-sans uppercase text-[8px] block leading-none mb-1">GUEST OWNER</span>
                                <span className="font-serif text-white font-extrabold uppercase text-[11px]">{b.name}</span>
                              </div>
                              <div>
                                <span className="text-white/40 font-sans uppercase text-[8px] block leading-none mb-1">DINERS GUESTS</span>
                                <span className="font-black text-gold uppercase">{b.guests} Guests</span>
                              </div>
                              <div>
                                <span className="text-white/40 font-sans uppercase text-[8px] block leading-none mb-1">DATE / TIME</span>
                                <span className="text-white/90">{b.date} • {b.time}</span>
                              </div>
                              <div>
                                <span className="text-white/40 font-sans uppercase text-[8px] block leading-none mb-1">MOBILE CONTACT</span>
                                <span className="text-white/65">{b.phone}</span>
                              </div>
                            </div>

                            {/* Preordered dishes display section */}
                            {preorderedDishes.length > 0 ? (
                              <div className="pt-3 border-t border-white/5 mt-2 space-y-1.5">
                                <span className="text-white/40 font-sans uppercase text-[8px] block">PRE-ORDERED LUXURY DELICACIES:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {preorderedDishes.map((dish, idx) => (
                                    <span 
                                      key={idx}
                                      className="px-2.5 py-1 bg-gold/10 border border-gold/30 text-gold rounded-lg text-[9px] font-bold uppercase tracking-widest"
                                    >
                                      ✓ {dish}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : b.specialRequest ? (
                              <div className="pt-3 border-t border-white/5 mt-2">
                                <span className="text-white/40 font-sans uppercase text-[8px] block mb-1">SPECIAL ARRANGEMENTS:</span>
                                <p className="text-[10px] text-zinc-400 font-sans italic leading-relaxed">
                                  "{b.specialRequest}"
                                </p>
                              </div>
                            ) : null}

                            {/* Actions on history ticket item */}
                            <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2 justify-end font-mono">
                              {b.bookingType === 'preorder' && b.status === 'Pending' && (
                                <button
                                  type="button"
                                  onClick={() => handleConfirmPreorderPublicly(b)}
                                  className="px-3.5 py-1.5 rounded-lg bg-gold/25 text-gold hover:bg-gold hover:text-black border border-gold/40 hover:border-transparent text-[9px] uppercase font-black tracking-widest transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5 animate-pulse text-gold hover:text-black" /> Confirm Pre-Order
                                </button>
                              )}
                              <a
                                href={`https://wa.me/917800335000?text=Hello%20Shubham%20Family%20Restaurant,%20I%20have%20an%20existing%20table%20reservation%20under%2520the%2520name%2520${b.name}%2520for%2520${b.guests}%2520on%2520${b.date}%2520at%2520${b.time}.%2520Booking%2520Code:%2520${b.id}.`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-1.5 rounded-lg bg-success/20 text-success hover:bg-success hover:text-black border border-success/30 hover:border-transparent text-[9px] uppercase font-black tracking-widest transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                              >
                                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Operator
                              </a>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Premium Toast/Modal Dialogue Popup for Form Validation Errors */}
        <AnimatePresence>
          {validationError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
              onClick={() => setValidationError(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="bg-lux-card border border-lux-border max-w-sm w-full rounded-3xl p-6 relative shadow-[0_15px_50px_rgba(59,130,246,0.15)] text-center space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setValidationError(null)}
                  className="absolute right-4 top-4 text-white/40 hover:text-white p-1 rounded-full hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Alarm Icon */}
                <div className="w-14 h-14 rounded-full bg-red-600/15 border border-red-500/30 flex items-center justify-center mx-auto text-red-500">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-serif text-lg text-white tracking-wider uppercase">VALIDATION ERROR</h4>
                  <p className="text-white/70 text-xs leading-relaxed font-sans">
                    {validationError}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setValidationError(null)}
                  className="w-full py-3 rounded-full bg-gold hover:bg-gold/90 text-black text-[10px] font-extrabold tracking-widest uppercase transition-all duration-200 cursor-pointer shadow-[0_4px_12px_rgba(212,175,55,0.2)] active:scale-95"
                >
                  Understood & Amend Entry
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Premium Success Overlay for Public Real-Time Confirmations */}
        <AnimatePresence>
          {successInfoMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
              onClick={() => setSuccessInfoMessage(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="bg-lux-card border border-gold/30 max-w-sm w-full rounded-3xl p-6 relative shadow-[0_15px_50px_rgba(212,175,55,0.15)] text-center space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSuccessInfoMessage(null)}
                  className="absolute right-4 top-4 text-white/40 hover:text-white p-1 rounded-full hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Success Icon */}
                <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto text-gold animate-bounce">
                  <Check className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-serif text-lg text-gold tracking-wider uppercase">PRE-ORDER CONFIRMED</h4>
                  <p className="text-white/80 text-xs leading-relaxed font-sans">
                    {successInfoMessage}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSuccessInfoMessage(null)}
                  className="w-full py-3 rounded-full bg-gold hover:bg-gold/90 text-black text-[10px] font-extrabold tracking-widest uppercase transition-all duration-200 cursor-pointer shadow-[0_4px_12px_rgba(212,175,55,0.25)] active:scale-95"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
