import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Building2,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import {
  FlexPayOperator,
  PaymentMethod,
} from '../../types';
import {
  DRC_OPERATORS,
  detectDRCOperator,
  initiateFlexPayPayment,
  FLEXPAY_CONFIG,
} from '../../services/flexpay';

interface FlexPayEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  amountUSD: number;
  orderId: string;
  customerName: string;
  customerPhone?: string;
  onPaymentSuccess: (result: {
    paymentMethod: PaymentMethod;
    flexpayReference: string;
    escrowReference: string;
    transactionNumber: string;
  }) => void;
}

type ModalStep = 'SELECT_PAYMENT' | 'SENDING_USSD' | 'WAITING_PIN' | 'ESCROW_LOCKED';

export const FlexPayEscrowModal: React.FC<FlexPayEscrowModalProps> = ({
  isOpen,
  onClose,
  amountUSD,
  orderId,
  customerName,
  customerPhone = '+243 82 450 9182',
  onPaymentSuccess,
}) => {
  const [selectedOperator, setSelectedOperator] = useState<FlexPayOperator>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState(customerPhone);
  const [currentStep, setCurrentStep] = useState<ModalStep>('SELECT_PAYMENT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [flexpayResult, setFlexpayResult] = useState<{
    transactionRef: string;
    escrowRef: string;
    orderNumber: string;
  } | null>(null);
  const [ussdTimer, setUssdTimer] = useState(30);

  // Détection automatique de l'opérateur en fonction du numéro tapé
  useEffect(() => {
    if (phoneNumber) {
      const detection = detectDRCOperator(phoneNumber);
      if (detection.isValid && selectedOperator !== 'card') {
        setSelectedOperator(detection.operator);
      }
    }
  }, [phoneNumber, selectedOperator]);

  // Décompte pour l'invite USSD
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === 'SENDING_USSD' || currentStep === 'WAITING_PIN') {
      interval = setInterval(() => {
        setUssdTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep]);

  if (!isOpen) return null;

  const amountCDF = Math.round(amountUSD * FLEXPAY_CONFIG.exchangeRateUSDCDF);
  const operatorDetails = DRC_OPERATORS[selectedOperator];

  const handleStartPayment = async () => {
    setIsSubmitting(true);
    setCurrentStep('SENDING_USSD');

    try {
      const response = await initiateFlexPayPayment({
        orderId,
        amountUSD,
        currency: 'USD',
        phone: phoneNumber,
        operator: selectedOperator,
        customerName,
        description: `Paiement Séquestre Commande C'ECO ${orderId}`,
      });

      setFlexpayResult({
        transactionRef: response.transactionReference,
        escrowRef: response.escrowReference,
        orderNumber: response.orderNumber || 'FP-8492019',
      });

      // Simulation de l'invite USSD Push reçue sur le mobile du client
      setTimeout(() => {
        setIsSubmitting(false);
        setCurrentStep('WAITING_PIN');
      }, 1400);
    } catch {
      setIsSubmitting(false);
      setCurrentStep('WAITING_PIN');
    }
  };

  const handleConfirmAuthorization = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep('ESCROW_LOCKED');

      if (flexpayResult) {
        onPaymentSuccess({
          paymentMethod: selectedOperator as PaymentMethod,
          flexpayReference: flexpayResult.orderNumber,
          escrowReference: flexpayResult.escrowRef,
          transactionNumber: flexpayResult.transactionRef,
        });
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header Modal co-brandé FlexPay & Séquestre C'ECO */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-4 sm:p-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Séquestre Garanti
            </span>
            <span className="text-[11px] font-semibold text-slate-300">
              Passerelle FlexPay RDC
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-black tracking-tight">
            Paiement Sécurisé & Verrouillage Séquestre
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Commande N° <span className="font-mono text-emerald-300 font-bold">{orderId}</span>
          </p>

          {/* Amount Badge */}
          <div className="mt-3 bg-white/10 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between border border-white/10">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                Montant sous séquestre
              </span>
              <span className="text-xl sm:text-2xl font-black text-white">
                ${amountUSD.toFixed(2)} USD
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-400">
                {amountCDF.toLocaleString('fr-CD')} CDF
              </span>
              <span className="text-[10px] text-slate-400 block">
                1 USD = {FLEXPAY_CONFIG.exchangeRateUSDCDF} FC
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* STEP 1: SELECT OPERATOR & PHONE NUMBER */}
          {currentStep === 'SELECT_PAYMENT' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-2">
                  1. Choisissez votre compte de paiement RDC :
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(DRC_OPERATORS) as FlexPayOperator[]).map(opKey => {
                    const op = DRC_OPERATORS[opKey];
                    const isSelected = selectedOperator === opKey;
                    return (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => setSelectedOperator(op.id)}
                        className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0"
                            style={{ borderColor: op.brandColor }}
                          >
                            {isSelected && (
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: op.brandColor }}
                              />
                            )}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {op.ussdPrefix}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="font-bold text-xs text-slate-900 block leading-tight">
                            {op.name}
                          </span>
                          <span className="text-[10px] text-slate-500 line-clamp-1">
                            {op.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DRC Phone input */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Numéro Mobile Money pour le débit</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {operatorDetails.name} détecté
                  </span>
                </label>

                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="+243 82 000 0000"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                  Une invite USSD FlexPay sera envoyée directement sur votre téléphone pour valider l'opération.
                </p>
              </div>

              {/* Escrow Guarantee Explanatory Box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Comment fonctionne le Séquestre C'ECO ?</span>
                </div>
                <ul className="text-[11px] text-emerald-900/90 space-y-1 pl-1 list-disc list-inside leading-relaxed">
                  <li>Votre argent <strong>n'est pas versé directement au vendeur</strong>.</li>
                  <li>Les fonds restent bloqués sur le compte séquestre bancaire <strong>{FLEXPAY_CONFIG.escrowPartnerBank}</strong>.</li>
                  <li>Le vendeur ne sera payé qu'<strong>après inspection physique</strong> de votre colis grâce au code secret OTP.</li>
                </ul>
              </div>

              {/* Pay Button */}
              <button
                type="button"
                onClick={handleStartPayment}
                disabled={isSubmitting || !phoneNumber}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>Initier le paiement FlexPay (${amountUSD.toFixed(2)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: USSD PUSH IN PROGRESS */}
          {currentStep === 'SENDING_USSD' && (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Envoi de l'invite USSD sur votre mobile...
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Connexion au réseau <strong>{operatorDetails.name}</strong> via la passerelle FlexPay RDC.
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 inline-block font-mono text-xs text-slate-700">
                Numéro ciblé : <strong>{phoneNumber}</strong>
              </div>
            </div>
          )}

          {/* STEP 3: WAITING FOR PIN VALIDATION ON MOBILE */}
          {currentStep === 'WAITING_PIN' && (
            <div className="space-y-4 animate-in zoom-in-95 duration-200 text-center">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center shadow-xs">
                <Smartphone className="w-8 h-8 animate-bounce" />
              </div>

              <div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Invite USSD Envoyée
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-2">
                  Regardez l'écran de votre téléphone
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  L'opérateur <strong>{operatorDetails.name}</strong> vous invite à autoriser le paiement de <strong>${amountUSD.toFixed(2)} ({amountCDF.toLocaleString('fr-CD')} CDF)</strong> au profit du compte séquestre C'ECO.
                </p>
              </div>

              {/* Simulation Box for sandbox */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 text-left space-y-2 border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-1.5">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Lock className="w-3 h-3 text-emerald-400" /> Invite USSD Simplex ({operatorDetails.name})
                  </span>
                  <span className="text-[10px] font-mono text-amber-400">Expire dans {ussdTimer}s</span>
                </div>
                <p className="text-xs text-slate-200 font-mono">
                  &gt; Confirmez-vous le paiement de {amountCDF.toLocaleString('fr-CD')} CDF pour la commande {orderId} ?
                </p>
                <div className="pt-1">
                  <label className="text-[10px] text-slate-400 block mb-1">
                    Entrez votre code secret PIN ({operatorDetails.name}) :
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={pinInput}
                    onChange={e => setPinInput(e.target.value)}
                    placeholder="••••"
                    className="w-36 text-center font-mono text-xl tracking-widest p-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-emerald-500 outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep('SELECT_PAYMENT')}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Changer de numéro
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAuthorization}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Valider l'autorisation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: FUNDS LOCKED IN ESCROW VAULT */}
          {currentStep === 'ESCROW_LOCKED' && flexpayResult && (
            <div className="space-y-4 animate-in zoom-in-95 duration-200 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
                  Fonds Verrouillés sous Séquestre
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-2">
                  Paiement FlexPay Capturé avec Succès !
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Les fonds sont en sécurité dans le coffre-fort numérique C'ECO.
                </p>
              </div>

              {/* Escrow Certificate Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 text-left space-y-3 font-mono text-xs border border-emerald-500/30">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Réf. Séquestre C'ECO :</span>
                  <span className="text-emerald-400 font-bold">{flexpayResult.escrowRef}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">ID Transaction FlexPay :</span>
                  <span className="text-slate-200">{flexpayResult.transactionRef}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Opérateur :</span>
                  <span className="text-white font-bold">{operatorDetails.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Statut du versement :</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> En attente de l'OTP
                  </span>
                </div>
              </div>

              {/* Instructions regarding OTP */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-left flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-900 space-y-1">
                  <strong>Important pour la livraison :</strong>
                  <p>
                    Votre <strong>code secret OTP à 6 chiffres</strong> s'affichera sur votre récapitulatif de commande. Ne le donnez au coursier qu'une fois le colis vérifié physiquement.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Accéder au reçu de commande & Code OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center shrink-0">
          <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Garantie Séquestre 100%
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-600" />
              Certifié FlexPay RDC
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-blue-600" />
              Rawbank Escrow
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
