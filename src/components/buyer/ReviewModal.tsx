import React, { useState } from 'react';
import { Order } from '../../types';
import { useApp } from '../../context/AppContext';
import { Star, X, CheckCircle2 } from 'lucide-react';

interface ReviewModalProps {
  order: Order;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ order, onClose }) => {
  const { addReview } = useApp();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const product = order.items[0]?.product;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    addReview(order.id, product.id, rating, comment);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="font-bold text-xs text-slate-900">Évaluation de la commande</span>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Merci pour votre avis !</h4>
            <p className="text-xs text-slate-500">
              Votre évaluation contribue au Trust Score du vendeur sur C’ECO.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
              <img
                src={product?.images[0]}
                alt=""
                className="w-12 h-12 rounded-lg object-cover bg-slate-200"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-slate-900 truncate">
                  {product?.name}
                </h4>
                <span className="text-[10px] text-slate-400">Vendu par {order.sellerName}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 text-center">
                Note globale
              </label>
              <div className="flex items-center justify-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Commentaire d'expérience (facultatif)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Qualité du produit, rapidité de livraison, emballage..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-400 outline-none resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Passer
              </button>
              <button
                type="submit"
                id="btn-confirm-review"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition-colors"
              >
                Publier l'avis
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
