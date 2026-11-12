import React from 'react';
import {
  FolderLock,
  Camera,
  Search,
  Bot,
  User,
  Clock,
  Heart,
  Users,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  HardDrive,
  Smartphone,
} from 'lucide-react';

export type SidebarTab =
  | 'vault'
  | 'scanner'
  | 'search'
  | 'assistant'
  | 'profile'
  | 'expiry'
  | 'health'
  | 'family'
  | 'emergency'
  | 'qr'
  | 'security'
  | 'backup';

interface SidebarProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  onOpenMobileAccess?: () => void;
  expiryBadgeCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenMobileAccess,
  expiryBadgeCount = 0,
}) => {
  const coreWalletNav = [
    { id: 'vault' as const, label: 'Vault', icon: <FolderLock className="w-4 h-4" /> },
    { id: 'scanner' as const, label: 'Add / Scan', icon: <Camera className="w-4 h-4" /> },
    { id: 'search' as const, label: 'Search & OCR', icon: <Search className="w-4 h-4" /> },
    { id: 'assistant' as const, label: 'AI Assistant', icon: <Bot className="w-4 h-4" /> },
    { id: 'profile' as const, label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  const securitySharingNav = [
    {
      id: 'expiry' as const,
      label: 'Expiry & Renewals',
      icon: <Clock className="w-4 h-4" />,
      badge: expiryBadgeCount,
    },
    { id: 'health' as const, label: 'Private Health Vault', icon: <Heart className="w-4 h-4" /> },
    { id: 'family' as const, label: 'Family Vault', icon: <Users className="w-4 h-4" /> },
    { id: 'emergency' as const, label: 'Emergency Access', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'qr' as const, label: 'Secure QR Share', icon: <QrCode className="w-4 h-4" /> },
    { id: 'security' as const, label: 'Security & Privacy', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'backup' as const, label: 'Backup & Storage', icon: <HardDrive className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-[#0B0D10] border-r border-[#1E232E] flex flex-col justify-between p-4 shrink-0 overflow-y-auto">
      <div>
        {/* CORE WALLET Section */}
        <div className="mb-6">
          <h4 className="text-[11px] font-semibold text-[#6E7687] uppercase tracking-wider px-3 mb-2">
            Core Wallet
          </h4>
          <nav className="space-y-1">
            {coreWalletNav.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#141A26] border border-[#2A3B66] text-[#648BFF] shadow-sm'
                      : 'text-[#9299A5] hover:text-[#F4F5F7] hover:bg-[#14171E] border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-[#648BFF]' : 'text-[#9299A5]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* SECURITY & SHARING Section */}
        <div className="mb-6">
          <h4 className="text-[11px] font-semibold text-[#6E7687] uppercase tracking-wider px-3 mb-2">
            Security & Sharing
          </h4>
          <nav className="space-y-1">
            {securitySharingNav.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#141A26] border border-[#2A3B66] text-[#648BFF] shadow-sm'
                      : 'text-[#9299A5] hover:text-[#F4F5F7] hover:bg-[#14171E] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-[#648BFF]' : 'text-[#9299A5]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className="bg-rose-500/20 text-rose-400 font-mono text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Device QR Link Card */}
      {onOpenMobileAccess && (
        <div className="pt-4 border-t border-[#1E232E]">
          <button
            onClick={onOpenMobileAccess}
            className="w-full p-3 rounded-2xl bg-[#141A26] hover:bg-[#1A2333] border border-[#263554] text-left transition-all group"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-[#648BFF] mb-1">
              <Smartphone className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Open on Mobile</span>
            </div>
            <p className="text-[11px] text-[#9299A5]">
              Scan QR code with your phone camera to run DocuVault natively.
            </p>
          </button>
        </div>
      )}
    </aside>
  );
};
