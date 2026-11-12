import React, { useState } from 'react';
import { User, Mail, Shield, Fingerprint, Lock, LogOut, Check, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdateAutoLock: (minutes: number) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onLogout,
  onUpdateAutoLock,
}) => {
  const [autoLockMin, setAutoLockMin] = useState<number>(user.autoLockMinutes || 5);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAutoLock(autoLockMin);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-5">
      {/* Profile Header */}
      <div className="bg-[#12151D] border border-[#1E2430] rounded-2xl p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#141A26] border border-[#263554] flex items-center justify-center text-xl font-bold text-[#648BFF] shadow-inner">
          {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'S'}
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#F4F5F7]">{user.fullName || 'Shirisha'}</h2>
          <p className="text-xs text-[#9299A5] flex items-center gap-1.5 mt-0.5 font-mono">
            <Mail className="w-3.5 h-3.5 text-[#648BFF]" />
            <span>{user.email}</span>
          </p>
          <span className="inline-block mt-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Verified Identity · Private Partition
          </span>
        </div>
      </div>

      {/* Vault Settings Form */}
      <div className="bg-[#12151D] border border-[#1E2430] rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-semibold text-[#C5CAD3] uppercase tracking-wider">
          Vault Security Preferences
        </h3>

        {savedSuccess && (
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Preferences saved successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="text-[#C5CAD3] block mb-1.5 font-medium">
              Inactivity Auto-Lock Period
            </label>
            <select
              value={autoLockMin}
              onChange={(e) => setAutoLockMin(parseInt(e.target.value))}
              className="w-full bg-[#0B0D10] border border-[#262D3D] rounded-xl px-3 py-2 text-xs text-[#F4F5F7]"
            >
              <option value={1}>1 Minute (Maximum Paranoia)</option>
              <option value={5}>5 Minutes (Recommended)</option>
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0D10] border border-[#1E2430]">
            <div className="flex items-center gap-2.5">
              <Fingerprint className="w-5 h-5 text-[#648BFF]" />
              <div>
                <p className="text-xs font-medium text-[#F4F5F7]">Biometric Unlock</p>
                <p className="text-[10px] text-[#9299A5]">Android BiometricPrompt / WebAuthn Platform Sensor</p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-semibold">Enabled</span>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold rounded-xl transition-all"
          >
            Save Preferences
          </button>
        </form>
      </div>

      {/* Sign Out Card */}
      <div className="bg-[#12151D] border border-[#1E2430] rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-[#F4F5F7]">End Current Session</h4>
          <p className="text-[11px] text-[#9299A5] mt-0.5">
            Safely encrypt and clear in-memory decryption keys from this device.
          </p>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
