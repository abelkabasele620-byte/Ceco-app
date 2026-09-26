import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bike,
  Package,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Store,
  Navigation,
} from 'lucide-react';

export const CourierDashboard: React.FC = () => {
  const { orders, verifyDeliveryOtp, formatPriceDetailed } = useApp();

  // Active missions for couriers (status in_delivery or preparing)
  const activeMissions = orders.filter(
    o => o.orderStatus === 'in_delivery' || o.orderStatus === 'preparing' || o.orderStatus === 'paid'
  );

  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    activeMissions.length > 0 ? activeMissions[0].id : 'CECO-2026-000482'
  );

  const [otpInput, setOtpInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const activeOrder = orders.find(o => o.id === selectedOrderId);

  const handleValidateOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder || !otpInput.trim()) return;

    const isSuccess = verifyDeliveryOtp(activeOrder.id, otpInput.trim());

    if (isSuccess) {
      setVerificationResult({
        success: true,
        message: 'Code OTP validé avec succès ! Livraison enregistrée et fonds débloqués en faveur du vendeur.',
      });
      setOtpInput('');
    } else {
      setVerificationResult({
        success: false,
        message: 'Code OTP incorrect. Demandez à l’acheteur d’ouvrir son application C’ECO et de vous communiquer son code secret à 6 chiffres.',
      });
    }

    setTimeout(() => {
      setVerificationResult(null);
    }, 6000);
  };

  return (
    <div className="bg-slate-50 min-h-full pb-20 p-4 animate-in fade-in duration-200">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Courier Profile Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-4 rounded-3xl shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow-sm">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-sm">Alain Makiese</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-300">
                Coursier Certifié C’ECO • Moto Express Kinshasa
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            En Service
          </span>
        </div>

        {/* Missions Selection */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {orders.map(o => (
            <button
              key={o.id}
              onClick={() => setSelectedOrderId(o.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                selectedOrderId === o.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>{o.id}</span>
              <span className="text-[10px] opacity-75">({o.orderStatus})</span>
            </button>
          ))}
        </div>

        {activeOrder ? (
          <div className="space-y-4">
            {/* Active Delivery Job Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">Colis à livrer</span>
                  <span className="font-mono text-sm font-black text-slate-900">
                    {activeOrder.id}
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Frais course : ${activeOrder.deliveryFeeUSD}
                </span>
              </div>

              {/* Pickup location (Seller) */}
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5" />
                  1. Point de retrait (Vendeur)
                </span>
                <p className="text-xs font-bold text-slate-900">{activeOrder.sellerName}</p>
                <p className="text-xs text-slate-500">Boulevard du 30 Juin, Gombe, Kinshasa</p>
                <a
                  href="tel:+243812209010"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-1"
                >
                  <Phone className="w-3 h-3" />
                  Appeler la boutique (+243 81 220 9010)
                </a>
              </div>

              {/* Destination location DRC (Buyer) */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                  2. Destination finale (Acheteur)
                </span>
                <p className="text-xs font-bold text-slate-900">
                  {activeOrder.shippingAddress.fullName}
                </p>
                <p className="text-xs text-slate-700">
                  {activeOrder.shippingAddress.commune}, {activeOrder.shippingAddress.quartier},{' '}
                  {activeOrder.shippingAddress.avenue} N°{activeOrder.shippingAddress.numero}
                </p>
                <div className="bg-white p-2 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-medium">
                  <strong>Point de repère :</strong> {activeOrder.shippingAddress.repere}
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <a
                    href={`tel:${activeOrder.shippingAddress.phone}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Appeler le client ({activeOrder.shippingAddress.phone})
                  </a>
                </div>
              </div>

              {/* Content of Parcel */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <span className="font-bold text-slate-900 block">Contenu du colis scellé :</span>
                {activeOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-slate-50">
                    <span>{it.quantity}x {it.product.name}</span>
                    <span className="font-mono text-slate-400">Réf #{it.product.id}</span>
                  </div>
                ))}
              </div>

              {/* OTP Validation Form (Courier's essential tool) */}
              {activeOrder.orderStatus !== 'completed' ? (
                <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-5 rounded-2xl shadow-md space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-300">
                      Validation de la remise physique
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300">
                    Remettez le colis à l'acheteur. Une fois qu'il a inspecté l'article, demandez-lui son <strong>Code Secret OTP à 6 chiffres</strong> et saisissez-le ci-dessous.
                  </p>

                  <form onSubmit={handleValidateOtp} className="space-y-3 pt-1">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpInput}
                        onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="Ex: 482910"
                        className="flex-1 py-3 px-4 rounded-xl bg-slate-950 text-emerald-300 font-mono text-xl tracking-widest text-center border border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                      <button
                        type="submit"
                        id="btn-courier-validate-otp"
                        disabled={otpInput.length < 4}
                        className="py-3 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-emerald-950 font-bold text-xs shadow-md transition-colors whitespace-nowrap"
                      >
                        Valider la remise
                      </button>
                    </div>
                  </form>

                  {verificationResult && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                        verificationResult.success
                          ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-200 border border-rose-500/40'
                      }`}
                    >
                      {verificationResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <span>{verificationResult.message}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Colis livré et clôturé avec succès</span>
                    <span>Le code OTP a été validé. La transaction est sécurisée.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center text-xs text-slate-500">
            Aucune mission assignée en ce moment.
          </div>
        )}
      </div>
    </div>
  );
};
