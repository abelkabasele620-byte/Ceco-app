import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AddressDRC, DeliveryMode, PaymentMethod, Product } from '../../types';
import { FlexPayEscrowModal } from '../common/FlexPayEscrowModal';
import { FLEXPAY_CONFIG } from '../../services/flexpay';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Store,
  CreditCard,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ShoppingBag,
  Building2,
  BadgeCheck,
} from 'lucide-react';

interface CartAndCheckoutProps {
  directProduct?: Product | null;
  onOrderCompleted: (orderId: string) => void;
  onContinueShopping: () => void;
}

export const CartAndCheckout: React.FC<CartAndCheckoutProps> = ({
  directProduct,
  onOrderCompleted,
  onContinueShopping,
}) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    formatPriceDetailed,
    placeOrder,
    user,
  } = useApp();

  // Checkout steps: 1: Cart, 2: Address DRC, 3: Delivery Mode, 4: Payment, 5: Confirmation
  const [currentStep, setCurrentStep] = useState<number>(directProduct ? 2 : 1);

  // Address state with realistic DRC fields (Ville, Commune, Quartier, Avenue, N°, Repère, Contact)
  const [address, setAddress] = useState<AddressDRC>({
    fullName: user.fullName || 'Patrick Kabasele',
    phone: user.phone || '+243 82 450 9182',
    city: 'Kinshasa',
    commune: 'Gombe',
    quartier: 'Hôtel de Ville',
    avenue: 'Avenue de la Justice',
    numero: '24 B',
    repere: 'En face de l’Ambassade de France, portail vert',
    instructions: 'Appeler 10 min avant l’arrivée du coursier.',
  });

  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('express');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [paymentPhone, setPaymentPhone] = useState(user.phone || '+243 82 450 9182');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [flexpayEscrowModalOpen, setFlexpayEscrowModalOpen] = useState(false);
  const [pinPromptModal, setPinPromptModal] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [confirmedOtp, setConfirmedOtp] = useState<string | null>(null);
  const [confirmedEscrowRef, setConfirmedEscrowRef] = useState<string | null>(null);
  const [confirmedFlexpayRef, setConfirmedFlexpayRef] = useState<string | null>(null);

  // Items to checkout: either direct buy or current cart
  const checkoutItems = directProduct
    ? [{ product: directProduct, quantity: 1 }]
    : cart;

  const subtotalUSD = checkoutItems.reduce(
    (sum, item) => sum + item.product.priceUSD * item.quantity,
    0
  );

  const deliveryFeeUSD = deliveryMode === 'express' ? (address.city === 'Kinshasa' ? 5 : 8) : 0;
  const platformFeeUSD = 0; // C'ECO buyer fee is 0 (seller pays commission)
  const totalUSD = subtotalUSD + deliveryFeeUSD + platformFeeUSD;

  const subtotalPrice = formatPriceDetailed(subtotalUSD);
  const deliveryPrice = formatPriceDetailed(deliveryFeeUSD);
  const totalPrice = formatPriceDetailed(totalUSD);

  // DRC Cities and Communes list
  const DRC_CITIES = ['Kinshasa', 'Lubumbashi', 'Goma', 'Kolwezi', 'Matadi', 'Bukavu'];
  const KINSHASA_COMMUNES = [
    'Gombe',
    'Limete',
    'Bandalungwa',
    'Kasa-Vubu',
    'Lingwala',
    'Ngaliema',
    'Kintambo',
    'Barumbu',
    'Mont-Ngafula',
    'Lemba',
    'Matete',
    'Ndjili',
  ];

  const handleStartPayment = () => {
    setFlexpayEscrowModalOpen(true);
  };

  const handleFlexPaySuccess = (result: {
    paymentMethod: PaymentMethod;
    flexpayReference: string;
    escrowReference: string;
    transactionNumber: string;
  }) => {
    const primarySeller = checkoutItems[0]?.product;
    const newOrder = placeOrder({
      buyerId: user.id,
      buyerName: address.fullName,
      buyerPhone: address.phone,
      sellerId: primarySeller?.sellerId || 'seller-konga-tech',
      sellerName: primarySeller?.sellerName || 'Konga Tech RDC',
      items: checkoutItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
        priceUSD: item.product.priceUSD,
      })),
      subtotalUSD,
      deliveryFeeUSD,
      platformFeeUSD,
      totalUSD,
      deliveryMode,
      shippingAddress: address,
      paymentMethod: result.paymentMethod,
      paymentStatus: 'successful',
      orderStatus: 'paid',
      deliveryOtp: '', // will be set by placeOrder
      flexpayReference: result.flexpayReference,
      escrowStatus: 'held_in_escrow',
      escrowLockedAt: new Date().toISOString(),
    });

    setPaymentMethod(result.paymentMethod);
    setConfirmedOrderId(newOrder.id);
    setConfirmedOtp(newOrder.deliveryOtp);
    setConfirmedEscrowRef(result.escrowReference);
    setConfirmedFlexpayRef(result.flexpayReference);
    setCurrentStep(5);
  };

  const handleConfirmPinAndPay = () => {
    setIsProcessingPayment(true);
    setPinPromptModal(false);

    // Simulate real Mobile Money USSD push transaction delay (1.5s)
    setTimeout(() => {
      const primarySeller = checkoutItems[0]?.product;
      const newOrder = placeOrder({
        buyerId: user.id,
        buyerName: address.fullName,
        buyerPhone: address.phone,
        sellerId: primarySeller?.sellerId || 'seller-konga-tech',
        sellerName: primarySeller?.sellerName || 'Konga Tech RDC',
        items: checkoutItems.map(item => ({
          product: item.product,
          quantity: item.quantity,
          priceUSD: item.product.priceUSD,
        })),
        subtotalUSD,
        deliveryFeeUSD,
        platformFeeUSD,
        totalUSD,
        deliveryMode,
        shippingAddress: address,
        paymentMethod,
        paymentStatus: 'successful',
        orderStatus: 'paid',
        deliveryOtp: '', // will be set by placeOrder
        flexpayReference: `FP-${Math.floor(10000000 + Math.random() * 90000000)}`,
        escrowStatus: 'held_in_escrow',
        escrowLockedAt: new Date().toISOString(),
      });

      setIsProcessingPayment(false);
      setConfirmedOrderId(newOrder.id);
      setConfirmedOtp(newOrder.deliveryOtp);
      setConfirmedEscrowRef(`SEC-FP-${newOrder.id.slice(-6)}-${Date.now().toString().slice(-4)}`);
      setConfirmedFlexpayRef(newOrder.flexpayReference || 'FP-8492019');
      setCurrentStep(5);
    }, 1800);
  };

  if (checkoutItems.length === 0 && currentStep !== 5) {
    return (
      <div className="bg-slate-50 min-h-full p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Votre panier est vide</h2>
        <p className="text-xs text-slate-500 max-w-xs mb-6">
          Découvrez des milliers d’articles certifiés avec la garantie de sécurité C’ECO.
        </p>
        <button
          id="btn-empty-cart-shop"
          onClick={onContinueShopping}
          className="py-2.5 px-6 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-500 transition-colors"
        >
          Découvrir les produits
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-full pb-24 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <button
          id="btn-checkout-back"
          onClick={() => {
            if (currentStep > 1 && currentStep < 5) {
              setCurrentStep(currentStep - 1);
            } else {
              onContinueShopping();
            }
          }}
          className="p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-1 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentStep === 1 || currentStep === 5 ? 'Catalogue' : 'Étape précédente'}</span>
        </button>

        {/* Step Indicator */}
        {currentStep < 5 && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
              {currentStep}
            </span>
            <span>sur 4</span>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* STEP 1: REVIEW CART ITEMS */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-base sm:text-lg font-bold text-slate-900">
                Mon Panier ({checkoutItems.length} articles)
              </h1>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                Séquestre C’ECO activé
              </span>
            </div>

            <div className="space-y-2.5">
              {checkoutItems.map(({ product, quantity }) => {
                const itemPrice = formatPriceDetailed(product.priceUSD * quantity);
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center gap-3"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-18 h-18 rounded-xl object-cover bg-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Vendu par {product.sellerName}
                      </span>
                      <h3 className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                        {product.name}
                      </h3>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {itemPrice.usd}
                        </span>
                        <span className="text-[10px] text-slate-500">{itemPrice.cdf}</span>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex flex-col items-end justify-between self-stretch">
                      <button
                        id={`btn-remove-cart-${product.id}`}
                        onClick={() => removeFromCart(product.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-0.5 text-xs">
                        <button
                          onClick={() => updateCartQuantity(product.id, quantity - 1)}
                          className="w-6 h-6 rounded-md bg-white text-slate-700 flex items-center justify-center font-bold shadow-xs hover:bg-slate-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-bold text-slate-900">{quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stockAvailable}
                          className="w-6 h-6 rounded-md bg-white text-slate-700 flex items-center justify-center font-bold shadow-xs hover:bg-slate-200 disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subtotal Summary */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Sous-total articles :</span>
                <span className="font-bold text-slate-900">{subtotalPrice.usd} ({subtotalPrice.cdf})</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Les frais de livraison seront calculés à l'étape suivante selon votre commune.
              </p>
            </div>

            <button
              id="btn-go-to-address"
              onClick={() => setCurrentStep(2)}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Continuer vers la livraison</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: DRC SHIPPING ADDRESS */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900">
                Adresse de livraison en RDC
              </h1>
              <p className="text-xs text-slate-500">
                Indiquez les détails précis et points de repère pour orienter le coursier.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nom et Prénom du destinataire
                </label>
                <input
                  type="text"
                  value={address.fullName}
                  onChange={e => setAddress({ ...address, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Ex: Patrick Kabasele"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Ville</label>
                  <select
                    value={address.city}
                    onChange={e => setAddress({ ...address, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {DRC_CITIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Commune
                  </label>
                  {address.city === 'Kinshasa' ? (
                    <select
                      value={address.commune}
                      onChange={e => setAddress({ ...address, commune: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      {KINSHASA_COMMUNES.map(com => (
                        <option key={com} value={com}>
                          {com}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={address.commune}
                      onChange={e => setAddress({ ...address, commune: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Ex: Golf, Kenya, Kampemba..."
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Quartier
                  </label>
                  <input
                    type="text"
                    value={address.quartier}
                    onChange={e => setAddress({ ...address, quartier: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Ex: Quartier 1, Météo..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Avenue & Numéro
                  </label>
                  <input
                    type="text"
                    value={`${address.avenue} N° ${address.numero}`}
                    onChange={e => {
                      setAddress({ ...address, avenue: e.target.value });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Ex: Av. Kasa-Vubu N° 45"
                  />
                </div>
              </div>

              {/* Landmark - essential in DRC */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <label className="text-xs font-bold text-emerald-950 block mb-1 flex items-center gap-1">
                  Point de repère indispensable (RDC)
                </label>
                <input
                  type="text"
                  value={address.repere}
                  onChange={e => setAddress({ ...address, repere: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-emerald-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  placeholder="Ex: En face de la pharmacie, à côté de la station Total, portail bleu..."
                />
                <p className="text-[10px] text-emerald-800 mt-1">
                  Permet au coursier d'arriver rapidement sans se perdre.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Numéro de téléphone joignable
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={e => setAddress({ ...address, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                    placeholder="+243 82 000 0000"
                  />
                </div>
              </div>
            </div>

            <button
              id="btn-go-to-mode"
              onClick={() => setCurrentStep(3)}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Continuer vers le mode de réception</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: DELIVERY MODE */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900">
                Mode de réception
              </h1>
              <p className="text-xs text-slate-500">
                Choisissez comment vous souhaitez récupérer votre commande.
              </p>
            </div>

            <div className="space-y-3">
              {/* Option A: Express Delivery */}
              <div
                id="opt-delivery-express"
                onClick={() => setDeliveryMode('express')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                  deliveryMode === 'express'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    deliveryMode === 'express'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Truck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">
                      Livraison C’ECO Express à domicile
                    </span>
                    <span className="text-xs font-extrabold text-emerald-800">
                      {address.city === 'Kinshasa' ? '$5 (14 250 FC)' : '$8 (22 800 FC)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Un coursier certifié C’ECO achemine le colis scellé jusqu’à votre adresse. Remise sécurisée contre vérification du code OTP secret.
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Délai estimé : 2h à 4h
                  </span>
                </div>
              </div>

              {/* Option B: Store Pickup */}
              <div
                id="opt-delivery-pickup"
                onClick={() => setDeliveryMode('pickup')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                  deliveryMode === 'pickup'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    deliveryMode === 'pickup'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">
                      Retrait direct en boutique (Click & Collect)
                    </span>
                    <span className="text-xs font-bold text-slate-700">Gratuit ($0)</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Récupérez votre article directement auprès du vendeur en boutique physique vérifiée.
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Disponible dès validation du vendeur
                  </span>
                </div>
              </div>
            </div>

            <button
              id="btn-go-to-payment"
              onClick={() => setCurrentStep(4)}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Continuer vers le paiement sécurisé</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 4: PAYMENT OPTIONS DRC (Mobile Money M-Pesa, Orange Money, Airtel, Afrimoney, Card) */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900">
                Paiement Sécurisé C’ECO
              </h1>
              <p className="text-xs text-slate-500">
                Intégration directe des partenaires Mobile Money autorisés en RDC.
              </p>
            </div>

            {/* FlexPay Escrow Guaranteed Partner Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl p-4 border border-emerald-500/30 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-white">Séquestre Sécurisé FlexPay</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 text-[9px] font-bold">RDC Officiel</span>
                  </div>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    Fonds consignés et garantis sur compte bancaire jusqu'à vérification du colis avec votre code secret OTP.
                  </p>
                </div>
              </div>
            </div>

            {/* Total Recap Pill */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-md">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Montant Total à payer</span>
                <span className="text-xl sm:text-2xl font-black">{totalPrice.usd}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-amber-400">{totalPrice.cdf}</span>
                <span className="text-[10px] text-slate-400 block">Taux: 1 USD = 2850 FC</span>
              </div>
            </div>

            {/* Mobile Money Choices */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Choisissez votre opérateur :
              </label>

              {/* M-Pesa */}
              <div
                id="pay-opt-mpesa"
                onClick={() => setPaymentMethod('mpesa')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'mpesa'
                    ? 'border-red-600 bg-red-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center justify-center">
                    M-PESA
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Vodacom M-Pesa</span>
                    <span className="text-[10px] text-slate-500">Paiement instantané USSD Push</span>
                  </div>
                </div>
                <input
                  type="radio"
                  checked={paymentMethod === 'mpesa'}
                  onChange={() => setPaymentMethod('mpesa')}
                  className="accent-red-600"
                />
              </div>

              {/* Orange Money */}
              <div
                id="pay-opt-orange"
                onClick={() => setPaymentMethod('orangemoney')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'orangemoney'
                    ? 'border-orange-500 bg-orange-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white font-bold text-[11px] flex items-center justify-center">
                    Orange
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Orange Money RDC</span>
                    <span className="text-[10px] text-slate-500">Validation par invite sur votre mobile</span>
                  </div>
                </div>
                <input
                  type="radio"
                  checked={paymentMethod === 'orangemoney'}
                  onChange={() => setPaymentMethod('orangemoney')}
                  className="accent-orange-500"
                />
              </div>

              {/* Airtel Money */}
              <div
                id="pay-opt-airtel"
                onClick={() => setPaymentMethod('airtelmoney')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'airtelmoney'
                    ? 'border-rose-600 bg-rose-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center">
                    airtel
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Airtel Money RDC</span>
                    <span className="text-[10px] text-slate-500">Validation sécurisée par code secret</span>
                  </div>
                </div>
                <input
                  type="radio"
                  checked={paymentMethod === 'airtelmoney'}
                  onChange={() => setPaymentMethod('airtelmoney')}
                  className="accent-rose-600"
                />
              </div>

              {/* Afrimoney */}
              <div
                id="pay-opt-afrimoney"
                onClick={() => setPaymentMethod('afrimoney')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'afrimoney'
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                    africell
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Afrimoney (Africell)</span>
                    <span className="text-[10px] text-slate-500">Paiement Mobile Money direct</span>
                  </div>
                </div>
                <input
                  type="radio"
                  checked={paymentMethod === 'afrimoney'}
                  onChange={() => setPaymentMethod('afrimoney')}
                  className="accent-indigo-600"
                />
              </div>

              {/* Card / Bank */}
              <div
                id="pay-opt-card"
                onClick={() => setPaymentMethod('card')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'card'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Carte Bancaire / Visa / Mastercard</span>
                    <span className="text-[10px] text-slate-500">Rawbank Illicocash, Equity BCDC</span>
                  </div>
                </div>
                <input
                  type="radio"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="accent-emerald-600"
                />
              </div>
            </div>

            {/* Mobile number for Mobile Money */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Numéro du compte Mobile Money ({paymentMethod.toUpperCase()})
              </label>
              <input
                type="tel"
                value={paymentPhone}
                onChange={e => setPaymentPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="+243 82 000 0000"
              />
              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                Vous recevrez une invite USSD sur votre téléphone pour valider la transaction.
              </p>
            </div>

            {/* Action button */}
            <button
              id="btn-initiate-payment"
              onClick={handleStartPayment}
              disabled={isProcessingPayment}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 group"
            >
              <Lock className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
              <span>Valider & Verrouiller sous Séquestre FlexPay ({totalPrice.usd})</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}

        {/* STEP 5: CONFIRMATION & SECRET OTP DISPLAY */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Fonds Verrouillés sous Séquestre
                </span>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-2">
                  Commande Confirmée & Sécurisée !
                </h1>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  N° de référence : <strong className="text-slate-900">{confirmedOrderId}</strong>
                </p>
              </div>

              {/* FlexPay & Bank Escrow Certificate Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    Certificat de Séquestre Bancaire
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    FlexPay RDC & Rawbank
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Réf. Séquestre :</span>
                    <strong className="text-slate-900">{confirmedEscrowRef || 'SEC-FP-928101'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">ID Transaction FlexPay :</span>
                    <strong className="text-slate-900">{confirmedFlexpayRef || 'FP-8492019'}</strong>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 pt-1">
                  Les fonds restent bloqués sur notre compte séquestre fiduciaire. Le vendeur sera crédité uniquement après confirmation de livraison avec le code OTP ci-dessous.
                </p>
              </div>

              {/* Secret Delivery OTP Showcase Box (Key Feature of C’ECO) */}
              <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-5 rounded-2xl shadow-lg space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-xs uppercase tracking-widest text-emerald-300">
                    Votre Code Secret OTP de Livraison
                  </span>
                </div>

                <div className="py-2">
                  <span className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-emerald-300 bg-slate-800/80 px-6 py-2 rounded-xl border border-emerald-500/40 inline-block shadow-inner">
                    {confirmedOtp || '482910'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 flex items-start gap-2 text-left bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Consigne de sécurité stricte :</strong> Ne communiquez ce code au coursier <strong>qu’après avoir ouvert et inspecté votre colis</strong>. Dès la saisie du code par le coursier, la livraison est validée et les fonds du vendeur sont débloqués.
                  </span>
                </div>
              </div>

              {/* Order Recap summary */}
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 text-left text-slate-600">
                <div className="flex justify-between">
                  <span>Destinataire :</span>
                  <strong className="text-slate-900">{address.fullName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Adresse :</span>
                  <span className="text-slate-900">{address.commune}, {address.repere}</span>
                </div>
                <div className="flex justify-between">
                  <span>Moyen de paiement :</span>
                  <span className="font-bold uppercase text-slate-900">{paymentMethod}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5">
                  <span className="font-bold">Total Sécurisé :</span>
                  <span className="font-extrabold text-emerald-800">{totalPrice.usd} ({totalPrice.cdf})</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  id="btn-track-order"
                  onClick={() => onOrderCompleted(confirmedOrderId || '')}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Suivre la commande
                </button>
                <button
                  id="btn-finish-shop"
                  onClick={onContinueShopping}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Retour à l'accueil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Money USSD PIN Simulation Modal */}
      {pinPromptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center font-bold">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900">
                Validation {paymentMethod.toUpperCase()}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Entrez votre code secret Mobile Money pour autoriser le prélèvement de <strong>{totalPrice.usd}</strong> ({totalPrice.cdf}) sur le compte {paymentPhone}.
              </p>
            </div>

            <div>
              <input
                type="password"
                maxLength={6}
                value={pinCode}
                onChange={e => setPinCode(e.target.value)}
                placeholder="••••"
                className="w-40 mx-auto text-center font-mono text-2xl tracking-widest p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                autoFocus
              />
              <span className="text-[10px] text-slate-400 block mt-1">Simulation sécurisée bac à sable RDC</span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setPinPromptModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                id="btn-confirm-pin"
                onClick={handleConfirmPinAndPay}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-md"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Payment Overlay */}
      {isProcessingPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl text-center space-y-3 max-w-xs w-full">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="font-bold text-sm text-slate-900">Traitement du paiement en cours...</h3>
            <p className="text-xs text-slate-500">
              Communication sécurisée avec l'opérateur {paymentMethod.toUpperCase()} RDC. Veuillez patienter.
            </p>
          </div>
        </div>
      )}

      {/* Official FlexPay Mobile Money Escrow Modal */}
      <FlexPayEscrowModal
        isOpen={flexpayEscrowModalOpen}
        onClose={() => setFlexpayEscrowModalOpen(false)}
        amountUSD={totalUSD}
        orderId={confirmedOrderId || `CECO-2026-${Math.floor(100000 + Math.random() * 900000)}`}
        customerName={address.fullName}
        customerPhone={paymentPhone}
        onPaymentSuccess={handleFlexPaySuccess}
      />
    </div>
  );
};
