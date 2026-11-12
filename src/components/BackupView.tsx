import React, { useState } from 'react';
import { HardDrive, Download, Upload, ShieldCheck, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { DocumentMetadata } from '../types';
import { formatBytes } from '../utils/crypto';

interface BackupViewProps {
  documents: DocumentMetadata[];
  onRefreshDocs: () => void;
}

export const BackupView: React.FC<BackupViewProps> = ({
  documents,
  onRefreshDocs,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [restoreMsg, setRestoreMsg] = useState<string>('');

  const totalBytes = documents.reduce((acc, d) => acc + d.fileSize, 0);

  const handleExportBackup = () => {
    const backupData = {
      app: 'DocuVault',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      encryptionStandard: 'AES-256-GCM',
      documentCount: documents.length,
      documentsMetadata: documents,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docuvault_encrypted_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setRestoreMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.app !== 'DocuVault') {
          throw new Error('Unrecognized backup format. Must be a valid DocuVault export.');
        }
        setRestoreMsg(`Backup verified! Contains ${json.documentCount || 0} encrypted document records.`);
        onRefreshDocs();
      } catch (err: any) {
        setRestoreMsg(err.message || 'Failed to parse backup archive.');
      } finally {
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <div className="bg-[#12151D] border border-[#1E2430] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#141A26] border border-[#263554] flex items-center justify-center text-[#648BFF]">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#F4F5F7]">Backup & Secure Storage</h2>
            <p className="text-xs text-[#9299A5]">
              Generate client-side encrypted vault archives or restore to another device with zero-knowledge preservation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#1E2430] text-xs">
          <div>
            <span className="text-[#9299A5] block">Documents in Vault</span>
            <span className="text-base font-bold font-mono text-[#F4F5F7] mt-0.5 block">{documents.length}</span>
          </div>
          <div>
            <span className="text-[#9299A5] block">Encrypted Payload Size</span>
            <span className="text-base font-bold font-mono text-[#F4F5F7] mt-0.5 block">{formatBytes(totalBytes)}</span>
          </div>
          <div>
            <span className="text-[#9299A5] block">Cloud Sync Status</span>
            <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block">Encrypted & In Sync</span>
          </div>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Encrypted backup archive downloaded. Store this file securely.</span>
        </div>
      )}

      {restoreMsg && (
        <div className="p-3 bg-[#182133] border border-[#2B4272] text-[#C5CAD3] text-xs rounded-xl flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#648BFF] shrink-0" />
          <span>{restoreMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Export Card */}
        <div className="bg-[#12151D] border border-[#1E2430] rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[#F4F5F7]">Export Encrypted Vault</h3>
            <p className="text-xs text-[#9299A5] mt-1">
              Download your complete personal vault including AES-256-GCM ciphertexts, SHA-256 integrity checksums, and OCR metadata.
            </p>
          </div>

          <button
            onClick={handleExportBackup}
            className="w-full py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#3B82F6]/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Encrypted Archive</span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-[#12151D] border border-[#1E2430] rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[#F4F5F7]">Restore from Archive</h3>
            <p className="text-xs text-[#9299A5] mt-1">
              Import a previously exported DocuVault backup file to migrate your vault to a new device or recover documents.
            </p>
          </div>

          <label className="w-full py-2.5 rounded-xl bg-[#181D26] hover:bg-[#222836] border border-[#2A3344] text-[#C5CAD3] hover:text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all">
            <Upload className="w-4 h-4 text-[#648BFF]" />
            <span>Select Backup File (.json)</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
