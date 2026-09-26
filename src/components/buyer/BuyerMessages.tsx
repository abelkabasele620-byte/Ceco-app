import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Send, ShieldAlert, Store, User, Lock, AlertCircle } from 'lucide-react';

export const BuyerMessages: React.FC = () => {
  const { conversations, messages, sendMessage, user } = useApp();

  const [activeConvId, setActiveConvId] = useState<string>(
    conversations.length > 0 ? conversations[0].id : 'conv-001'
  );
  const [inputText, setInputText] = useState('');
  const [fraudWarning, setFraudWarning] = useState<string | null>(null);

  const activeConv = conversations.find(c => c.id === activeConvId);
  const convMessages = messages.filter(m => m.conversationId === activeConvId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Real-time Anti-Fraud rule check (Section 24 / 33): Check for phone numbers or off-platform payment attempts
    const phonePattern = /(\+?243|0[89][0-9]{7})/g;
    const offPlatformKeywords = ['payer en cash', 'hors ceco', 'whatsapp', 'en mains propres sans ceco'];

    if (
      phonePattern.test(inputText) ||
      offPlatformKeywords.some(kw => inputText.toLowerCase().includes(kw))
    ) {
      setFraudWarning(
        'Alerte Sécurité C’ECO : Pour votre protection, l’échange de coordonnées privées et les règlements hors plateforme sont strictement interdits et suspendent la garantie de remboursement.'
      );
      setTimeout(() => setFraudWarning(null), 5000);
    }

    sendMessage(activeConvId, inputText);
    setInputText('');
  };

  return (
    <div className="bg-slate-50 min-h-full pb-24 p-4 animate-in fade-in duration-200">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[640px]">
        {/* Top Chat Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/80 text-white flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-sm">
                  {activeConv ? activeConv.sellerName : 'Konga Tech RDC'}
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400">
                Lié à la commande <span className="font-mono text-emerald-300">{activeConv?.orderCode || 'CECO-2026-000482'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] bg-slate-800 text-emerald-400 px-2.5 py-1 rounded-full border border-slate-700">
            <Lock className="w-3 h-3" />
            <span>Discussion Sécurisée</span>
          </div>
        </div>

        {/* Anti-Fraud Security Notice Banner (Mandatory requirement Section 24 & 33) */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-[11px] text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Protection C’ECO :</strong> Ne payez jamais en dehors de l'application. Seules les commandes payées via C’ECO bénéficient du code OTP et de la garantie de remboursement.
          </span>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {convMessages.map(msg => {
            const isMe = msg.senderId === user.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5 px-1">
                  <span>{msg.senderName}</span>
                  <span>•</span>
                  <span>{msg.createdAt}</span>
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            );
          })}

          {fraudWarning && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-xs flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{fraudWarning}</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Écrivez un message au vendeur..."
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button
            type="submit"
            id="btn-send-message"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white flex items-center justify-center shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
