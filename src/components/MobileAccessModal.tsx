import React, { useState, useEffect } from 'react';
import { X, Smartphone, QrCode, Copy, Check, ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

interface MobileAccessModalProps {
  onClose: () => void;
}

export const MobileAccessModal: React.FC<MobileAccessModalProps> = ({ onClose }) => {
  const [appUrl, setAppUrl] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    loadAccess();
  }, []);

  const loadAccess = async () => {
    setLoading(true);
    try {
      const res = await api.getMobileAccess();
      setAppUrl(res.appUrl);
      setQrDataUrl(res.qrDataUrl);
    } catch {
      // Fallback to client window location
      const fallbackUrl = window.location.origin;
      setAppUrl(fallbackUrl);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#171A20] border border-[#222630] rounded-3xl w-full max-w-md flex flex-col shadow-2xl relative overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-[#222630] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#222630] border border-[#2D3342] flex items-center justify-center text-[#648BFF]">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F4F5F7]">Open DocuVault on Mobile</h3>
              <p className="text-[11px] text-[#9299A5]">
                Scan QR or copy link to access on your phone
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

        {/* Modal Body */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center text-xs text-[#9299A5]">
              <RefreshCw className="w-6 h-6 animate-spin text-[#648BFF] mb-2" />
              <span>Generating live mobile QR code...</span>
            </div>
          ) : (
            <>
              {/* QR Code Container */}
              <div className="bg-white p-4 rounded-2xl shadow-xl border border-white/20">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="DocuVault Mobile QR"
                    className="w-52 h-52 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-slate-800">
                    <QrCode className="w-24 h-24" />
                  </div>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-[#F4F5F7] block">
                  Scan with your smartphone camera
                </span>
                <p className="text-[11px] text-[#9299A5] mt-1 max-w-xs">
                  Point your Android or iPhone camera at this QR code to launch DocuVault instantly in your mobile browser.
                </p>
              </div>

              {/* Direct Link & Copy */}
              <div className="w-full bg-[#0B0D10] border border-[#222630] rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
                <span className="font-mono text-[#648BFF] truncate max-w-[240px] text-left text-[11px]">
                  {appUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-[#222630] hover:bg-[#2D3342] text-[#F4F5F7] text-[11px] font-medium flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#648BFF]" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Troubleshooting Google 403 Forbidden on Mobile */}
              <div className="p-3.5 bg-[#171D28] border border-[#253552] rounded-2xl text-left w-full text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>Fixing Google 403 Forbidden on Phone:</span>
                </div>
                <div className="text-[11px] text-[#C5CAD3] space-y-1.5">
                  <p>
                    If your phone shows <strong className="text-rose-400">403 Forbidden</strong> from Google Cloud Run, apply either fix:
                  </p>
                  <div className="p-2 bg-[#0B0D10] border border-[#1E2738] rounded-xl space-y-1">
                    <span className="font-semibold text-emerald-400 block text-[11px]">
                      Method 1: Click "Publish" or "Share" in AI Studio
                    </span>
                    <p className="text-[10px] text-[#9299A5]">
                      At the top-right corner of this screen (right next to <em>Remix</em>), click <strong>Publish</strong> or <strong>Share</strong>. This removes Google account authentication so your phone opens the app immediately without 403 errors!
                    </p>
                  </div>
                  <div className="p-2 bg-[#0B0D10] border border-[#1E2738] rounded-xl space-y-1">
                    <span className="font-semibold text-[#648BFF] block text-[11px]">
                      Method 2: Sign into Google on your phone
                    </span>
                    <p className="text-[10px] text-[#9299A5]">
                      Ensure your phone’s Chrome or Safari browser is logged into <strong className="text-[#F4F5F7]">siriilu21@gmail.com</strong> (the Google account owning this project).
                    </p>
                  </div>
                </div>
              </div>

              {/* Native PWA Note */}
              <div className="p-3 bg-[#12151D] border border-[#1E2430] rounded-xl text-left w-full text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Install as Native Mobile Wallet:</span>
                </div>
                <p className="text-[#9299A5]">
                  Once opened in your phone browser, tap the browser menu (⋮ or Share) and choose <strong>"Add to Home Screen"</strong> to run DocuVault full-screen like a native mobile app!
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
