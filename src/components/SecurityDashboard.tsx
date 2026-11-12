import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Fingerprint, Clock, Download, RefreshCw, Key, ShieldAlert, AlertCircle, FileCheck, Check, History, PhoneCall, Trash2 } from 'lucide-react';
import { SecurityStatus, AuditLog, EmergencyContact } from '../types';
import { api } from '../services/api';
import { formatBytes } from '../utils/crypto';

interface SecurityDashboardProps {
  onOpenEmergencyModal: () => void;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  onOpenEmergencyModal,
}) => {
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'emergency'>('overview');

  // Emergency contact form
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [relationship, setRelationship] = useState<string>('Spouse');
  const [addingContact, setAddingContact] = useState<boolean>(false);
  const [contactSuccess, setContactSuccess] = useState<string>('');

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      const [stRes, lgRes, emRes] = await Promise.all([
        api.getSecurityStatus(),
        api.getAuditLogs(),
        api.getEmergencyContacts(),
      ]);
      setStatus(stRes.status);
      setLogs(lgRes.logs || []);
      setContacts(emRes.contacts || []);
    } catch (err) {
      console.error('Failed to load security status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmergencyContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail) return;
    setAddingContact(true);
    setContactSuccess('');
    try {
      const res = await api.addEmergencyContact({
        contactName,
        contactEmail,
        relationship,
        accessibleDocIds: [],
      });
      setContacts(prev => [...prev, res.contact]);
      setContactName('');
      setContactEmail('');
      setContactSuccess('Trusted emergency contact registered.');
    } catch (err: any) {
      alert(err.message || 'Failed to add emergency contact');
    } finally {
      setAddingContact(false);
    }
  };

  const handleRemoveEmergencyContact = async (id: string) => {
    try {
      await api.removeEmergencyContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to remove contact');
    }
  };

  return (
    <div className="space-y-5">
      {/* Tab Switcher */}
      <div className="flex p-1 bg-[#171A20] rounded-xl border border-[#222630] text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 font-medium rounded-lg transition-all ${
            activeTab === 'overview' ? 'bg-[#222630] text-[#F4F5F7]' : 'text-[#9299A5] hover:text-[#C5CAD3]'
          }`}
        >
          Security Posture
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-2 font-medium rounded-lg transition-all ${
            activeTab === 'audit' ? 'bg-[#222630] text-[#F4F5F7]' : 'text-[#9299A5] hover:text-[#C5CAD3]'
          }`}
        >
          Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('emergency')}
          className={`flex-1 py-2 font-medium rounded-lg transition-all ${
            activeTab === 'emergency' ? 'bg-[#222630] text-[#F4F5F7]' : 'text-[#9299A5] hover:text-[#C5CAD3]'
          }`}
        >
          Emergency Access ({contacts.length})
        </button>
      </div>

      {activeTab === 'overview' && status && (
        <div className="space-y-4">
          {/* Security Score Banner */}
          <div className="bg-[#171A20] border border-[#222630] rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#222630] border border-[#2D3342] flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F4F5F7]">
                  Vault Security Health Score
                </h3>
                <p className="text-xs text-[#9299A5]">
                  Military-grade AES-256-GCM encryption & SHA-256 integrity checks active
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold font-mono text-emerald-400">
                {status.securityHealthScore}%
              </span>
              <span className="text-[10px] text-[#9299A5] block">Optimal Posture</span>
            </div>
          </div>

          {/* Cryptographic Standard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#171A20] border border-[#222630] rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-[#648BFF] font-semibold">
                <Lock className="w-4 h-4" />
                <span>Payload Encryption</span>
              </div>
              <p className="text-[#C5CAD3]">
                Authenticated <strong className="text-[#F4F5F7] font-mono">AES-256-GCM</strong> with 96-bit random initialization vectors per document.
              </p>
              <span className="text-[10px] font-mono text-emerald-400 block">Status: Active & Enforced</span>
            </div>

            <div className="bg-[#171A20] border border-[#222630] rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-[#648BFF] font-semibold">
                <Key className="w-4 h-4" />
                <span>Key Derivation</span>
              </div>
              <p className="text-[#C5CAD3]">
                <strong className="text-[#F4F5F7] font-mono">PBKDF2-HMAC-SHA256</strong> with 100,000 computational iterations and cryptographically secure random salt.
              </p>
              <span className="text-[10px] font-mono text-emerald-400 block">Status: Hardened against brute-force</span>
            </div>

            <div className="bg-[#171A20] border border-[#222630] rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-[#648BFF] font-semibold">
                <FileCheck className="w-4 h-4" />
                <span>File Integrity</span>
              </div>
              <p className="text-[#C5CAD3]">
                Cryptographic <strong className="text-[#F4F5F7] font-mono">SHA-256</strong> hash generated during ingestion and recalculated upon each decryption.
              </p>
              <span className="text-[10px] font-mono text-emerald-400 block">Status: Tamper-evident</span>
            </div>

            <div className="bg-[#171A20] border border-[#222630] rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-[#648BFF] font-semibold">
                <Fingerprint className="w-4 h-4" />
                <span>Biometrics & PIN</span>
              </div>
              <p className="text-[#C5CAD3]">
                Hardware-backed Android BiometricPrompt & WebAuthn credentials paired with 6-digit PIN fallback.
              </p>
              <span className="text-[10px] font-mono text-emerald-400 block">Status: {status.biometricsEnrolled ? 'Enrolled' : 'Available'}</span>
            </div>
          </div>

          {/* Storage & Live Metrics */}
          <div className="bg-[#171A20] border border-[#222630] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-[#9299A5] block">Total Encrypted Storage</span>
              <span className="text-base font-bold font-mono text-[#F4F5F7]">
                {formatBytes(status.storageUsedBytes)} ({status.totalDocuments} items)
              </span>
            </div>
            <div>
              <span className="text-[#9299A5] block">Auto-Lock Inactivity</span>
              <span className="text-base font-bold font-mono text-[#F4F5F7]">
                {status.autoLockMinutes} minutes
              </span>
            </div>
            <div>
              <span className="text-[#9299A5] block">Active QR Tokens</span>
              <span className="text-base font-bold font-mono text-[#648BFF]">
                {status.activeQRShares} active
              </span>
            </div>
            <div>
              <span className="text-[#9299A5] block">Emergency Contacts</span>
              <span className="text-base font-bold font-mono text-amber-400">
                {status.trustedEmergencyContacts} designated
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-[#171A20] border border-[#222630] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#F4F5F7]">
                Immutable Cryptographic Audit Trail
              </h3>
              <p className="text-xs text-[#9299A5]">
                Every decryption, upload, and sharing authorization is logged with timestamps and device telemetry.
              </p>
            </div>
            <button
              onClick={loadSecurityData}
              className="p-2 text-[#9299A5] hover:text-[#F4F5F7] rounded-xl bg-[#222630] hover:bg-[#2D3342] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-[#0B0D10] border border-[#222630] rounded-xl overflow-hidden max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-xs text-[#9299A5] p-6 text-center">No audit activity logged yet.</p>
            ) : (
              <div className="divide-y divide-[#222630] text-xs">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 hover:bg-[#171A20]/60 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-semibold text-[#648BFF]">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-[#9299A5] font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#C5CAD3] mt-1">{log.details}</p>
                    <div className="flex items-center gap-2 text-[10px] text-[#9299A5] mt-1 font-mono">
                      <span>IP: {log.ipAddress}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate max-w-[200px]">{log.userAgent}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Emergency Access */}
      {activeTab === 'emergency' && (
        <div className="space-y-4">
          <div className="bg-[#171A20] border border-[#222630] rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#F4F5F7]">
                Trusted Emergency Contacts
              </h3>
              <p className="text-xs text-[#9299A5] mt-0.5">
                Designate trusted individuals (e.g. spouse, attorney, doctor) who can request time-limited access to critical medical cards, insurance policies, or legal documents in emergency situations.
              </p>
            </div>

            {contactSuccess && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{contactSuccess}</span>
              </div>
            )}

            {/* Add Contact Form */}
            <form onSubmit={handleAddEmergencyContact} className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Full Name"
                className="bg-[#0B0D10] border border-[#2D3342] rounded-xl px-3 py-2 text-xs text-[#F4F5F7]"
              />
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="email@example.com"
                className="bg-[#0B0D10] border border-[#2D3342] rounded-xl px-3 py-2 text-xs text-[#F4F5F7]"
              />
              <div className="flex gap-2">
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="bg-[#0B0D10] border border-[#2D3342] rounded-xl px-2 py-2 text-xs text-[#F4F5F7] flex-1"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Physician">Physician</option>
                  <option value="Legal Attorney">Legal Attorney</option>
                  <option value="Other">Other</option>
                </select>
                <button
                  type="submit"
                  disabled={addingContact || !contactName || !contactEmail}
                  className="px-3 py-2 bg-[#648BFF] hover:bg-[#5279f0] text-white font-semibold text-xs rounded-xl transition-all disabled:opacity-40 whitespace-nowrap"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>

          {/* Contacts List */}
          <div className="bg-[#171A20] border border-[#222630] rounded-2xl p-5">
            <h4 className="text-xs font-semibold text-[#C5CAD3] uppercase tracking-wider mb-3">
              Designated Emergency Guardians
            </h4>

            {contacts.length === 0 ? (
              <p className="text-xs text-[#9299A5] text-center py-6">
                No emergency contacts designated yet. Add someone you trust above.
              </p>
            ) : (
              <div className="divide-y divide-[#222630] text-xs">
                {contacts.map((contact) => (
                  <div key={contact.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#F4F5F7]">{contact.contactName}</span>
                        <span className="text-[10px] text-[#648BFF] font-mono px-1.5 py-0.5 rounded bg-[#648BFF]/10">
                          {contact.relationship}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#9299A5] font-mono">{contact.contactEmail}</span>
                    </div>

                    <button
                      onClick={() => handleRemoveEmergencyContact(contact.id)}
                      className="p-1.5 text-[#9299A5] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Revoke emergency status"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
