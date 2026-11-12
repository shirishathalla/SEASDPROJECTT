import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar, SidebarTab } from './components/Sidebar';
import { VaultDashboard } from './components/VaultDashboard';
import { AuthModal } from './components/AuthModal';
import { PinLockScreen } from './components/PinLockScreen';
import { DocumentDetailModal } from './components/DocumentDetailModal';
import { DocumentScannerModal } from './components/DocumentScannerModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { ExpiryDashboard } from './components/ExpiryDashboard';
import { FamilyVaultView } from './components/FamilyVaultView';
import { SecurityDashboard } from './components/SecurityDashboard';
import { QRShareModal } from './components/QRShareModal';
import { SearchAndOCRView } from './components/SearchAndOCRView';
import { ProfileView } from './components/ProfileView';
import { BackupView } from './components/BackupView';
import { MobileAccessModal } from './components/MobileAccessModal';
import { DocumentMetadata, DocumentCategory, UserProfile } from './types';
import { api, getUserSessionEmail, getUserSessionName, setUserSession } from './services/api';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedEmail = getUserSessionEmail();
    const savedName = getUserSessionName();
    if (savedEmail) {
      return {
        id: 'usr_' + savedEmail.replace(/[^a-z0-9]/gi, '_'),
        fullName: savedName || (savedEmail === 'siriilu21@gmail.com' ? 'Shirisha' : savedEmail.split('@')[0]),
        email: savedEmail,
        biometricEnabled: true,
        autoLockMinutes: 5,
      };
    }
    return null;
  });

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>('vault');

  // Documents state
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | 'All'>('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expiryAlertCount, setExpiryAlertCount] = useState<number>(0);

  // Modals state
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState<boolean>(false);
  const [assistantModalOpen, setAssistantModalOpen] = useState<boolean>(false);
  const [qrShareDoc, setQrShareDoc] = useState<DocumentMetadata | null>(null);
  const [mobileAccessModalOpen, setMobileAccessModalOpen] = useState<boolean>(false);

  // Auto-lock timer
  const autoLockTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user && !isLocked) {
      loadDocuments();
      loadExpiryCount();
    }
  }, [user, isLocked, activeCategory, showFavoritesOnly, searchQuery]);

  const loadDocuments = async () => {
    try {
      const res = await api.getDocuments({
        category: activeCategory !== 'All' ? activeCategory : undefined,
        favorite: showFavoritesOnly ? true : undefined,
        q: searchQuery.trim() ? searchQuery.trim() : undefined,
      });
      setDocuments(res.documents || []);
    } catch (err) {
      console.warn('Initial document load:', err);
    }
  };

  const loadExpiryCount = async () => {
    try {
      const res = await api.getExpiryAlerts();
      const urgent = (res.alerts || []).filter((a) =>
        ['expiring_1', 'expiring_7', 'expiring_15', 'expired'].includes(a.status)
      );
      setExpiryAlertCount(urgent.length);
    } catch (err) {
      console.warn('Failed to load expiry count:', err);
    }
  };

  const handleAuthenticated = (newUser: UserProfile) => {
    setUserSession(newUser.email, newUser.fullName);
    setUser(newUser);
    setIsLocked(false);
  };

  // Proper working Sign Out: clears session, user, and locked state, showing AuthModal
  const handleLogout = () => {
    setUserSession('', '');
    setUser(null);
    setIsLocked(false);
    setDocuments([]);
  };

  const handleToggleFavorite = async (docId: string, isFav: boolean) => {
    try {
      await api.updateDocument(docId, { isFavorite: isFav });
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, isFavorite: isFav } : d))
      );
    } catch (err) {
      console.error('Failed to update favorite status:', err);
    }
  };

  // If no user is logged in, show Auth Screen
  if (!user) {
    return <AuthModal onAuthenticated={handleAuthenticated} />;
  }

  // If vault is locked, show 6-digit PIN screen with Forgot PIN option
  if (isLocked) {
    return (
      <PinLockScreen
        email={user.email}
        fullName={user.fullName}
        biometricEnabled={user.biometricEnabled}
        onUnlocked={() => setIsLocked(false)}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F4F5F7] flex flex-col antialiased selection:bg-[#3B82F6]/30 selection:text-white">
      {/* Top Header matching screenshot */}
      <Header
        user={user}
        isLocked={isLocked}
        onLockVault={() => setIsLocked(true)}
        onLogout={handleLogout}
        onOpenProfile={() => setActiveTab('profile')}
        onOpenMobileAccess={() => setMobileAccessModalOpen(true)}
        totalDocsCount={documents.length}
      />

      {/* Main Layout: Left Sidebar + Right Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'scanner') {
              setScannerOpen(true);
            } else if (tab === 'assistant') {
              setAssistantModalOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          onOpenMobileAccess={() => setMobileAccessModalOpen(true)}
          expiryBadgeCount={expiryAlertCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0B0D10]">
          <div className="max-w-6xl mx-auto">
            {/* Active Tab: Vault Dashboard */}
            {activeTab === 'vault' && (
              <VaultDashboard
                user={user}
                documents={documents}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                showFavoritesOnly={showFavoritesOnly}
                onToggleFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenDocument={(id) => setSelectedDocId(id)}
                onToggleFavorite={handleToggleFavorite}
                onOpenScanner={() => setScannerOpen(true)}
                onOpenAssistant={() => setAssistantModalOpen(true)}
                expiryAlertCount={expiryAlertCount}
              />
            )}

            {/* Active Tab: Search & OCR */}
            {activeTab === 'search' && (
              <SearchAndOCRView
                documents={documents}
                onOpenDocument={(id) => setSelectedDocId(id)}
              />
            )}

            {/* Active Tab: Profile */}
            {activeTab === 'profile' && (
              <ProfileView
                user={user}
                onLogout={handleLogout}
                onUpdateAutoLock={(min) => {
                  setUser({ ...user, autoLockMinutes: min });
                }}
              />
            )}

            {/* Active Tab: Expiry & Renewals */}
            {activeTab === 'expiry' && (
              <ExpiryDashboard onOpenDocument={(id) => setSelectedDocId(id)} />
            )}

            {/* Active Tab: Private Health Vault */}
            {activeTab === 'health' && (
              <VaultDashboard
                user={user}
                documents={documents.filter((d) => d.category === 'Health')}
                activeCategory="Health"
                onSelectCategory={() => {}}
                showFavoritesOnly={showFavoritesOnly}
                onToggleFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenDocument={(id) => setSelectedDocId(id)}
                onToggleFavorite={handleToggleFavorite}
                onOpenScanner={() => setScannerOpen(true)}
                onOpenAssistant={() => setAssistantModalOpen(true)}
                expiryAlertCount={expiryAlertCount}
              />
            )}

            {/* Active Tab: Family Vault */}
            {activeTab === 'family' && (
              <FamilyVaultView
                documents={documents}
                onOpenDocument={(id) => setSelectedDocId(id)}
              />
            )}

            {/* Active Tab: Emergency Access */}
            {activeTab === 'emergency' && (
              <SecurityDashboard onOpenEmergencyModal={() => {}} />
            )}

            {/* Active Tab: Secure QR Share */}
            {activeTab === 'qr' && (
              <div className="bg-[#12151D] border border-[#1E2430] rounded-2xl p-6">
                <h3 className="text-sm font-bold text-[#F4F5F7] mb-2">
                  Secure QR Code Sharing
                </h3>
                <p className="text-xs text-[#9299A5] mb-4">
                  Select any document from your vault to generate an ephemeral, time-limited QR access token with optional passphrase protection.
                </p>
                {documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {documents.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setQrShareDoc(d)}
                        className="p-3.5 bg-[#171A20] hover:bg-[#1E2430] border border-[#262D3D] rounded-xl text-left transition-colors flex items-center justify-between"
                      >
                        <span className="text-xs font-semibold text-[#F4F5F7] truncate">{d.name}</span>
                        <span className="text-[11px] text-[#3B82F6] font-medium shrink-0">Generate QR →</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#9299A5]">Please add documents to your vault first.</p>
                )}
              </div>
            )}

            {/* Active Tab: Security & Privacy */}
            {activeTab === 'security' && (
              <SecurityDashboard onOpenEmergencyModal={() => {}} />
            )}

            {/* Active Tab: Backup & Storage */}
            {activeTab === 'backup' && (
              <BackupView
                documents={documents}
                onRefreshDocs={loadDocuments}
              />
            )}
          </div>
        </main>
      </div>

      {/* Document Detail Modal */}
      {selectedDocId && (
        <DocumentDetailModal
          documentId={selectedDocId}
          onClose={() => setSelectedDocId(null)}
          onDocumentUpdated={() => {
            loadDocuments();
            loadExpiryCount();
          }}
          onDocumentDeleted={() => {
            loadDocuments();
            loadExpiryCount();
            setSelectedDocId(null);
          }}
          onOpenQRShare={(doc) => setQrShareDoc(doc)}
        />
      )}

      {/* Scanner / Upload Modal */}
      {scannerOpen && (
        <DocumentScannerModal
          onClose={() => setScannerOpen(false)}
          onDocumentSaved={() => {
            loadDocuments();
            loadExpiryCount();
            setScannerOpen(false);
          }}
        />
      )}

      {/* AI Assistant Modal */}
      {assistantModalOpen && (
        <AIAssistantModal
          onClose={() => setAssistantModalOpen(false)}
          onOpenDocument={(id) => {
            setAssistantModalOpen(false);
            setSelectedDocId(id);
          }}
        />
      )}

      {/* QR Share Modal */}
      {qrShareDoc && (
        <QRShareModal
          document={qrShareDoc}
          onClose={() => setQrShareDoc(null)}
        />
      )}

      {/* Mobile Access Modal (QR Code & Direct Phone URL) */}
      {mobileAccessModalOpen && (
        <MobileAccessModal
          onClose={() => setMobileAccessModalOpen(false)}
        />
      )}
    </div>
  );
}
