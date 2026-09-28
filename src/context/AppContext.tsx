import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  UserRole,
  Currency,
  Product,
  Seller,
  CategoryInfo,
  Order,
  Dispute,
  CartItem,
  NotificationItem,
  Conversation,
  InternalMessage,
  FraudAlert,
  OrderStatus,
  DisputeReason,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_PRODUCTS,
  INITIAL_SELLERS,
  CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_DISPUTES,
  INITIAL_NOTIFICATIONS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_FRAUD_ALERTS,
} from '../data/mockData';
import { supabase, isSupabaseConfigured, testSupabaseConnection } from '../lib/supabase';

export type AppViewMode = 'buyer' | 'seller' | 'courier' | 'admin' | 'docs';
export type DeviceFrame = 'mobile' | 'desktop';
export type BuyerTab = 'home' | 'search' | 'cart' | 'orders' | 'messages' | 'profile';

interface AppContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  activeRole: AppViewMode;
  setActiveRole: (role: AppViewMode) => void;
  deviceFrame: DeviceFrame;
  setDeviceFrame: (frame: DeviceFrame) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  usdToCdfRate: number;
  formatPrice: (amountUSD: number) => string;
  formatPriceDetailed: (amountUSD: number) => { usd: string; cdf: string };

  // Supabase Integration & Auth
  isSupabaseConnected: boolean;
  supabaseSession: any;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  isSupabaseLoading: boolean;
  signInWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithSupabase: (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role: UserRole;
    city?: string;
    businessName?: string;
    rccmNumber?: string;
  }) => Promise<{ success: boolean; error?: string; message?: string }>;
  signOutFromSupabase: () => Promise<void>;
  refreshProductsFromSupabase: () => Promise<void>;

  // Data
  products: Product[];
  sellers: Seller[];
  categories: CategoryInfo[];
  orders: Order[];
  disputes: Dispute[];
  cart: CartItem[];
  favorites: string[];
  notifications: NotificationItem[];
  conversations: Conversation[];
  messages: InternalMessage[];
  fraudAlerts: FraudAlert[];

  // Navigation & Selection
  activeBuyerTab: BuyerTab;
  setActiveBuyerTab: (tab: BuyerTab) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (prod: Product | null) => void;
  selectedSeller: Seller | null;
  setSelectedSeller: (seller: Seller | null) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (orderId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;

  // Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotalCount: number;
  cartSubtotalUSD: number;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;

  placeOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'otpVerified'>) => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  verifyDeliveryOtp: (orderId: string, otpAttempt: string) => { success: boolean; message: string };

  createDispute: (orderId: string, reason: DisputeReason, description: string, evidenceImages?: string[]) => void;
  resolveDispute: (disputeId: string, decision: 'refund_buyer' | 'payout_seller' | 'reject', adminNotes: string) => void;

  addReview: (orderId: string, productId: string, rating: number, comment: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  addProduct: (newProd: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => void;
  updateProductStock: (productId: string, newStock: number) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper mapper for Supabase products to App Product model
function mapSupabaseProduct(p: any): Product {
  return {
    id: p.id,
    sellerId: p.seller_id || 'sel-001',
    sellerName: p.seller_name || 'Boutique Partenaire C’ECO',
    sellerCity: p.seller_city || p.city || 'Kinshasa',
    sellerVerified: p.seller_verified ?? true,
    sellerTrustScore: Number(p.seller_trust_score ?? 92),
    name: p.name,
    category: p.category as any,
    priceUSD: Number(p.price_usd),
    originalPriceUSD: p.original_price_usd ? Number(p.original_price_usd) : undefined,
    condition: (p.condition as any) || 'Neuf',
    stockAvailable: Number(p.stock_available ?? 1),
    stockReserved: Number(p.stock_reserved ?? 0),
    images: Array.isArray(p.images) && p.images.length > 0 
      ? p.images 
      : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
    description: p.description || '',
    specifications: typeof p.specifications === 'object' && p.specifications !== null ? p.specifications : {},
    city: p.city || 'Kinshasa',
    commune: p.commune || 'Gombe',
    rating: Number(p.rating ?? 4.8),
    reviewCount: Number(p.review_count ?? 0),
    isFeatured: Boolean(p.is_featured),
    isPopular: Boolean(p.is_popular),
    createdAt: p.created_at || new Date().toISOString(),
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('ceco_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [activeRole, setActiveRole] = useState<AppViewMode>('buyer');
  const [deviceFrame, setDeviceFrame] = useState<DeviceFrame>('mobile');
  const [currency, setCurrency] = useState<Currency>('USD');
  const usdToCdfRate = 2850; // 1 USD = 2850 CDF

  // Supabase state
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [supabaseSession, setSupabaseSession] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [isSupabaseLoading, setIsSupabaseLoading] = useState<boolean>(false);

  // Navigation states
  const [activeBuyerTab, setActiveBuyerTab] = useState<BuyerTab>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Entities state
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('ceco_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [sellers, setSellers] = useState<Seller[]>(() => {
    const saved = localStorage.getItem('ceco_sellers');
    return saved ? JSON.parse(saved) : INITIAL_SELLERS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('ceco_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [disputes, setDisputes] = useState<Dispute[]>(() => {
    const saved = localStorage.getItem('ceco_disputes');
    return saved ? JSON.parse(saved) : INITIAL_DISPUTES;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('ceco_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('ceco_favs');
    return saved ? JSON.parse(saved) : ['prod-001', 'prod-003'];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('ceco_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState<InternalMessage[]>(INITIAL_MESSAGES);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>(INITIAL_FRAUD_ALERTS);

  // Function to refresh and fetch products directly from Supabase
  const refreshProductsFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      setIsSupabaseLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Note Supabase products:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const loadedProds = data.map(mapSupabaseProduct);
        setProducts(loadedProds);
        localStorage.setItem('ceco_products', JSON.stringify(loadedProds));
      }
    } catch (err) {
      console.warn('Supabase fetch products error:', err);
    } finally {
      setIsSupabaseLoading(false);
    }
  }, []);

  // Function to load user profile from Supabase
  const loadProfileFromSupabase = useCallback(async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        const updatedUser: User = {
          id: data.id,
          fullName: data.full_name || user.fullName,
          phone: data.phone || user.phone,
          email: data.email || email || user.email,
          role: (data.role as UserRole) || 'buyer',
          city: data.city || 'Kinshasa',
          avatarUrl: data.avatar_url || user.avatarUrl,
          isVerified: Boolean(data.is_verified),
          createdAt: data.created_at || user.createdAt,
          businessName: data.business_name,
          rccmNumber: data.rccm_number,
        };
        setUser(updatedUser);
        localStorage.setItem('ceco_user', JSON.stringify(updatedUser));
        if (data.role) {
          setActiveRole(data.role as any);
        }
      }
    } catch (err) {
      console.warn('Error loading Supabase profile:', err);
    }
  }, [user]);

  // Initial Supabase connection check & data fetching
  useEffect(() => {
    let isMounted = true;

    async function initSupabase() {
      const test = await testSupabaseConnection();
      if (isMounted) {
        setIsSupabaseConnected(test.ok);
      }

      // Check existing auth session
      try {
        const { data } = await supabase.auth.getSession();
        if (isMounted && data?.session) {
          setSupabaseSession(data.session);
          if (data.session.user) {
            await loadProfileFromSupabase(data.session.user.id, data.session.user.email);
          }
        }
      } catch (err) {
        console.warn('Auth session check error:', err);
      }

      // Fetch products from Supabase
      await refreshProductsFromSupabase();
    }

    initSupabase();

    // Listen to Supabase auth state change
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        setSupabaseSession(session);
        if (session?.user) {
          await loadProfileFromSupabase(session.user.id, session.user.email);
        }
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadProfileFromSupabase, refreshProductsFromSupabase]);

  // Auth: Sign In with Supabase
  const signInWithSupabase = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.session) {
        setSupabaseSession(data.session);
        if (data.user) {
          await loadProfileFromSupabase(data.user.id, data.user.email);
        }
        return { success: true };
      }

      return { success: false, error: 'Session non initialisée' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Erreur inconnue de connexion' };
    }
  };

  // Auth: Sign Up with Supabase
  const signUpWithSupabase = async (signUpData: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role: UserRole;
    city?: string;
    businessName?: string;
    rccmNumber?: string;
  }): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            full_name: signUpData.fullName,
            phone: signUpData.phone,
            role: signUpData.role,
            city: signUpData.city || 'Kinshasa',
            business_name: signUpData.businessName,
            rccm_number: signUpData.rccmNumber,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        // Also ensure public.profiles table receives the profile record
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: signUpData.email,
            full_name: signUpData.fullName,
            phone: signUpData.phone,
            role: signUpData.role,
            city: signUpData.city || 'Kinshasa',
            business_name: signUpData.businessName,
            rccm_number: signUpData.rccmNumber,
            avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
            is_verified: signUpData.role === 'buyer',
            trust_score: signUpData.role === 'seller' ? 85 : 95,
          });
        } catch (profileErr) {
          console.warn('Profile table insert note:', profileErr);
        }

        const newUser: User = {
          id: data.user.id,
          fullName: signUpData.fullName,
          phone: signUpData.phone,
          email: signUpData.email,
          role: signUpData.role,
          city: signUpData.city || 'Kinshasa',
          avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
          isVerified: true,
          createdAt: new Date().toISOString(),
          businessName: signUpData.businessName,
          rccmNumber: signUpData.rccmNumber,
        };

        setUser(newUser);
        localStorage.setItem('ceco_user', JSON.stringify(newUser));

        return {
          success: true,
          message: data.session
            ? 'Compte créé et connecté avec succès !'
            : 'Compte créé ! Vérifiez votre boîte email si la confirmation est activée sur votre projet Supabase.',
        };
      }

      return { success: false, error: 'Création de compte échouée' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Erreur inconnue d’inscription' };
    }
  };

  // Auth: Sign Out
  const signOutFromSupabase = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Error signing out:', err);
    }
    setSupabaseSession(null);
    setUser(INITIAL_USER);
    localStorage.removeItem('ceco_user');
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('ceco_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ceco_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('ceco_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('ceco_disputes', JSON.stringify(disputes));
  }, [disputes]);

  useEffect(() => {
    localStorage.setItem('ceco_favs', JSON.stringify(favorites));
  }, [favorites]);

  const formatPrice = (amountUSD: number): string => {
    if (currency === 'CDF') {
      const cdf = Math.round(amountUSD * usdToCdfRate);
      return `${cdf.toLocaleString('fr-FR')} FC`;
    }
    return `$${amountUSD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const formatPriceDetailed = (amountUSD: number) => {
    const cdf = Math.round(amountUSD * usdToCdfRate);
    return {
      usd: `$${amountUSD.toLocaleString('en-US')}`,
      cdf: `${cdf.toLocaleString('fr-FR')} FC`,
    };
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stockAvailable) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stockAvailable) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotalUSD = cart.reduce((acc, item) => acc + item.product.priceUSD * item.quantity, 0);

  // Favorites
  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  // Orders
  const placeOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'otpVerified'>): Order => {
    const newSeq = orders.length + 483;
    const orderId = `CECO-2026-${String(newSeq).padStart(6, '0')}`;
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      createdAt: new Date().toISOString(),
      otpVerified: false,
      deliveryOtp: Math.floor(100000 + Math.random() * 900000).toString(),
    };

    setOrders(prev => [newOrder, ...prev]);

    // Async persist to Supabase if connected
    if (isSupabaseConfigured) {
      supabase.from('orders').insert({
        id: newOrder.id,
        buyer_id: supabaseSession?.user?.id || null,
        buyer_name: newOrder.buyerName,
        buyer_phone: newOrder.buyerPhone,
        seller_id: null,
        seller_name: newOrder.sellerName,
        items: newOrder.items,
        subtotal_usd: newOrder.subtotalUSD,
        delivery_fee_usd: newOrder.deliveryFeeUSD,
        platform_fee_usd: newOrder.platformFeeUSD,
        total_usd: newOrder.totalUSD,
        delivery_mode: newOrder.deliveryMode,
        shipping_address: newOrder.shippingAddress,
        payment_method: newOrder.paymentMethod,
        payment_status: newOrder.paymentStatus,
        order_status: newOrder.orderStatus,
        delivery_otp: newOrder.deliveryOtp,
        otp_verified: false,
      }).then(({ error }) => {
        if (error) console.warn('Order sync to Supabase note:', error.message);
      });
    }

    // Update product stock
    orderData.items.forEach(item => {
      setProducts(prevProds =>
        prevProds.map(p =>
          p.id === item.product.id
            ? {
                ...p,
                stockAvailable: Math.max(0, p.stockAvailable - item.quantity),
                stockReserved: p.stockReserved + item.quantity,
              }
            : p
        )
      );
    });

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Commande validée avec succès !',
      body: `Votre commande ${orderId} a été créée. Suivez la préparation par le vendeur. Code OTP : ${newOrder.deliveryOtp}`,
      type: 'order',
      targetRole: 'buyer',
      read: false,
      createdAt: 'À l’instant',
      orderId: newOrder.id,
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Clear cart
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const updated: Order = { ...ord, orderStatus: newStatus };
          if (newStatus === 'completed') {
            updated.deliveredAt = new Date().toISOString();
          }
          return updated;
        }
        return ord;
      })
    );

    // Sync order update to Supabase
    if (isSupabaseConfigured) {
      supabase.from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId)
        .then(() => {});
    }

    // Notify buyer
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Statut commande mis à jour (${newStatus})`,
      body: `Votre commande ${orderId} est passée au statut : ${newStatus}.`,
      type: 'order',
      targetRole: 'buyer',
      read: false,
      createdAt: 'À l’instant',
      orderId,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const verifyDeliveryOtp = (orderId: string, otpAttempt: string): { success: boolean; message: string } => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      return { success: false, message: 'Commande introuvable.' };
    }

    if (order.deliveryOtp.trim() === otpAttempt.trim()) {
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId
            ? {
                ...o,
                otpVerified: true,
                orderStatus: 'completed',
                deliveredAt: new Date().toISOString(),
              }
            : o
        )
      );

      // Update Supabase
      if (isSupabaseConfigured) {
        supabase.from('orders')
          .update({ otp_verified: true, order_status: 'completed', delivered_at: new Date().toISOString() })
          .eq('id', orderId)
          .then(() => {});
      }

      // Release escrow balance to seller available balance
      setSellers(prevSellers =>
        prevSellers.map(s => {
          if (s.id === order.sellerId) {
            return {
              ...s,
              availableBalanceUSD: s.availableBalanceUSD + order.subtotalUSD,
              escrowBalanceUSD: Math.max(0, s.escrowBalanceUSD - order.subtotalUSD),
              totalSales: s.totalSales + 1,
            };
          }
          return s;
        })
      );

      // Notification
      const completionNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Livraison confirmée par code OTP !',
        body: `La commande ${orderId} a été confirmée et livrée au client. Les fonds ont été débloqués pour le vendeur.`,
        type: 'delivery',
        targetRole: 'buyer',
        read: false,
        createdAt: 'À l’instant',
        orderId,
      };
      setNotifications(prev => [completionNotif, ...prev]);

      return { success: true, message: 'Code OTP validé avec succès ! Commande clôturée et paiement débloqué.' };
    }

    // Fraud detection warning on repeated failure
    setFraudAlerts(prev => [
      {
        id: `fraud-${Date.now()}`,
        severity: 'medium',
        type: 'Tentative OTP erronée',
        description: `Tentative d’OTP infructueuse (${otpAttempt}) pour la commande ${orderId}`,
        targetUser: order.courierName || 'Coursier',
        detectedAt: new Date().toISOString(),
        status: 'active',
      },
      ...prev,
    ]);

    return { success: false, message: 'Code OTP invalide. Veuillez vérifier le code à 6 chiffres auprès du client.' };
  };

  const createDispute = (orderId: string, reason: DisputeReason, description: string, evidenceImages: string[] = []) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const newDispute: Dispute = {
      id: `disp-${Date.now()}`,
      orderId,
      buyerId: order.buyerId,
      buyerName: order.buyerName,
      sellerId: order.sellerId,
      sellerName: order.sellerName,
      reason,
      description,
      amountUSD: order.totalUSD,
      evidenceImages: evidenceImages.length > 0 ? evidenceImages : [order.items[0].product.images[0]],
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDisputes(prev => [newDispute, ...prev]);

    // Mark order as disputed
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, orderStatus: 'disputed', hasDispute: true, disputeId: newDispute.id } : o))
    );

    // Add notification to admin and seller
    const adminNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Nouveau litige ouvert #${newDispute.id}`,
      body: `L’acheteur ${order.buyerName} a ouvert un litige sur la commande ${orderId}. Raison: ${reason}.`,
      type: 'dispute',
      targetRole: 'admin',
      read: false,
      createdAt: 'À l’instant',
      orderId,
    };
    setNotifications(prev => [adminNotif, ...prev]);
  };

  const resolveDispute = (disputeId: string, decision: 'refund_buyer' | 'payout_seller' | 'reject', adminNotes: string) => {
    setDisputes(prev =>
      prev.map(d => {
        if (d.id === disputeId) {
          const newStatus =
            decision === 'refund_buyer'
              ? 'resolved_refunded'
              : decision === 'payout_seller'
              ? 'resolved_payout_seller'
              : 'rejected';
          return {
            ...d,
            status: newStatus,
            adminNotes,
            updatedAt: new Date().toISOString(),
          };
        }
        return d;
      })
    );

    const dispute = disputes.find(d => d.id === disputeId);
    if (dispute) {
      if (decision === 'refund_buyer') {
        setOrders(prev =>
          prev.map(o => (o.id === dispute.orderId ? { ...o, orderStatus: 'cancelled', paymentStatus: 'refunded' } : o))
        );
      } else if (decision === 'payout_seller') {
        setOrders(prev =>
          prev.map(o => (o.id === dispute.orderId ? { ...o, orderStatus: 'completed' } : o))
        );
      }
    }
  };

  const addReview = (orderId: string, productId: string, rating: number, comment: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, hasReview: true } : o))
    );
    // Update product rating
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const newReviewCount = p.reviewCount + 1;
          const newRating = Number(((p.rating * p.reviewCount + rating) / newReviewCount).toFixed(1));
          return { ...p, rating: newRating, reviewCount: newReviewCount };
        }
        return p;
      })
    );
  };

  const sendMessage = (conversationId: string, text: string) => {
    const newMsg: InternalMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: user.id,
      senderName: user.fullName,
      senderRole: activeRole === 'seller' ? 'seller' : 'buyer',
      text,
      createdAt: 'À l’instant',
      read: true,
    };
    setMessages(prev => [...prev, newMsg]);

    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? { ...c, lastMessage: text, lastMessageTime: 'À l’instant' }
          : c
      )
    );
  };

  const addProduct = (newProd: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => {
    const product: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [product, ...prev]);

    // Insert to Supabase if connected
    if (isSupabaseConfigured) {
      supabase.from('products').insert({
        id: product.id,
        seller_id: supabaseSession?.user?.id || null,
        seller_name: product.sellerName,
        seller_city: product.sellerCity,
        seller_verified: product.sellerVerified,
        seller_trust_score: product.sellerTrustScore,
        name: product.name,
        category: product.category,
        price_usd: product.priceUSD,
        original_price_usd: product.originalPriceUSD,
        condition: product.condition,
        stock_available: product.stockAvailable,
        images: product.images,
        description: product.description,
        specifications: product.specifications,
        city: product.city,
        commune: product.commune,
        rating: product.rating,
        review_count: product.reviewCount,
        is_featured: product.isFeatured,
        is_popular: product.isPopular,
      }).then(({ error }) => {
        if (error) console.warn('Supabase product insert note:', error.message);
      });
    }
  };

  const updateProductStock = (productId: string, newStock: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, stockAvailable: newStock } : p))
    );

    if (isSupabaseConfigured) {
      supabase.from('products')
        .update({ stock_available: newStock })
        .eq('id', productId)
        .then(() => {});
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        activeRole,
        setActiveRole,
        deviceFrame,
        setDeviceFrame,
        currency,
        setCurrency,
        usdToCdfRate,
        formatPrice,
        formatPriceDetailed,
        isSupabaseConnected,
        supabaseSession,
        authModalOpen,
        setAuthModalOpen,
        isSupabaseLoading,
        signInWithSupabase,
        signUpWithSupabase,
        signOutFromSupabase,
        refreshProductsFromSupabase,
        products,
        sellers,
        categories: CATEGORIES,
        orders,
        disputes,
        cart,
        favorites,
        notifications,
        conversations,
        messages,
        fraudAlerts,
        activeBuyerTab,
        setActiveBuyerTab,
        selectedProduct,
        setSelectedProduct,
        selectedSeller,
        setSelectedSeller,
        selectedOrderId,
        setSelectedOrderId,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotalCount,
        cartSubtotalUSD,
        toggleFavorite,
        isFavorite,
        placeOrder,
        updateOrderStatus,
        verifyDeliveryOtp,
        createDispute,
        resolveDispute,
        addReview,
        sendMessage,
        addProduct,
        updateProductStock,
        markNotificationAsRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
