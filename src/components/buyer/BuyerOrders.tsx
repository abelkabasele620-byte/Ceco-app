import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import {
  Package,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Bike,
  AlertTriangle,
  Star,
  MessageSquare,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { DisputeModal } from './DisputeModal';
import { ReviewModal } from './ReviewModal';

interface BuyerOrdersProps {
  initialSelectedOrderId?: string | null;
}

export const BuyerOrders: React.FC<BuyerOrdersProps> = ({ initialSelectedOrderId }) => {
  const { orders, formatPriceDetailed, setActiveBuyerTab } = useApp();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    initialSelectedOrderId || (orders.length > 0 ? orders[0].id : null)
  );

  const [disputeOrder, setDisputeOrder] = useState<Order | null>(null);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);

  const activeOrder = orders.find(o => o.id === selectedOrderId);

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard?.writeText(otp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  // Status mapping
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Paiement Validé</span>;
      case 'preparing':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">En Préparation</span>;
      case 'ready_for_pickup':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">Prêt pour retrait</span>;
      case 'in_delivery':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 animate-pulse">En cours de livraison</span>;
      case 'delivered':
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Livré & Terminé</span>;
      case 'disputed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">En Litige</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">Annulée</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getTimelineSteps = (status: OrderStatus) => {
    const steps = [
      { key: 'created', label: 'Commande créée', desc: 'Enregistrée dans le système C’ECO' },
      { key: 'paid', label: 'Paiement confirmé', desc: 'Fonds consignés en séquestre' },
      { key: 'preparing', label: 'Préparation vendeur', desc: 'Emballage avec sceau de garantie' },
      { key: 'in_delivery', label: 'Prise en charge coursier', desc: 'Acheminement vers l’adresse' },
      { key: 'completed', label: 'Livraison confirmée (OTP)', desc: 'Fonds débloqués pour le vendeur' },
    ];

    const orderRank: Record<OrderStatus, number> = {
      pending_payment: 0,
      paid: 1,
      preparing: 2,
      ready_for_pickup: 3,
      in_delivery: 3,
      delivered: 4,
      completed: 4,
      cancelled: -1,
      disputed: 3,
    };

    const currentRank = orderRank[status] ?? 1;

    return steps.map((s, idx) => ({
      ...s,
      isCompleted: idx <= currentRank,
      isCurrent: idx === currentRank,
    }));
  };

  return (
    <div className="bg-slate-50 min-h-full pb-24 p-4 animate-in fade-in duration-200">
      <div className="max-w-3xl mx-auto space-y-4">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900">Mes Commandes & Suivis</h1>
          <p className="text-xs text-slate-500">
            Suivez l'acheminement en temps réel et gérez la confirmation par code OTP.
          </p>
        </div>

        {/* Orders list pill tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {orders.map(o => (
            <button
              key={o.id}
              onClick={() => setSelectedOrderId(o.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                selectedOrderId === o.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>{o.id}</span>
              {getStatusBadge(o.orderStatus)}
            </button>
          ))}
        </div>

        {activeOrder ? (
          <div className="space-y-4">
            {/* Active Order Hero Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">Identifiant unique</span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    {activeOrder.id}
                  </span>
                </div>
                <div>{getStatusBadge(activeOrder.orderStatus)}</div>
              </div>

              {/* Secret OTP Box for Buyer */}
              {activeOrder.orderStatus !== 'completed' && activeOrder.orderStatus !== 'cancelled' && (
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-5 rounded-2xl shadow-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Code Secret OTP de Livraison
                    </span>
                    <button
                      onClick={() => handleCopyOtp(activeOrder.deliveryOtp)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                    >
                      {copiedOtp ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedOtp ? 'Copié' : 'Copier'}
                    </button>
                  </div>

                  <div className="py-2 flex items-center justify-center">
                    <span className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-emerald-300 bg-slate-950/70 px-6 py-2 rounded-xl border border-emerald-500/40 shadow-inner">
                      {activeOrder.deliveryOtp}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                    <strong className="text-amber-300">Règle C’ECO :</strong> Ne donnez ce code au coursier <strong>qu'après avoir vérifié le colis</strong>. Le coursier doit taper ce code dans son application pour valider la livraison.
                  </p>
                </div>
              )}

              {/* Visual Timeline (Section 21) */}
              <div className="pt-2 space-y-3">
                <h3 className="text-xs font-bold text-slate-900">Progression de la commande</h3>
                <div className="space-y-3 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {getTimelineSteps(activeOrder.orderStatus).map((step, index) => (
                    <div key={step.key} className="relative flex items-start gap-3">
                      <div
                        className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                          step.isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-slate-300 text-slate-400'
                        }`}
                      >
                        {step.isCompleted ? <Check className="w-3 h-3" /> : index + 1}
                      </div>
                      <div>
                        <span
                          className={`text-xs font-bold block ${
                            step.isCurrent
                              ? 'text-emerald-700'
                              : step.isCompleted
                              ? 'text-slate-900'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className="text-[11px] text-slate-500 block">{step.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items in Order */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Articles commandés</h4>
                {activeOrder.items.map((item, idx) => {
                  const price = formatPriceDetailed(item.priceUSD * item.quantity);
                  return (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-lg object-cover bg-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-slate-900 block truncate">
                          {item.product.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Quantité : {item.quantity} × {item.priceUSD}$
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900">{price.usd}</span>
                        <span className="text-[10px] text-slate-500 block">{price.cdf}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Shipping Address Recap */}
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-900 block">Détails de livraison</span>
                <p>
                  <strong>Destinataire :</strong> {activeOrder.shippingAddress.fullName} ({activeOrder.shippingAddress.phone})
                </p>
                <p>
                  <strong>Adresse RDC :</strong> {activeOrder.shippingAddress.commune}, {activeOrder.shippingAddress.quartier}, {activeOrder.shippingAddress.avenue} N°{activeOrder.shippingAddress.numero}
                </p>
                <p className="text-emerald-800 bg-emerald-50 p-2 rounded-lg font-medium">
                  <strong>Point de repère :</strong> {activeOrder.shippingAddress.repere}
                </p>
                {activeOrder.courierName && (
                  <p className="flex items-center gap-1.5 text-slate-700 font-semibold pt-1">
                    <Bike className="w-4 h-4 text-emerald-600" />
                    Coursier assigné : {activeOrder.courierName} ({activeOrder.courierPhone})
                  </p>
                )}
              </div>

              {/* Action Buttons: Message Seller / Open Dispute / Rate */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                <button
                  id="btn-order-msg-seller"
                  onClick={() => setActiveBuyerTab('messages')}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Contacter le vendeur</span>
                </button>

                {activeOrder.orderStatus === 'completed' && !activeOrder.hasReview && (
                  <button
                    id="btn-order-review"
                    onClick={() => setReviewOrder(activeOrder)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Star className="w-3.5 h-3.5 fill-white" />
                    <span>Donner un avis</span>
                  </button>
                )}

                {!activeOrder.hasDispute && activeOrder.orderStatus !== 'cancelled' && (
                  <button
                    id="btn-order-dispute"
                    onClick={() => setDisputeOrder(activeOrder)}
                    className="py-2.5 px-3 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Signaler un problème</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center text-slate-500 text-xs">
            Aucune commande active pour le moment.
          </div>
        )}
      </div>

      {/* Dispute Modal */}
      {disputeOrder && (
        <DisputeModal
          order={disputeOrder}
          onClose={() => setDisputeOrder(null)}
        />
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <ReviewModal
          order={reviewOrder}
          onClose={() => setReviewOrder(null)}
        />
      )}
    </div>
  );
};
