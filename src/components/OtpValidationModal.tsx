import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface OtpValidationProps {
  orderId: string;
  expectedOtp: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const OtpValidationModal: React.FC<OtpValidationProps> = ({
  orderId,
  expectedOtp,
  onSuccess,
  onClose,
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Le code OTP doit contenir 6 chiffres.');
      return;
    }

    if (otp !== expectedOtp) {
      setError('Code OTP incorrect. Demandez le code exact à l\'acheteur.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'delivered', updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (updateError) throw updateError;

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la validation du code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
        <h3 className="text-xl font-bold text-emerald-950 mb-2">
          Validation de livraison C'ECO
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Saisissez le code à 6 chiffres donné par l'acheteur pour débloquer le paiement en séquestre.
        </p>

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full text-center text-3xl tracking-widest font-mono font-bold py-3 border-2 border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-gray-600 bg-gray-100 font-semibold hover:bg-gray-200 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="flex-1 py-3 px-4 rounded-xl text-white bg-emerald-600 font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {loading ? 'Vérification...' : 'Valider & Livrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
