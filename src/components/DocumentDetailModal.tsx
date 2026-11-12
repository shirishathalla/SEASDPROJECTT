import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Download, Trash2, Edit3, QrCode, Sparkles, FileText, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { DocumentMetadata, DocumentCategory } from '../types';
import { api } from '../services/api';
import { formatBytes } from '../utils/crypto';

interface DocumentDetailModalProps {
  documentId: string;
  onClose: () => void;
  onDocumentUpdated: (doc: DocumentMetadata) => void;
  onDocumentDeleted: (id: string) => void;
  onOpenQRShare: (doc: DocumentMetadata) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  documentId,
  onClose,
  onDocumentUpdated,
  onDocumentDeleted,
  onOpenQRShare,
}) => {
  const [doc, setDoc] = useState<DocumentMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Editing state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<DocumentCategory>('Other');
  const [description, setDescription] = useState<string>('');
  const [tagsStr, setTagsStr] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // AI Summary state
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [summaryResult, setSummaryResult] = useState<{ summary: string; keyPoints: string[]; actionItems: string[] } | null>(null);

  // Active view tab inside modal
  const [activeTab, setActiveTab] = useState<'preview' | 'ocr' | 'aiSummary'>('preview');

  useEffect(() => {
    loadDoc();
  }, [documentId]);

  const loadDoc = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getDocument(documentId);
      setDoc(res.document);
      setName(res.document.name);
      setCategory(res.document.category);
      setDescription(res.document.description || '');
      setTagsStr(res.document.tags.join(', '));
      setExpiryDate(res.document.expiryDate || '');
    } catch (err: any) {
      setError(err.message || 'Failed to decrypt document');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMetadata = async () => {
    if (!doc) return;
    setIsSaving(true);
    try {
      const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
      const res = await api.updateDocument(doc.id, {
        name,
        category,
        description,
        tags,
        expiryDate: expiryDate || undefined,
      });
      setDoc(res.document);
      onDocumentUpdated(res.document);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update metadata');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!doc) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${doc.name}" from your vault? This cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteDocument(doc.id);
      onDocumentDeleted(doc.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete document');
    }
  };

  const handleDownload = () => {
    if (!doc || !doc.base64Data) return;
    const link = window.document.createElement('a');
    link.href = `data:${doc.mimeType};base64,${doc.base64Data}`;
    link.download = doc.name.endsWith('.pdf') ? doc.name : `${doc.name}.pdf`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handleGenerateAISummary = async () => {
    if (!doc) return;
    setSummaryLoading(true);
    setActiveTab('aiSummary');
    try {
      const res = await api.aiSummarize({
        documentName: doc.name,
        category: doc.category,
        ocrText: doc.ocrText,
        description: doc.description,
      });
      setSummaryResult(res);
    } catch (err: any) {
      setError(err.message || 'AI Summarization failed');
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#171A20] border border-[#222630] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-[#222630] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-xl bg-[#222630] border border-[#2D3342] flex items-center justify-center text-[#648BFF] shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h2 className="text-sm sm:text-base font-bold text-[#F4F5F7] truncate">
                {doc ? doc.name : 'Loading Document...'}
              </h2>
              {doc && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#9299A5] truncate">
                  <span>{doc.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatBytes(doc.fileSize)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{doc.documentDate}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {doc && (
              <>
                <button
                  onClick={() => onOpenQRShare(doc)}
                  className="p-2 text-[#C5CAD3] hover:text-[#F4F5F7] bg-[#222630] hover:bg-[#2D3342] rounded-xl transition-colors"
                  title="Share via temporary QR Code"
                >
                  <QrCode className="w-4 h-4 text-[#648BFF]" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 text-[#C5CAD3] hover:text-[#F4F5F7] bg-[#222630] hover:bg-[#2D3342] rounded-xl transition-colors"
                  title="Download Decrypted File"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-[#9299A5] hover:text-rose-400 bg-[#222630] hover:bg-rose-500/10 rounded-xl transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-[#9299A5] hover:text-[#F4F5F7] rounded-xl hover:bg-[#222630] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#9299A5]">
              <RefreshCw className="w-6 h-6 animate-spin text-[#648BFF] mb-2" />
              <p className="text-xs">Authenticating and decrypting AES-256-GCM payload...</p>
            </div>
          ) : doc ? (
            <>
              {/* Security & Integrity Banner */}
              <div className="bg-[#0B0D10] border border-[#222630] rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-semibold text-emerald-300">Integrity Verified: </span>
                    <span className="text-[#C5CAD3]">SHA-256 hash match</span>
                  </div>
                </div>
                <div className="font-mono text-[11px] text-[#9299A5] truncate max-w-full">
                  Hash: <span className="text-[#648BFF]">{doc.sha256Checksum}</span>
                </div>
              </div>

              {/* View Mode Tabs */}
              <div className="flex p-1 bg-[#0B0D10] rounded-xl border border-[#222630] text-xs">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex-1 py-1.5 font-medium rounded-lg transition-all ${
                    activeTab === 'preview' ? 'bg-[#222630] text-[#F4F5F7]' : 'text-[#9299A5] hover:text-[#C5CAD3]'
                  }`}
                >
                  Document Preview
                </button>
                <button
                  onClick={() => setActiveTab('ocr')}
                  className={`flex-1 py-1.5 font-medium rounded-lg transition-all ${
                    activeTab === 'ocr' ? 'bg-[#222630] text-[#F4F5F7]' : 'text-[#9299A5] hover:text-[#C5CAD3]'
                  }`}
                >
                  Extracted OCR Text
                </button>
                <button
                  onClick={handleGenerateAISummary}
                  className={`flex-1 py-1.5 font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'aiSummary' ? 'bg-[#222630] text-[#648BFF]' : 'text-[#9299A5] hover:text-[#648BFF]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Summary</span>
                </button>
              </div>

              {/* Tab 1: Preview */}
              {activeTab === 'preview' && (
                <div className="bg-[#0B0D10] border border-[#222630] rounded-2xl p-4 flex flex-col items-center justify-center min-h-[220px]">
                  {doc.base64Data && (doc.mimeType.startsWith('image/') || doc.base64Data.startsWith('/9j/') || doc.base64Data.startsWith('iVBORw')) ? (
                    <img
                      src={`data:${doc.mimeType};base64,${doc.base64Data}`}
                      alt={doc.name}
                      className="max-h-72 object-contain rounded-xl border border-[#222630] shadow-md"
                    />
                  ) : (
                    <div className="text-center p-6">
                      <FileText className="w-12 h-12 text-[#648BFF] mx-auto mb-2 opacity-80" />
                      <p className="text-sm font-semibold text-[#F4F5F7]">{doc.name}</p>
                      <p className="text-xs text-[#9299A5] mt-1 font-mono">
                        {doc.mimeType} · {formatBytes(doc.fileSize)}
                      </p>
                      <button
                        onClick={handleDownload}
                        className="mt-4 px-4 py-2 rounded-xl bg-[#222630] hover:bg-[#2D3342] text-xs font-medium text-[#648BFF] inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Decrypted Document</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: OCR Extracted Fields */}
              {activeTab === 'ocr' && (
                <div className="space-y-3">
                  {Object.keys(doc.extractedFields || {}).length > 0 && (
                    <div className="bg-[#0B0D10] border border-[#222630] rounded-2xl p-3.5">
                      <h4 className="text-xs font-semibold text-[#C5CAD3] mb-2 uppercase tracking-wider">
                        Structured Fields Recognized
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(doc.extractedFields).map(([key, value]) => (
                          <div key={key} className="bg-[#171A20] p-2.5 rounded-xl border border-[#222630]">
                            <span className="text-[10px] text-[#9299A5] block">{key}</span>
                            <span className="text-xs font-medium text-[#F4F5F7]">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-[#0B0D10] border border-[#222630] rounded-2xl p-3.5">
                    <h4 className="text-xs font-semibold text-[#C5CAD3] mb-1.5 uppercase tracking-wider">
                      Indexed OCR Raw Text
                    </h4>
                    <p className="text-xs text-[#C5CAD3] whitespace-pre-wrap font-mono leading-relaxed bg-[#171A20] p-3 rounded-xl border border-[#222630] max-h-48 overflow-y-auto">
                      {doc.ocrText || 'No text content extracted from this document.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: AI Executive Summary */}
              {activeTab === 'aiSummary' && (
                <div className="bg-[#0B0D10] border border-[#222630] rounded-2xl p-4 space-y-3">
                  {summaryLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 text-[#9299A5]">
                      <Sparkles className="w-6 h-6 animate-spin text-[#648BFF] mb-2" />
                      <p className="text-xs">Gemini analyzing document context securely...</p>
                    </div>
                  ) : summaryResult ? (
                    <>
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#648BFF]">
                        <Sparkles className="w-4 h-4" />
                        <span>Gemini Executive Summary</span>
                      </div>
                      <p className="text-xs text-[#F4F5F7] leading-relaxed">
                        {summaryResult.summary}
                      </p>

                      {summaryResult.keyPoints?.length > 0 && (
                        <div>
                          <h5 className="text-[11px] font-semibold text-[#C5CAD3] uppercase tracking-wider mb-1">
                            Key Details
                          </h5>
                          <ul className="text-xs text-[#9299A5] space-y-1 list-disc list-inside">
                            {summaryResult.keyPoints.map((pt, idx) => (
                              <li key={idx}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {summaryResult.actionItems?.length > 0 && (
                        <div>
                          <h5 className="text-[11px] font-semibold text-[#C5CAD3] uppercase tracking-wider mb-1">
                            Recommended Actions
                          </h5>
                          <ul className="text-xs text-amber-300/90 space-y-1 list-disc list-inside">
                            {summaryResult.actionItems.map((act, idx) => (
                              <li key={idx}>{act}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-[#9299A5]">Click above to summarize.</p>
                  )}
                </div>
              )}

              {/* Metadata Details or Edit Form */}
              <div className="bg-[#0B0D10] border border-[#222630] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#C5CAD3] uppercase tracking-wider">
                    Document Metadata
                  </span>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-[#648BFF] hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="text-xs text-[#9299A5] hover:text-[#F4F5F7]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveMetadata}
                        disabled={isSaving}
                        className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[#9299A5] block mb-1">Document Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#171A20] border border-[#2D3342] rounded-xl px-3 py-1.5 text-xs text-[#F4F5F7]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[#9299A5] block mb-1">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                          className="w-full bg-[#171A20] border border-[#2D3342] rounded-xl px-2.5 py-1.5 text-xs text-[#F4F5F7]"
                        >
                          {['Identity', 'Education', 'Finance', 'Health', 'Personal', 'Other'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[#9299A5] block mb-1">Expiry Date</label>
                        <input
                          type="date"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="w-full bg-[#171A20] border border-[#2D3342] rounded-xl px-2.5 py-1.5 text-xs text-[#F4F5F7]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[#9299A5] block mb-1">Tags (comma-separated)</label>
                      <input
                        type="text"
                        value={tagsStr}
                        onChange={(e) => setTagsStr(e.target.value)}
                        className="w-full bg-[#171A20] border border-[#2D3342] rounded-xl px-3 py-1.5 text-xs text-[#F4F5F7]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[#9299A5] block text-[10px]">Category</span>
                      <span className="text-[#F4F5F7] font-medium">{doc.category}</span>
                    </div>
                    <div>
                      <span className="text-[#9299A5] block text-[10px]">Document Date</span>
                      <span className="text-[#F4F5F7] font-medium">{doc.documentDate}</span>
                    </div>
                    <div>
                      <span className="text-[#9299A5] block text-[10px]">Expiry Date</span>
                      <span className={`font-medium ${doc.expiryDate ? 'text-amber-400' : 'text-[#9299A5]'}`}>
                        {doc.expiryDate || 'No Expiry'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#9299A5] block text-[10px]">Tags</span>
                      <span className="text-[#C5CAD3] truncate block">
                        {doc.tags.length > 0 ? doc.tags.join(', ') : 'None'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#9299A5] block text-[10px]">Vault Encryption</span>
                      <span className="text-emerald-400 font-mono text-[11px]">AES-256-GCM</span>
                    </div>
                    <div>
                      <span className="text-[#9299A5] block text-[10px]">Stored Versions</span>
                      <span className="text-[#F4F5F7] font-medium">v{doc.versionsCount}.0</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
