import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Share2, Shield, Trash2, ArrowRight, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { FamilyGroup, DocumentMetadata } from '../types';
import { api } from '../services/api';

interface FamilyVaultViewProps {
  documents: DocumentMetadata[];
  onOpenDocument: (docId: string) => void;
}

export const FamilyVaultView: React.FC<FamilyVaultViewProps> = ({
  documents,
  onOpenDocument,
}) => {
  const [groups, setGroups] = useState<FamilyGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<'groups' | 'shareDoc'>('groups');

  // New Group Modal / State
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [creatingGroup, setCreatingGroup] = useState<boolean>(false);

  // Invite Member State
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteName, setInviteName] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor'>('viewer');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [inviting, setInviting] = useState<boolean>(false);

  // Share Document State
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [targetShareEmail, setTargetShareEmail] = useState<string>('');
  const [sharePermission, setSharePermission] = useState<'viewer' | 'editor'>('viewer');
  const [sharing, setSharing] = useState<boolean>(false);
  const [shareMessage, setShareMessage] = useState<string>('');

  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const res = await api.getFamilyGroups();
      setGroups(res.groups || []);
      if (res.groups && res.groups.length > 0) {
        setSelectedGroupId(res.groups[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load family groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setCreatingGroup(true);
    setError('');
    try {
      const res = await api.createFamilyGroup(newGroupName);
      setGroups(prev => [...prev, res.group]);
      setSelectedGroupId(res.group.id);
      setNewGroupName('');
    } catch (err: any) {
      setError(err.message || 'Failed to create group');
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId || !inviteEmail.trim()) return;
    setInviting(true);
    setError('');
    try {
      await api.inviteFamilyMember(selectedGroupId, inviteEmail, inviteName, inviteRole);
      setInviteEmail('');
      setInviteName('');
      loadGroups();
    } catch (err: any) {
      setError(err.message || 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  const handleShareDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId || !targetShareEmail.trim()) return;
    setSharing(true);
    setShareMessage('');
    setError('');
    try {
      await api.shareDocument(selectedDocId, targetShareEmail, sharePermission);
      setShareMessage('Document shared securely with encryption authorization.');
      setTargetShareEmail('');
      setSelectedDocId('');
    } catch (err: any) {
      setError(err.message || 'Failed to share document');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Sub Tabs: Groups vs Share Document */}
      <div className="flex p-1 bg-[#171A20] rounded-xl border border-[#222630] text-xs">
        <button
          onClick={() => setActiveSubTab('groups')}
          className={`flex-1 py-2 font-medium rounded-lg transition-all ${
            activeSubTab === 'groups' ? 'bg-[#222630] text-[#F4F5F7]' : 'text-[#9299A5] hover:text-[#C5CAD3]'
          }`}
        >
          Family Groups & Members
        </button>
        <button
          onClick={() => setActiveSubTab('shareDoc')}
          className={`flex-1 py-2 font-medium rounded-lg transition-all ${
            activeSubTab === 'shareDoc' ? 'bg-[#222630] text-[#F4F5F7]' : 'text-[#9299A5] hover:text-[#C5CAD3]'
          }`}
        >
          Share Document (RBAC)
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {shareMessage && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs p-3 rounded-xl">
          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{shareMessage}</span>
        </div>
      )}

      {activeSubTab === 'groups' ? (
        <div className="space-y-5">
          {/* Create Group Form */}
          <div className="bg-[#171A20] border border-[#222630] rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-[#C5CAD3] uppercase tracking-wider mb-2">
              Create New Family Group
            </h3>
            <form onSubmit={handleCreateGroup} className="flex gap-2">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g. Morgan Household or Immediate Family"
                className="flex-1 bg-[#0B0D10] border border-[#2D3342] rounded-xl px-3.5 py-2 text-xs text-[#F4F5F7] focus:outline-none focus:border-[#648BFF]"
              />
              <button
                type="submit"
                disabled={creatingGroup || !newGroupName.trim()}
                className="px-4 py-2 bg-[#648BFF] hover:bg-[#5279f0] text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-40"
              >
                Create Group
              </button>
            </form>
          </div>

          {/* Groups List */}
          {loading ? (
            <div className="flex items-center justify-center py-12 text-[#9299A5]">
              <RefreshCw className="w-6 h-6 animate-spin text-[#648BFF]" />
            </div>
          ) : groups.length === 0 ? (
            <div className="bg-[#171A20] border border-[#222630] rounded-2xl p-8 text-center">
              <Users className="w-10 h-10 text-[#648BFF] mx-auto mb-2 opacity-80" />
              <h3 className="text-sm font-semibold text-[#F4F5F7]">No Family Groups Yet</h3>
              <p className="text-xs text-[#9299A5] mt-1">
                Create a family group above to securely share insurance, certificates, and health records with granular permissions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map(group => (
                <div key={group.id} className="bg-[#171A20] border border-[#222630] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#222630] border border-[#2D3342] flex items-center justify-center text-[#648BFF]">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#F4F5F7]">{group.name}</h4>
                        <span className="text-[10px] text-[#9299A5] font-mono">
                          Group ID: {group.id} · {group.members.length} member{group.members.length === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Members Table */}
                  <div className="bg-[#0B0D10] border border-[#222630] rounded-xl overflow-hidden text-xs">
                    <div className="divide-y divide-[#222630]">
                      {group.members.map((m, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#222630] text-[#F4F5F7] flex items-center justify-center text-xs font-semibold">
                              {m.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-[#F4F5F7] block">{m.fullName}</span>
                              <span className="text-[10px] text-[#9299A5] font-mono">{m.email}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                            m.role === 'owner' ? 'bg-[#648BFF]/20 text-[#648BFF]' : 'bg-[#222630] text-[#C5CAD3]'
                          }`}>
                            {m.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Invite Member Section */}
                  <div className="pt-2 border-t border-[#222630]">
                    <h5 className="text-[11px] font-semibold text-[#C5CAD3] uppercase tracking-wider mb-2">
                      Invite Member to Group
                    </h5>
                    <form onSubmit={handleInviteMember} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        placeholder="Member Name"
                        className="bg-[#0B0D10] border border-[#2D3342] rounded-xl px-3 py-1.5 text-xs text-[#F4F5F7]"
                      />
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="member@email.com"
                        className="bg-[#0B0D10] border border-[#2D3342] rounded-xl px-3 py-1.5 text-xs text-[#F4F5F7]"
                      />
                      <div className="flex gap-2">
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value as any)}
                          className="bg-[#0B0D10] border border-[#2D3342] rounded-xl px-2 py-1.5 text-xs text-[#F4F5F7] flex-1"
                        >
                          <option value="viewer">Viewer (Read-only)</option>
                          <option value="editor">Editor (Can manage)</option>
                        </select>
                        <button
                          type="submit"
                          disabled={inviting || !inviteEmail.trim()}
                          className="px-3 py-1.5 bg-[#222630] hover:bg-[#2D3342] text-xs font-semibold text-[#648BFF] rounded-xl transition-all"
                        >
                          Invite
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Share Document Tab */
        <div className="bg-[#171A20] border border-[#222630] rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#F4F5F7]">
              Share Document with Role-Based Access
            </h3>
            <p className="text-xs text-[#9299A5] mt-0.5">
              Every user retains their private vault. Shared documents can be viewed or edited according to assigned role permissions.
            </p>
          </div>

          <form onSubmit={handleShareDoc} className="space-y-3.5 text-xs">
            <div>
              <label className="text-[#C5CAD3] block mb-1">Select Document to Share</label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                required
                className="w-full bg-[#0B0D10] border border-[#2D3342] rounded-xl px-3 py-2 text-sm text-[#F4F5F7]"
              >
                <option value="">-- Choose from your vault --</option>
                {documents.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[#C5CAD3] block mb-1">Target Member Email</label>
              <input
                type="email"
                required
                value={targetShareEmail}
                onChange={(e) => setTargetShareEmail(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full bg-[#0B0D10] border border-[#2D3342] rounded-xl px-3 py-2 text-sm text-[#F4F5F7]"
              />
            </div>

            <div>
              <label className="text-[#C5CAD3] block mb-1">Permission Role</label>
              <select
                value={sharePermission}
                onChange={(e) => setSharePermission(e.target.value as any)}
                className="w-full bg-[#0B0D10] border border-[#2D3342] rounded-xl px-3 py-2 text-sm text-[#F4F5F7]"
              >
                <option value="viewer">Viewer (Can view and download only)</option>
                <option value="editor">Editor (Can view, annotate and update metadata)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={sharing || !selectedDocId || !targetShareEmail.trim()}
              className="w-full h-11 rounded-xl bg-[#648BFF] hover:bg-[#5279f0] text-white font-semibold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Encrypted Document</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
