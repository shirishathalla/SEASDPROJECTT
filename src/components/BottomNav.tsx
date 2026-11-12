import React from 'react';
import { Shield, Camera, Sparkles, Clock, Users, ShieldAlert } from 'lucide-react';

export type NavTab = 'vault' | 'scanner' | 'assistant' | 'expiry' | 'family' | 'security';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  expiryBadgeCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  expiryBadgeCount = 0,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'vault', label: 'Vault', icon: <Shield className="w-5 h-5" /> },
    { id: 'scanner', label: 'Scan', icon: <Camera className="w-5 h-5" /> },
    { id: 'assistant', label: 'AI Assistant', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'expiry', label: 'Expiry', icon: <Clock className="w-5 h-5" />, badge: expiryBadgeCount },
    { id: 'family', label: 'Family', icon: <Users className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <ShieldAlert className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#0B0D10]/95 backdrop-blur-md border-t border-[#222630] pb-safe">
      <div className="max-w-md md:max-w-xl mx-auto grid grid-cols-6 items-center h-16 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 transition-all relative ${
                isActive ? 'text-[#648BFF]' : 'text-[#9299A5] hover:text-[#C5CAD3]'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 whitespace-nowrap ${isActive ? 'font-semibold text-[#F4F5F7]' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 bg-[#648BFF] rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
