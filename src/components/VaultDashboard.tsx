import React from 'react';
import {
  FolderPlus,
  Bot,
  FolderLock,
  Layers,
  Lock,
  Clock,
  Star,
  Search,
  Plus,
} from 'lucide-react';
import { DocumentCategory, DocumentMetadata, UserProfile } from '../types';
import { DocumentCard } from './DocumentCard';
import { formatBytes } from '../utils/crypto';

interface VaultDashboardProps {
  user: UserProfile;
  documents: DocumentMetadata[];
  activeCategory: DocumentCategory | 'All';
  onSelectCategory: (cat: DocumentCategory | 'All') => void;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenDocument: (docId: string) => void;
  onToggleFavorite: (docId: string, isFav: boolean) => void;
  onOpenScanner: () => void;
  onOpenAssistant: () => void;
  expiryAlertCount: number;
}

export const VaultDashboard: React.FC<VaultDashboardProps> = ({
  user,
  documents,
  activeCategory,
  onSelectCategory,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  searchQuery,
  onSearchChange,
  onOpenDocument,
  onToggleFavorite,
  onOpenScanner,
  onOpenAssistant,
  expiryAlertCount,
}) => {
  const categories: (DocumentCategory | 'All')[] = [
    'All',
    'Identity',
    'Education',
    'Finance',
    'Health',
    'Personal',
    'Other',
  ];

  // Compute active categories count
  const activeCategoriesCount = new Set(documents.map((d) => d.category)).size;
  const totalStorageBytes = documents.reduce((sum, d) => sum + d.fileSize, 0);
  const favoritesCount = documents.filter((d) => d.isFavorite).length;

  const filteredDocs = documents.filter((doc) => {
    if (showFavoritesOnly && !doc.isFavorite) return false;
    if (activeCategory !== 'All' && doc.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inName = doc.name.toLowerCase().includes(q);
      const inTags = doc.tags.some((t) => t.toLowerCase().includes(q));
      const inDesc = (doc.description || '').toLowerCase().includes(q);
      const inOcr = (doc.ocrText || '').toLowerCase().includes(q);
      if (!inName && !inTags && !inDesc && !inOcr) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Welcome Banner Card (matching screenshot) */}
      <div className="bg-[#12151D] border border-[#1E2430] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#141A26] border border-[#263554] flex items-center justify-center text-[#648BFF] shadow-inner shrink-0">
            <FolderLock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F5F7]">
              Welcome, {user.fullName || 'Shirisha'}
            </h1>
            <p className="text-xs text-[#9299A5] mt-1">
              Zero-knowledge personal security wallet • AES-256-GCM encrypted
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenScanner}
            className="h-10 px-4 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-[#3B82F6]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Document</span>
          </button>
          <button
            onClick={onOpenAssistant}
            className="h-10 px-4 rounded-xl bg-[#181D26] hover:bg-[#222836] border border-[#2A3344] text-[#C5CAD3] hover:text-white text-xs font-medium flex items-center gap-2 transition-all"
          >
            <Bot className="w-4 h-4 text-[#648BFF]" />
            <span>AI Assistant</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards Row (matching screenshot) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Documents */}
        <div className="bg-[#12151D] border border-[#1E2430] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9299A5] text-xs">
            <span>Total Documents</span>
            <FolderLock className="w-4 h-4 text-[#648BFF]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F4F5F7] mt-3">
            {documents.length}
          </div>
        </div>

        {/* Active Categories */}
        <div className="bg-[#12151D] border border-[#1E2430] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9299A5] text-xs">
            <span>Active Categories</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F4F5F7] mt-3">
            {activeCategoriesCount}
          </div>
        </div>

        {/* Storage Encrypted */}
        <div className="bg-[#12151D] border border-[#1E2430] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9299A5] text-xs">
            <span>Storage Encrypted</span>
            <Lock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F4F5F7] mt-3">
            {totalStorageBytes === 0 ? '0.0 KB' : formatBytes(totalStorageBytes)}
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-[#12151D] border border-[#1E2430] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9299A5] text-xs">
            <span>Expiring Soon</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F4F5F7] mt-3">
            {expiryAlertCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar (matching screenshot) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat && !showFavoritesOnly;
            return (
              <button
                key={cat}
                onClick={() => {
                  if (showFavoritesOnly) onToggleFavoritesOnly();
                  onSelectCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#182133] border border-[#2B4272] text-[#648BFF]'
                    : 'bg-[#12151D] border border-[#1E2430] text-[#9299A5] hover:text-[#C5CAD3] hover:bg-[#161B24]'
                }`}
              >
                {cat}
              </button>
            );
          })}

          <button
            onClick={onToggleFavoritesOnly}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              showFavoritesOnly
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                : 'bg-[#12151D] border border-[#1E2430] text-[#9299A5] hover:text-[#C5CAD3]'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-amber-400' : ''}`} />
            <span>Favorites ({favoritesCount})</span>
          </button>
        </div>

        {/* Search input: Filter vault... */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-[#9299A5] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter vault..."
            className="w-full bg-[#12151D] border border-[#1E2430] focus:border-[#3B82F6] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#F4F5F7] placeholder-[#9299A5]/60 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Main Vault Content Area */}
      {filteredDocs.length === 0 ? (
        /* Empty State (exact replica from screenshot) */
        <div className="bg-[#12151D] border border-[#1E2430] rounded-2xl py-20 px-6 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#141A26] border border-[#263554] flex items-center justify-center text-[#648BFF] mb-4 shadow-inner">
            <FolderLock className="w-8 h-8" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#F4F5F7]">
            Your secure vault is ready.
          </h2>
          <p className="text-xs text-[#9299A5] max-w-md mt-1 mb-5 leading-relaxed">
            Your personal vault is fresh, empty, and isolated. Add your college certificates, marksheets, degrees, and identity proofs to get started. All documents are encrypted with AES-256-GCM.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <button
              onClick={onOpenScanner}
              className="px-4 py-2 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] active:scale-95 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-[#3B82F6]/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add College Certificate / Document</span>
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-[#9299A5]">
            <span>Quick add:</span>
            <button
              onClick={onOpenScanner}
              className="px-2 py-1 rounded-md bg-[#171A20] hover:bg-[#1E2430] border border-[#262D3D] text-[#C5CAD3] hover:text-[#648BFF] transition-colors"
            >
              🎓 College Degree / Diploma
            </button>
            <button
              onClick={onOpenScanner}
              className="px-2 py-1 rounded-md bg-[#171A20] hover:bg-[#1E2430] border border-[#262D3D] text-[#C5CAD3] hover:text-[#648BFF] transition-colors"
            >
              📜 Marksheets & Transcripts
            </button>
            <button
              onClick={onOpenScanner}
              className="px-2 py-1 rounded-md bg-[#171A20] hover:bg-[#1E2430] border border-[#262D3D] text-[#C5CAD3] hover:text-[#648BFF] transition-colors"
            >
              🪪 Identity Proof / Passport
            </button>
          </div>
        </div>
      ) : (
        /* Populated Documents Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredDocs.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onClick={() => onOpenDocument(doc.id)}
              onToggleFavorite={(e) => {
                e.stopPropagation();
                onToggleFavorite(doc.id, !doc.isFavorite);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
