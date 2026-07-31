import React, { useState } from 'react';
import { useSendAiChatMessageMutation } from '@/hooks/use-ai-consultation';
import { AiChatMessage } from '@/types/api';
import { Bot, Send, X, Loader2, User } from 'lucide-react';

interface AiConsultantChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiConsultantChatModal({ isOpen, onClose }: AiConsultantChatModalProps) {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    { role: 'assistant', content: 'Halo! Saya AI Barbershop Consultant. Ada pertanyaan seputar potongan rambut atau produk perawatan yang sesuai?' },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const sendMutation = useSendAiChatMessageMutation();

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!inputMsg.trim() || sendMutation.isPending) return;

    const newMessages: AiChatMessage[] = [...messages, { role: 'user', content: inputMsg.trim() }];
    setMessages(newMessages);
    setInputMsg('');

    try {
      const res = await sendMutation.mutateAsync(newMessages);
      setMessages([...newMessages, { role: 'assistant', content: res.reply }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Maaf, terjadi masalah saat memproses pesan Anda. Silakan coba lagi.' }]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[520px]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Bot className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">AI Hair Consultant</h3>
              <p className="text-[10px] text-slate-400">Tanya seputar perawatan & gaya rambut</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="size-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Bot className="size-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium rounded-br-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                {m.content}
              </div>
              {m.role === 'user' && (
                <div className="size-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 border border-slate-700">
                  <User className="size-4" />
                </div>
              )}
            </div>
          ))}
          {sendMutation.isPending && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="size-3.5 animate-spin text-amber-400" />
              <span>AI sedang mengetik...</span>
            </div>
          )}
        </div>

        {/* Footer Input */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50 flex gap-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ketik pertanyaan Anda di sini..."
            className="flex-1 h-10 px-4 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
          <button
            disabled={sendMutation.isPending || !inputMsg.trim()}
            onClick={handleSend}
            className="size-10 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
