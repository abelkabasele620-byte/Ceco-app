import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('ceco_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [activeRole, setActiveRole] = useState<AppViewMode>('buyer');
  const [deviceFrame, setDeviceFrame] = useState<DeviceFrame>('mobile');
  const [currency, setCurrency] = useState<Currency>('USD');
  const usdToCdfRate = 2850; // 1 USD = 2850 CDF

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
  };

  const updateProductStock = (productId: string, newStock: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, stockAvailable: newStock } : p))
    );
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
