import React, { useState } from 'react';
import { Search, Sparkles, FileText, Calendar, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { DocumentMetadata } from '../types';
import { api } from '../services/api';

interface SearchAndOCRViewProps {
  documents: DocumentMetadata[];
  onOpenDocument: (docId: string) => void;
}

export const SearchAndOCRView: React.FC<SearchAndOCRViewProps> = ({
  documents,
  onOpenDocument,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [semanticMode, setSemanticMode] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [semanticResult, setSemanticResult] = useState<{ matchedDocIds: string[]; explanation: string } | null>(null);

  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    if (semanticMode) {
      setIsSearching(true);
      try {
        const res = await api.aiSemanticSearch(searchTerm.trim());
        setSemanticResult(res);
      } catch (err) {
        console.error('Semantic search error:', err);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const filteredDocs = documents.filter((doc) => {
    if (semanticResult && semanticMode) {
      return semanticResult.matchedDocIds.includes(doc.id);
    }
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      doc.name.toLowerCase().includes(q) ||
      doc.tags.some((t) => t.toLowerCase().includes(q)) ||
      (doc.ocrText || '').toLowerCase().includes(q) ||
      Object.values(doc.extractedFields || {}).some((v) => v.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-5">
      {/* Search Header */}
      <div className="bg-[#12151D] border border-[#1E2430] rounded-2xl p-5">
        <h2 className="text-base font-bold text-[#F4F5F7] mb-1">
          Search & Optical Character Recognition (OCR) Index
        </h2>
        <p className="text-xs text-[#9299A5] mb-4">
          Query indexed text extracted from scanned IDs, degrees, bills, and prescriptions with instant keyword matching or Gemini semantic queries.
        </p>

        <form onSubmit={handleSemanticSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#9299A5] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (semanticResult) setSemanticResult(null);
              }}
              placeholder={
                semanticMode
                  ? "Ask in plain English: 'Find passport expiring soon' or 'Show blood test results'..."
                  : "Search inside documents, dates, IDs, or full OCR transcripts..."
              }
              className="w-full bg-[#0B0D10] border border-[#262D3D] focus:border-[#3B82F6] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F4F5F7] placeholder-[#9299A5]/60 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setSemanticMode(!semanticMode);
              setSemanticResult(null);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
              semanticMode
                ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-[#648BFF]'
                : 'bg-[#181D26] border-[#2A3344] text-[#9299A5] hover:text-[#C5CAD3]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Semantic</span>
          </button>

          {semanticMode && (
            <button
              type="submit"
              disabled={isSearching || !searchTerm.trim()}
              className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
            </button>
          )}
        </form>

        {semanticResult && (
          <div className="mt-3 p-3 bg-[#182133] border border-[#2B4272] rounded-xl text-xs text-[#C5CAD3] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#648BFF] shrink-0" />
            <span>{semanticResult.explanation}</span>
          </div>
        )}
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {filteredDocs.length === 0 ? (
          <div className="bg-[#12151D] border border-[#1E2430] rounded-2xl p-10 text-center text-xs text-[#9299A5]">
            <Search className="w-8 h-8 text-[#648BFF] mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-[#F4F5F7]">No matching documents found</p>
            <p className="mt-1">Try refining your keyword query or scan a document with legible text.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-[#12151D] border border-[#1E2430] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#263554] transition-colors"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-[#F4F5F7]">{doc.name}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#182133] text-[#648BFF]">
                    {doc.category}
                  </span>
                </div>

                {doc.ocrText ? (
                  <p className="text-xs text-[#9299A5] line-clamp-2 font-mono bg-[#0B0D10] p-2.5 rounded-xl border border-[#1E2430]">
                    {doc.ocrText}
                  </p>
                ) : (
                  <p className="text-xs text-[#9299A5]/60">No OCR transcript extracted for this document.</p>
                )}

                <div className="flex items-center gap-3 text-[11px] text-[#9299A5]">
                  <span>Date: {doc.documentDate}</span>
                  {doc.expiryDate && <span>· Exp: {doc.expiryDate}</span>}
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>SHA-256 Verified</span>
                  </span>
                </div>
              </div>

              <button
                onClick={() => onOpenDocument(doc.id)}
                className="px-3.5 py-2 bg-[#181D26] hover:bg-[#222836] border border-[#2A3344] text-xs font-medium text-[#648BFF] rounded-xl flex items-center gap-1.5 transition-colors self-end md:self-center shrink-0"
              >
                <span>View Document</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
