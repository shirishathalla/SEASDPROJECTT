import React, { useState } from 'react';
import { QrCode, X, Copy, Check, Clock, Lock, ShieldAlert, AlertCircle, RefreshCw } from 'lucide-react';
import { DocumentMetadata } from '../types';
import { api } from '../services/api';

interface QRShareModalProps {
  document: DocumentMetadata;
  onClose: () => void;
}

export const QRShareModal: React.FC<QRShareModalProps> = ({
  document,
  onClose,
}) => {
  const [expirationMinutes, setExpirationMinutes] = useState<number>(15);
  const [password, setPassword] = useState<string>('');
  const [permissions, setPermissions] = useState<'view' | 'download'>('view');

  const [loading, setLoading] = useState<boolean>(false);
  const [qrResult, setQrResult] = useState<{
    qrDataUrl: string;
    shareUrl: string;
    expiresAt: string;
    token: string;
  } | null>(null);

  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleGenerateQR = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.createQRShare({
        documentId: document.id,
        expirationMinutes,
        password: password.trim() ? password.trim() : undefined,
        permissions,
      });

      setQrResult({
        qrDataUrl: res.qrDataUrl,
        shareUrl: res.shareUrl,
        expiresAt: res.expiresAt,
        token: res.qrRecord.token,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR share');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!qrResult) return;
    navigator.clipboard.writeText(qrResult.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async () => {
    if (!qrResult) return;
    try {
      await api.revokeQRShare(qrResult.token);
      alert('QR Link revoked immediately.');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to revoke QR share');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#171A20] border border-[#222630] rounded-3xl w-full max-w-md flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#222630] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#222630] border border-[#2D3342] flex items-center justify-center text-[#648BFF]">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F4F5F7]">Secure QR Sharing</h3>
              <p className="text-[11px] text-[#9299A5] truncate max-w-[200px]">
                {document.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#9299A5] hover:text-[#F4F5F7] rounded-xl hover:bg-[#222630] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {error && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 p-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {!qrResult ? (
            <div className="space-y-3.5">
              <div>
                <label className="text-[#C5CAD3] block mb-1 font-medium">Link Expiration</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '5 min', mins: 5 },
                    { label: '15 min', mins: 15 },
                    { label: '1 hour', mins: 60 },
                    { label: '24 hours', mins: 1440 },
                  ].map(opt => (
                    <button
                      key={opt.mins}
                      type="button"
                      onClick={() => setExpirationMinutes(opt.mins)}
                      className={`py-2 rounded-xl border text-center transition-all ${
                        expirationMinutes === opt.mins
                          ? 'bg-[#648BFF]/20 border-[#648BFF] text-[#648BFF] font-semibold'
                          : 'bg-[#0B0D10] border-[#222630] text-[#9299A5] hover:text-[#C5CAD3]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[#C5CAD3] block mb-1 font-medium">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPermissions('view')}
                    className={`py-2 rounded-xl border text-center transition-all ${
                      permissions === 'view'
                        ? 'bg-[#648BFF]/20 border-[#648BFF] text-[#648BFF] font-semibold'
                        : 'bg-[#0B0D10] border-[#222630] text-[#9299A5]'
                    }`}
                  >
                    View Only (No Download)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPermissions('download')}
                    className={`py-2 rounded-xl border text-center transition-all ${
                      permissions === 'download'
                        ? 'bg-[#648BFF]/20 border-[#648BFF] text-[#648BFF] font-semibold'
                        : 'bg-[#0B0D10] border-[#222630] text-[#9299A5]'
                    }`}
                  >
                    Allow Download
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[#C5CAD3] block mb-1 font-medium">Optional Security Passphrase</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#9299A5] absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank for open temporary access"
                    className="w-full bg-[#0B0D10] border border-[#2D3342] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F4F5F7] focus:outline-none focus:border-[#648BFF]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateQR}
                disabled={loading}
                className="w-full h-11 rounded-xl bg-[#648BFF] hover:bg-[#5279f0] text-white font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Generate Secure Temporary QR'}
              </button>
            </div>
          ) : (
            <div className="space-y-4 flex flex-col items-center">
              {/* QR Image Box */}
              <div className="bg-white p-3 rounded-2xl shadow-xl">
                <img
                  src={qrResult.qrDataUrl}
                  alt="Secure QR Code"
                  className="w-48 h-48 rounded-lg"
                />
              </div>

              <div className="text-center">
                <span className="text-[11px] text-amber-300 flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Expires at {new Date(qrResult.expiresAt).toLocaleTimeString()}</span>
                </span>
                <p className="text-[10px] text-[#9299A5] mt-1 font-mono break-all px-2">
                  {qrResult.shareUrl}
                </p>
              </div>

              <div className="flex gap-2 w-full">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-2.5 bg-[#222630] hover:bg-[#2D3342] rounded-xl font-medium text-xs text-[#F4F5F7] flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#648BFF]" />}
                  <span>{copied ? 'Link Copied' : 'Copy Share Link'}</span>
                </button>
                <button
                  onClick={handleRevoke}
                  className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl font-medium text-xs transition-colors"
                >
                  Revoke Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
