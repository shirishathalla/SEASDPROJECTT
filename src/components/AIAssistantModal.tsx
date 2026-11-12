import React, { useState } from 'react';
import { Sparkles, Send, Trash2, ShieldCheck, X, FileText, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { ChatMessage, DocumentMetadata } from '../types';
import { api } from '../services/api';

interface AIAssistantModalProps {
  onClose: () => void;
  onOpenDocument: (docId: string) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  onClose,
  onOpenDocument,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content:
        'Hello! I am your DocuVault AI Assistant powered by Google Gemini. I have privacy-first access to authorized documents in your vault. You can ask me to summarize documents, find upcoming expiry dates, extract document numbers, or formulate renewal checklists.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [consentGiven, setConsentGiven] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const suggestedPrompts = [
    'Which documents in my vault expire within the next 30 days?',
    'Summarize my identity and government documents',
    'Generate a checklist for passport renewal',
    'What health or medical documents do I have stored?',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    if (!consentGiven) {
      setError('Please enable AI Processing Consent to allow the assistant to inspect authorized document context.');
      return;
    }

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const payload = newHistory.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.content,
      }));

      const res = await api.aiChat(payload, consentGiven);

      const assistantMsg: ChatMessage = {
        id: 'ast_' + Date.now(),
        sender: 'assistant',
        content: res.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        referencedDocuments: res.referencedDocuments || [],
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.message || 'AI Assistant encountered an issue.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'new_chat',
        sender: 'assistant',
        content: 'Conversation history cleared. How can I assist with your private vault today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-[#171A20] border border-[#222630] rounded-3xl w-full max-w-2xl h-[88vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#222630] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#222630] border border-[#2D3342] flex items-center justify-center text-[#648BFF]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-[#F4F5F7]">
                  DocuVault AI Assistant
                </h2>
                <span className="text-[10px] font-mono text-[#648BFF] bg-[#648BFF]/10 px-1.5 py-0.5 rounded border border-[#648BFF]/20">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[11px] text-[#9299A5]">
                Context-aware, zero-hallucination document intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              className="p-2 text-[#9299A5] hover:text-[#C5CAD3] hover:bg-[#222630] rounded-xl transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#9299A5] hover:text-[#F4F5F7] hover:bg-[#222630] rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Privacy Consent Banner */}
        <div className="bg-[#0B0D10] px-4 py-2.5 border-b border-[#222630] flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2 text-[#C5CAD3]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Privacy Guard: Only authorized metadata in your private vault is queried.</span>
          </div>
          <label className="flex items-center gap-1.5 text-[#9299A5] cursor-pointer">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#648BFF] rounded"
            />
            <span className="text-[10px]">Consent Active</span>
          </label>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
          {error && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#648BFF] text-white shadow-md rounded-br-none'
                    : 'bg-[#222630] text-[#F4F5F7] border border-[#2D3342] rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Clickable Referenced Document Sources */}
                {msg.referencedDocuments && msg.referencedDocuments.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#2D3342] flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-[#9299A5] block w-full">Referenced Vault Document:</span>
                    {msg.referencedDocuments.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => onOpenDocument(doc.id)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0B0D10] hover:bg-[#171A20] border border-[#2D3342] text-[11px] text-[#648BFF] transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        <span className="underline">{doc.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[9px] text-[#9299A5] mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#9299A5] p-3 rounded-2xl bg-[#222630] max-w-[60%] border border-[#2D3342]">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#648BFF]" />
              <span>Gemini analyzing vault context...</span>
            </div>
          )}
        </div>

        {/* Suggested Prompts (when few messages) */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-[#222630] flex flex-wrap gap-1.5 bg-[#0B0D10]/50">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-[11px] text-[#C5CAD3] bg-[#222630] hover:bg-[#2D3342] px-2.5 py-1 rounded-lg border border-[#2D3342] transition-colors flex items-center gap-1"
              >
                <span>{prompt}</span>
                <ArrowRight className="w-2.5 h-2.5 text-[#648BFF]" />
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-[#222630] bg-[#0B0D10]">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your documents, checklists, or expiry..."
              className="flex-1 bg-[#171A20] border border-[#2D3342] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#F4F5F7] placeholder-[#9299A5]/60 focus:outline-none focus:border-[#648BFF]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-[#648BFF] hover:bg-[#5279f0] active:scale-95 text-white flex items-center justify-center transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
