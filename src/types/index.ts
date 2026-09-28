export type UserRole = 'buyer' | 'seller' | 'courier' | 'admin';

export type Currency = 'USD' | 'CDF';

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  role: UserRole;
  city: string;
  avatarUrl: string;
  isVerified: boolean;
  createdAt: string;
  businessName?: string;
  rccmNumber?: string;
}

export interface SellerScoreBreakdown {
  identityScore: number; // Max 25
  successRateScore: number; // Max 30
  reviewsScore: number; // Max 20
  disputeScore: number; // Max 15 (less disputes = higher)
  seniorityScore: number; // Max 10
}

export interface Seller {
  id: string;
  userId: string;
  businessName: string;
  tagline: string;
  description: string;
  city: string;
  commune: string;
  physicalAddress: string;
  logoUrl: string;
  coverUrl: string;
  isVerified: boolean;
  rccmNumber?: string;
  idNatNumber?: string;
  trustScore: number; // 0 to 100
  scoreBreakdown: SellerScoreBreakdown;
  rating: number; // 1 to 5
  reviewCount: number;
  totalSales: number;
  successRate: number; // Percentage, e.g. 98.4
  yearsActive: number;
  availableBalanceUSD: number;
  escrowBalanceUSD: number;
  joinedDate: string;
}

export type ProductCategory = 
  | 'telephones'
  | 'informatique'
  | 'electronique'
  | 'automobile'
  | 'maison'
  | 'mobilier'
  | 'mode'
  | 'accessoires'
  | 'energie_solaire'
  | 'autres';

export interface CategoryInfo {
  id: ProductCategory;
  name: string;
  iconName: string;
  count: number;
}

export type ProductCondition = 'Neuf' | 'Reconditionné A+' | 'Occasion Certifiée';

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerCity: string;
  sellerVerified: boolean;
  sellerTrustScore: number;
  name: string;
  category: ProductCategory;
  priceUSD: number;
  originalPriceUSD?: number;
  condition: ProductCondition;
  stockAvailable: number;
  stockReserved: number;
  images: string[];
  description: string;
  specifications: Record<string, string>;
  city: string;
  commune: string;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isPopular?: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AddressDRC {
  fullName: string;
  phone: string;
  city: string;
  commune: string;
  quartier: string;
  avenue: string;
  numero: string;
  repere: string; // Ex: "En face de la station Total, croisement Victoire"
  instructions?: string;
}

export type OrderStatus = 
  | 'pending_payment'
  | 'paid'
  | 'preparing'
  | 'ready_for_pickup'
  | 'in_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type PaymentMethod = 'mpesa' | 'orangemoney' | 'airtelmoney' | 'afrimoney' | 'card';

export type PaymentStatus = 'pending' | 'initiated' | 'successful' | 'failed' | 'cancelled' | 'refunded';

export type DeliveryMode = 'express' | 'pickup';

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  date?: string;
  description: string;
  completed: boolean;
  current?: boolean;
}

export interface Order {
  id: string; // e.g. CECO-2026-00482
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  sellerId: string;
  sellerName: string;
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  items: {
    product: Product;
    quantity: number;
    priceUSD: number;
  }[];
  subtotalUSD: number;
  deliveryFeeUSD: number;
  platformFeeUSD: number;
  totalUSD: number;
  deliveryMode: DeliveryMode;
  shippingAddress: AddressDRC;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryOtp: string; // 6 digits, e.g. "482910"
  otpVerified: boolean;
  createdAt: string;
  deliveredAt?: string;
  hasDispute?: boolean;
  disputeId?: string;
  hasReview?: boolean;
  flexpayReference?: string;
  escrowStatus?: 'held_in_escrow' | 'released' | 'refunded' | 'disputed';
  escrowLockedAt?: string;
  escrowReleasedAt?: string;
}

export type FlexPayOperator = 'mpesa' | 'orangemoney' | 'airtelmoney' | 'afrimoney' | 'card';

export interface FlexPayPaymentRequest {
  merchant?: string;
  type: '1' | '2'; // 1 = Mobile Money, 2 = Carte Bancaire
  reference: string;
  amount: number;
  currency: 'USD' | 'CDF';
  description: string;
  phone: string;
  callbackUrl?: string;
}

export interface FlexPayPaymentResponse {
  success: boolean;
  orderNumber?: string;
  code?: string | number;
  message: string;
  transactionReference: string;
  escrowReference: string;
  operator: FlexPayOperator;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  rawResponse?: unknown;
}

export interface Review {
  id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  buyerName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

export type DisputeReason = 
  | 'item_not_received'
  | 'wrong_item'
  | 'damaged'
  | 'seller_issue'
  | 'delivery_delay'
  | 'other';

export type DisputeStatus = 
  | 'open' 
  | 'under_review' 
  | 'investigating'
  | 'resolved_refunded' 
  | 'resolved_payout_seller' 
  | 'resolved_released'
  | 'rejected';

export type BuyerTab = 'home' | 'favorites' | 'cart' | 'orders' | 'messages' | 'profile';

export interface Dispute {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  reason: DisputeReason;
  description: string;
  amountUSD: number;
  evidenceImages: string[];
  status: DisputeStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InternalMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  imageUrl?: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  orderId?: string;
  orderCode?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'order' | 'payment' | 'delivery' | 'dispute' | 'security' | 'promo';
  targetRole: UserRole;
  read: boolean;
  createdAt: string;
  orderId?: string;
}

export interface FraudAlert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  type: string;
  description: string;
  targetUser: string;
  detectedAt: string;
  status: 'active' | 'resolved' | 'investigating';
}
