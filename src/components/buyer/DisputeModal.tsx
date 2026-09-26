import React, { useState } from 'react';
import { Order, DisputeReason } from '../../types';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, X, Camera, ShieldAlert } from 'lucide-react';

interface DisputeModalProps {
  order: Order;
  onClose: () => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({ order, onClose }) => {
  const { createDispute } = useApp();

  const [reason, setReason] = useState<DisputeReason>('wrong_item');
  const [description, setDescription] = useState('');
  const [evidenceImages, setEvidenceImages] = useState<string[]>([
    order.items[0]?.product.images[0] || '',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      createDispute(order.id, reason, description, evidenceImages);
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 800);
  };

  const reasonsList: { id: DisputeReason; label: string }[] = [
    { id: 'wrong_item', label: 'Article différent ou non-conforme à l’annonce' },
    { id: 'damaged', label: 'Article reçu endommagé ou défectueux' },
    { id: 'item_not_received', label: 'Colis non reçu / retard anormal' },
    { id: 'seller_issue', label: 'Comportement suspect ou refus du vendeur' },
    { id: 'delivery_delay', label: 'Problème lors de la livraison' },
    { id: 'other', label: 'Autre motif' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Ouvrir un litige de protection</h3>
              <p className="text-[11px] text-slate-500 font-mono">Commande {order.id}</p>
            </div>
          </div>
          <button
            id="btn-close-dispute-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Dossier ouvert avec succès !</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              L’équipe de médiation C’ECO a suspendu le versement au vendeur. Vous serez contacté sous 24h.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="py-4 space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Motif principal du litige
              </label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value as DisputeReason)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-rose-500 outline-none"
              >
                {reasonsList.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Explication détaillée de l'incident
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Décrivez précisément ce qui ne va pas (différence avec la photo, défaut constaté, etc.)..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 outline-none resize-none"
              />
            </div>

            {/* Proof Images preview */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Photos / Preuves jointes au dossier
              </label>
              <div className="flex items-center gap-2">
                <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 relative">
                  <img
                    src={evidenceImages[0]}
                    alt="Preuve"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-slate-300 cursor-pointer text-[9px] text-center p-1">
                  <Camera className="w-4 h-4 mb-0.5" />
                  <span>Ajouter photo</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Formats acceptés : JPG, PNG (Max 5 Mo). Vos photos permettent aux modérateurs d’arbitrer équitablement.
              </span>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900">
              <strong>Garantie Séquestre C’ECO :</strong> Les fonds de cette commande ({order.totalUSD}$) restent bloqués jusqu'à la décision finale du Centre de Résolution.
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                id="btn-submit-dispute"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-colors"
              >
                {isSubmitting ? 'Envoi...' : 'Déposer le litige'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
