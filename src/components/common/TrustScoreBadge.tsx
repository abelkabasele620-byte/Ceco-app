import React, { useState } from 'react';
import { ShieldCheck, Info, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { SellerScoreBreakdown } from '../../types';

interface TrustScoreBadgeProps {
  score: number;
  breakdown?: SellerScoreBreakdown;
  sellerName?: string;
  size?: 'sm' | 'md' | 'lg';
  showModalTrigger?: boolean;
}

export const TrustScoreBadge: React.FC<TrustScoreBadgeProps> = ({
  score,
  breakdown = {
    identityScore: 25,
    successRateScore: 29,
    reviewsScore: 19,
    disputeScore: 13,
    seniorityScore: 8,
  },
  sellerName = 'Vendeur C’ECO',
  size = 'md',
  showModalTrigger = true,
}) => {
  const [showModal, setShowModal] = useState(false);

  // Score color tiers
  const getScoreColor = (val: number) => {
    if (val >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (val >= 75) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (val >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const getScoreLabel = (val: number) => {
    if (val >= 90) return 'Excellente confiance';
    if (val >= 75) return 'Très bonne fiabilité';
    if (val >= 60) return 'Fiabilité moyenne';
    return 'Vigilance requise';
  };

  return (
    <>
      <div
        id={`trust-score-${score}`}
        onClick={showModalTrigger ? (e) => { e.stopPropagation(); setShowModal(true); } : undefined}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-semibold ${getScoreColor(
          score
        )} ${showModalTrigger ? 'cursor-pointer hover:shadow-xs transition-shadow' : ''}`}
        title="Cliquez pour voir le détail du Trust Score"
      >
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
        <span>Trust Score {score}/100</span>
        {showModalTrigger && <Info className="w-3 h-3 opacity-70" />}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                  {score}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">C’ECO Trust Score</h3>
                  <p className="text-xs text-slate-500">{sellerName}</p>
                </div>
              </div>
              <button
                id="btn-close-trust-modal"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span>Niveau : <strong className="text-emerald-700">{getScoreLabel(score)}</strong></span>
                <span>Total: {score} / 100 pts</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${score}%` }}
                />
              </div>

              {/* Score breakdown metrics */}
              <div className="space-y-2 pt-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Identité & Documents vérifiés (RCCM, Id. Nat)
                  </span>
                  <span className="font-semibold text-slate-900">{breakdown.identityScore} / 25</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Taux de commandes livrées avec succès (98%+)
                  </span>
                  <span className="font-semibold text-slate-900">{breakdown.successRateScore} / 30</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Évaluations clients vérifiées (Avis certifiés)
                  </span>
                  <span className="font-semibold text-slate-900">{breakdown.reviewsScore} / 20</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Absence d’incidents & litiges non résolus
                  </span>
                  <span className="font-semibold text-slate-900">{breakdown.disputeScore} / 15</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Ancienneté & régularité sur C’ECO
                  </span>
                  <span className="font-semibold text-slate-900">{breakdown.seniorityScore} / 10</span>
                </div>
              </div>

              {/* Legal / Policy note */}
              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Note de sécurité :</strong> Le Trust Score C’ECO est calculé de manière algorithmique et transparente. Il reflète l’historique des transactions mais ne constitue pas une garantie absolue. En cas de problème, la protection C’ECO et la retenue en séquestre vous protègent.
                </span>
              </div>
            </div>

            <button
              id="btn-understand-trust"
              onClick={() => setShowModal(false)}
              className="w-full mt-2 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Compris, fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
};
