import React, { useState, useEffect } from 'react';
import { Shield, Lock, Bell, User, Clock, GraduationCap, Smartphone, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  isLocked: boolean;
  onLockVault: () => void;
  onLogout: () => void;
  onOpenProfile?: () => void;
  onOpenMobileAccess: () => void;
  totalDocsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isLocked,
  onLockVault,
  onLogout,
  onOpenProfile,
  onOpenMobileAccess,
  totalDocsCount,
}) => {
  // 5:00 countdown timer display
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);

  useEffect(() => {
    if (!user || isLocked) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          onLockVault();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    const resetTimer = () => setSecondsRemaining(300);
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [user, isLocked, onLockVault]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <header className="bg-[#0B0D10] border-b border-[#1E232E] px-4 md:px-6 py-3 flex items-center justify-between gap-4">
      {/* Brand Section */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#141822] border border-[#262D3D] flex items-center justify-center text-[#648BFF] shadow-sm">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-[#F4F5F7]">
              DocuVault
            </span>
            <span className="text-[10px] font-mono text-[#9299A5] bg-[#171A20] px-1.5 py-0.5 rounded border border-[#2D3342]">
              AES-256
            </span>
          </div>
          <p className="text-[11px] text-[#9299A5] hidden sm:block">
            Carry your identity securely, not your documents.
          </p>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Mobile View QR Button */}
        <button
          onClick={onOpenMobileAccess}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#182133] hover:bg-[#202c44] border border-[#2B4272] text-xs font-medium text-[#648BFF] hover:text-white transition-colors"
          title="Scan QR to open this app on your mobile phone"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Mobile QR</span>
        </button>

        {/* Academic Demo / Mode Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#171A20] border border-[#262D3D] text-[11px] text-[#C5CAD3]">
          <GraduationCap className="w-3.5 h-3.5 text-[#648BFF]" />
          <span>Academic Demo: {totalDocsCount === 0 ? 'Empty Vault' : `${totalDocsCount} Encrypted Documents`}</span>
        </div>

        {user && !isLocked && (
          <>
            {/* Auto-Lock Countdown & Lock Button */}
            <button
              onClick={onLockVault}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#171A20] hover:bg-[#222630] border border-[#262D3D] text-xs font-mono text-[#C5CAD3] hover:text-[#F4F5F7] transition-colors"
              title="Click to lock personal vault immediately"
            >
              <Clock className="w-3.5 h-3.5 text-[#648BFF]" />
              <span>{formatTimer(secondsRemaining)}</span>
              <span className="text-[#9299A5]">|</span>
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-rose-400 font-sans font-medium">Lock</span>
            </button>

            {/* Notification Bell */}
            <button
              className="w-9 h-9 rounded-xl bg-[#171A20] hover:bg-[#222630] border border-[#262D3D] flex items-center justify-center text-[#9299A5] hover:text-[#F4F5F7] transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* User Profile Pill */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#171A20] hover:bg-[#222630] border border-[#262D3D] text-xs font-medium text-[#F4F5F7] transition-colors"
              title="Open Profile Settings"
            >
              <div className="w-5 h-5 rounded-full bg-[#222630] border border-[#2D3342] flex items-center justify-center text-[11px] text-[#648BFF]">
                <User className="w-3 h-3" />
              </div>
              <span>{user.fullName || 'Shirisha'}</span>
            </button>

            {/* Explicit Sign Out Button */}
            <button
              onClick={onLogout}
              className="p-2 text-[#9299A5] hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              title="Sign Out of DocuVault"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
