import React from 'react';
import { FileText, Star, ShieldCheck, Heart, FileCode2, GraduationCap, DollarSign, UserCheck } from 'lucide-react';
import { DocumentMetadata, DocumentCategory } from '../types';
import { formatBytes, truncateHash } from '../utils/crypto';

interface DocumentCardProps {
  document: DocumentMetadata;
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

const categoryIcons: Record<DocumentCategory, React.ReactNode> = {
  Identity: <UserCheck className="w-4 h-4 text-[#648BFF]" />,
  Education: <GraduationCap className="w-4 h-4 text-emerald-400" />,
  Finance: <DollarSign className="w-4 h-4 text-amber-400" />,
  Health: <Heart className="w-4 h-4 text-rose-400" />,
  Personal: <FileText className="w-4 h-4 text-purple-400" />,
  Other: <FileCode2 className="w-4 h-4 text-[#9299A5]" />,
};

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onClick,
  onToggleFavorite,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      className="group bg-[#171A20] hover:bg-[#222630] border border-[#222630] hover:border-[#2D3342] rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between text-left relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#648BFF]"
    >
      {/* Top Row: Category icon and Favorite button */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#222630] border border-[#2D3342] flex items-center justify-center">
              {categoryIcons[document.category]}
            </div>
            {/* Clean unboxed category label */}
            <span className="text-xs font-medium text-[#C5CAD3]">
              {document.category}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleFavorite}
            className={`p-1.5 rounded-lg transition-colors ${
              document.isFavorite
                ? 'text-amber-400 hover:text-amber-300'
                : 'text-[#9299A5]/60 hover:text-amber-400'
            }`}
            title={document.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${document.isFavorite ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[#F4F5F7] group-hover:text-white line-clamp-1 mb-1">
          {document.name}
        </h3>

        {/* Optional Description / OCR snippet */}
        {document.description ? (
          <p className="text-xs text-[#9299A5] line-clamp-1 mb-3">
            {document.description}
          </p>
        ) : (
          <p className="text-xs text-[#9299A5]/70 line-clamp-1 mb-3">
            {document.tags.length > 0 ? document.tags.join(', ') : 'No notes attached'}
          </p>
        )}
      </div>

      {/* Bottom Metadata: Clean unboxed text with typographic dot separators */}
      <div className="pt-3 border-t border-[#222630] flex items-center justify-between text-[11px] text-[#9299A5]">
        <div className="flex items-center gap-1.5 truncate">
          <span>{document.documentDate}</span>
          <span aria-hidden="true">·</span>
          <span>{formatBytes(document.fileSize)}</span>
          {document.expiryDate && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400">Exp {document.expiryDate}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 font-mono text-[10px] text-[#648BFF]" title={`SHA-256: ${document.sha256Checksum}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{truncateHash(document.sha256Checksum, 8)}</span>
        </div>
      </div>
    </div>
  );
};
