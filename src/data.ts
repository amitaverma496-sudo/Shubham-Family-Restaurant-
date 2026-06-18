import { MenuItem, Booking, GalleryItem, Inquiry } from './types';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // Starters
  {
    id: 's1',
    name: 'Shahi Lucknowi Paneer Tikka',
    price: 425,
    category: 'Starters',
    description: 'Premium organic cottage cheese blocks marinated in charcoal-smoked saffron yogurt and secret Awadhi spices, slow grilled in a clay tandoor.',
    isVeg: true,
    isPopular: true,
  },
  {
    id: 's2',
    name: 'Awadhi Kebab Platter',
    price: 545,
    category: 'Starters',
    description: 'Mouth-melting smoked vegetable skewers infused with cardamoms and rose petals, served with fresh mint yogurt chutney and roomali garnish.',
    isVeg: true,
    isPopular: true,
  },
  {
    id: 's3',
    name: 'Tandoori Broccoli Almondine',
    price: 395,
    category: 'Starters',
    description: 'Fresh organic broccoli florets steeped in seasoned cashew cream cheese, toasted with almond flakes and baked to buttery perfection in charcoal flame.',
    isVeg: true,
    isPopular: false,
  },
  {
    id: 's4',
    name: 'Crispy Tilak Hara Bhara Kebab',
    price: 365,
    category: 'Starters',
    description: 'Mince of fresh garden spinach, green peas, and local paneer, loaded with cashew bits and pan-fried with absolute pure cow ghee.',
    isVeg: true,
    isPopular: false,
  },

  // Main Course
  {
    id: 'm1',
    name: 'Shubham Signature Dal Bukhara',
    price: 445,
    category: 'Main Course',
    description: 'Our world-famous black urad lentils, slow-cooked overnight over live tandoor embers with butter, fresh tomato pulp, and rich dairy cream.',
    isVeg: true,
    isPopular: true,
  },
  {
    id: 'm2',
    name: 'Paneer Lababdar-e-Khas',
    price: 495,
    category: 'Main Course',
    description: 'Soft handpicked paneer cubes simmered in a silky onion-tomato and cashew gravy, finished with fresh butter and dried fenugreek leaves.',
    isVeg: true,
    isPopular: true,
  },
  {
    id: 'm3',
    name: 'Awadhi Nizami Handi',
    price: 415,
    category: 'Main Course',
    description: 'An aromatic treasure trove of seasonal field vegetables tossed with rich cardamom-scented gravy in an authentic heavy brass vessel.',
    isVeg: true,
    isPopular: false,
  },
  {
    id: 'm4',
    name: 'Kashmiri Saffron Dum Aloo',
    price: 425,
    category: 'Main Course',
    description: 'Scooped baby potatoes stuffed with royal nuts and fresh cottage cheese, slow-cooked on dum in a fragrant curd-based red gravy.',
    isVeg: true,
    isPopular: false,
  },
  {
    id: 'm5',
    name: 'Shahi Jeera Peas Pulao',
    price: 295,
    category: 'Main Course',
    description: 'Aromatic aged long-grain basmati rice fluffed with pure ghee, whole cumin seeds, and fresh tender green garden peas.',
    isVeg: true,
    isPopular: false,
  },

  // Chinese
  {
    id: 'c1',
    name: 'Crispy Honey Chili Lotus Stem',
    price: 375,
    category: 'Chinese',
    description: 'Paper-thin crunchy lotus root curls wok-tossed in a sticky organic honey, minced ginger, and hot dark soy reduction.',
    isVeg: true,
    isPopular: true,
  },
  {
    id: 'c2',
    name: 'Golden Scallion Veg Manchurian',
    price: 385,
    category: 'Chinese',
    description: 'Light mixed-vegetable crispy dumplings tossed in a masterfully seasoned dark soy, chopped green chilies, and scallion ginger broth.',
    isVeg: true,
    isPopular: false,
  },
  {
    id: 'c3',
    name: 'Sizzling Schezwan Chili Paneer',
    price: 415,
    category: 'Chinese',
    description: 'Crisp paneer triangles wok-tossed in handmade high-spice Schezwan oil, bell peppers, white wine vinegar, and scallions.',
    isVeg: true,
    isPopular: true,
  },

  // South Indian
  {
    id: 'si1',
    name: 'Royal Ghee Roast Masala Dosa',
    price: 295,
    category: 'South Indian',
    description: 'Ultra-thin crispy golden rice and lentil crepe gilded with pure local ghee, filled with spiced tempered potato mash, sambar, and fresh coconut chutney.',
    isVeg: true,
    isPopular: true,
  },
  {
    id: 'si2',
    name: 'Guntur Podi Idli (Tossed in Ghee)',
    price: 245,
    category: 'South Indian',
    description: 'Soft cloud-like button idlis steam-cooked, tossed generously in spicy spiced roasted lentil powder (podi) and hot cow ghee.',
    isVeg: true,
    isPopular: false,
  },
  {
    id: 'si3',
    name: 'Malabar Parotta with Veg Kurma',
    price: 325,
    category: 'South Indian',
    description: 'Two layers of crispy, flaky hand-stretched wheat parottas accompanied by a aromatic, mild spiced coconut milk curry with garden vegetables.',
    isVeg: true,
    isPopular: false,
  },

  // Desserts
  {
    id: 'd1',
    name: 'Saffron Shahi Tukda',
    price: 245,
    category: 'Desserts',
    description: 'Rich Awadhi royal bread pudding sweetened with saffron-infused thickened milk, cardamom powder, and toasted almond silver flakes.',
    isVeg: true,
    isPopular: true,
  },
  {
    id: 'd2',
    name: 'Lucknowi Kesari Matka Kulfi',
    price: 225,
    category: 'Desserts',
    description: 'Creamy, slow-evaporated rich milk dessert served ice-cold in traditional earthen pots with dynamic hint of premium saffron threads.',
    isVeg: true,
    isPopular: true,
  },
  {
    id: 'd3',
    name: 'Hot Gulab Jamun with Creamy Rabdi',
    price: 235,
    category: 'Desserts',
    description: 'Warm milk-solid spherical dumplings soaked in green cardamom rose sugar syrup, served atop a bed of chilled slow-reduced rabdi.',
    isVeg: true,
    isPopular: true,
  },

  // Beverages
  {
    id: 'b1',
    name: 'Royal Saffron Badam Thandai',
    price: 195,
    category: 'Beverages',
    description: 'Exquisite cold heritage milk potion blended with almonds, melon seeds, fennel, black pepper, rose petals, and hand-rubbed saffron.',
    isVeg: true,
    isPopular: true,
  },
  {
    id: 'b2',
    name: 'Fresh Mint & Ginger Soda Cooler',
    price: 165,
    category: 'Beverages',
    description: 'A cooling refreshing muddle of wild mint leaves, pressed ginger root juice, and fresh lemon topped with bubbly sparkling club soda.',
    isVeg: true,
    isPopular: false,
  },
  {
    id: 'b3',
    name: 'Cardamom Masala Chai Frappe',
    price: 185,
    category: 'Beverages',
    description: 'Spiced aromatic Indian tea cooked and chilled, blended with premium fresh milk cream, ice-blocks, and sweetened cinnamon syrup.',
    isVeg: true,
    isPopular: false,
  }
];

export const INITIAL_REVIEWS = [
  {
    id: 'r1',
    name: 'Ananya Sharma',
    rating: 5,
    text: 'Very good experience and nice food taste! The Awadhi Kebab platter and Dal Bukhara are an absolute masterpiece. Best high-end luxury dining in Badi Nahar Agra Expressway region.',
    date: 'June 12, 2026',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'r2',
    name: 'Rohit Verma',
    rating: 5,
    text: 'Honestly it was a must-go place. Elegant, minimalist surroundings, perfect for premium family dinners. The staff is polite, and the service is incredibly fast.',
    date: 'May 28, 2026',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'r3',
    name: 'Dr. Shruti Rai',
    rating: 5,
    text: 'Nice atmosphere and delicious food. Extremely competitive affordable pricing for such an luxurious, upscale, clean environment. Highly recommended!',
    date: 'June 02, 2026',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150'
  }
];

export const INITIAL_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1',
    title: 'The Royal Grand Dining Hall',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200',
    category: 'Restaurant'
  },
  {
    id: 'g2',
    title: 'Heritage Awadhi Starters',
    imageUrl: 'DISH_PLACEHOLDER', // Will replace with shubham_dish in the UI
    category: 'Culinary'
  },
  {
    id: 'g3',
    title: 'Luxury Presidential Suite Room',
    imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1200',
    category: 'Hotel'
  },
  {
    id: 'g4',
    title: 'Gourmet Dessert Presentation',
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=1200',
    category: 'Culinary'
  },
  {
    id: 'g5',
    title: 'Deluxe Cozy Twin Suite',
    imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1200',
    category: 'Hotel'
  },
  {
    id: 'g6',
    title: 'Our Premium Luxury Lounge',
    imageUrl: 'INTERIOR_PLACEHOLDER', // Will replace with shubham_interior in code
    category: 'Restaurant'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b-seed-1',
    name: 'Vikram Aditya Singh',
    phone: '+91991827xxxx',
    guests: 4,
    date: '2026-06-20',
    time: '20:30',
    status: 'Confirmed',
    specialRequest: 'Princes’ corner table, celebrating anniversary',
    createdAt: '2026-06-17T18:00:00.000Z'
  },
  {
    id: 'b-seed-2',
    name: 'Aishwarya Kapoor',
    phone: '+91801033xxxx',
    guests: 6,
    date: '2026-06-21',
    time: '19:00',
    status: 'Pending',
    specialRequest: 'Require baby chair and mild spices',
    createdAt: '2026-06-17T20:15:00.000Z'
  }
];

export const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-1',
    name: 'Rajesh Mishra',
    phone: '+919876543210',
    message: 'Hello, I want to book the luxury banquet hall for a small ring ceremony of 100 people. Do you offer custom catering?',
    status: 'Unread',
    createdAt: '2026-06-17T15:30:00.000Z'
  }
];
