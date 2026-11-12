import { DocumentCategory, DocumentMetadata, ExpiryAlert, FamilyGroup, QRShareToken, EmergencyContact, AuditLog, SecurityStatus } from '../types';

let currentEmail: string = localStorage.getItem('docuvault_user_email') || '';
let currentName: string = localStorage.getItem('docuvault_user_name') || '';

export function setUserSession(email: string, name?: string) {
  currentEmail = email ? email.trim() : '';
  if (name) currentName = name.trim();
  
  if (currentEmail) {
    localStorage.setItem('docuvault_user_email', currentEmail);
    if (name) localStorage.setItem('docuvault_user_name', name.trim());
  } else {
    currentName = '';
    localStorage.removeItem('docuvault_user_email');
    localStorage.removeItem('docuvault_user_name');
  }
}

export function setUserSessionEmail(email: string) {
  setUserSession(email);
}

export function getUserSessionEmail(): string {
  return currentEmail;
}

export function getUserSessionName(): string {
  return currentName;
}

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'x-user-email': currentEmail,
});

export const api = {
  // Auth
  async register(data: { fullName: string; email: string; password: string; pin: string; biometricEnabled: boolean }) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Registration failed');
    return json;
  },

  async verifyEmail(email: string, otp: string) {
    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Verification failed');
    return json;
  },

  async resendOtp(email: string) {
    const res = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to resend OTP');
    return json;
  },

  async login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    return json;
  },

  async verifyPin(email: string, pin: string) {
    const res = await fetch('/api/auth/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pin }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'PIN verification failed');
    return json;
  },

  async verifyBiometric(email: string) {
    const res = await fetch('/api/auth/verify-biometric', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Biometric verification failed');
    return json;
  },

  async forgotPassword(email: string) {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async resetPassword(email: string, code: string, newPassword: string) {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Password reset failed');
    return json;
  },

  async resetPin(email: string, password: string, newPin: string) {
    const res = await fetch('/api/auth/reset-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, newPin }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'PIN reset failed');
    return json;
  },

  async getMobileAccess(): Promise<{ appUrl: string; qrDataUrl: string }> {
    const res = await fetch('/api/system/mobile-access');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch mobile access QR');
    return json;
  },

  // Documents
  async getDocuments(params?: { category?: string; favorite?: boolean; q?: string }): Promise<{ documents: DocumentMetadata[] }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.favorite) query.append('favorite', 'true');
    if (params?.q) query.append('q', params.q);

    const res = await fetch(`/api/documents?${query.toString()}`, {
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch documents');
    return json;
  },

  async getDocument(id: string): Promise<{ document: DocumentMetadata }> {
    const res = await fetch(`/api/documents/${id}`, {
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to load document');
    return json;
  },

  async uploadDocument(data: {
    name: string;
    category: DocumentCategory;
    description?: string;
    tags: string[];
    documentDate: string;
    expiryDate?: string;
    mimeType: string;
    base64Data: string;
    ocrText?: string;
    extractedFields?: Record<string, string>;
    healthConsentGiven?: boolean;
  }) {
    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Upload failed');
    return json;
  },

  async updateDocument(id: string, updates: Partial<DocumentMetadata>) {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Update failed');
    return json;
  },

  async deleteDocument(id: string) {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Delete failed');
    return json;
  },

  // AI Intelligence
  async aiClassify(filename: string, sampleText: string) {
    const res = await fetch('/api/ai/classify', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ filename, sampleText }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'AI classification failed');
    return json;
  },

  async aiOcrExtract(base64Image: string, mimeType: string) {
    const res = await fetch('/api/ai/ocr-extract', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ base64Image, mimeType }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'OCR Extraction failed');
    return json;
  },

  async aiSummarize(doc: { documentName: string; category: string; ocrText?: string; description?: string }) {
    const res = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(doc),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Summarization failed');
    return json;
  },

  async aiSemanticSearch(query: string) {
    const res = await fetch('/api/ai/semantic-search', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Semantic search failed');
    return json;
  },

  async aiChat(messages: { role: string; content: string }[], consentGiven: boolean) {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ messages, consentGiven }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'AI Assistant unavailable');
    return json;
  },

  // Expiry Intelligence
  async getExpiryAlerts(): Promise<{ alerts: ExpiryAlert[] }> {
    const res = await fetch('/api/expiry/alerts', {
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch expiry alerts');
    return json;
  },

  // Family Vault
  async getFamilyGroups(): Promise<{ groups: FamilyGroup[] }> {
    const res = await fetch('/api/family/groups', {
      headers: getHeaders(),
    });
    return res.json();
  },

  async createFamilyGroup(name: string) {
    const res = await fetch('/api/family/groups', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });
    return res.json();
  },

  async inviteFamilyMember(groupId: string, memberEmail: string, memberName: string, role: string) {
    const res = await fetch('/api/family/invite', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ groupId, memberEmail, memberName, role }),
    });
    return res.json();
  },

  async shareDocument(documentId: string, targetEmail: string, permission: 'viewer' | 'editor') {
    const res = await fetch('/api/family/share', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ documentId, targetEmail, permission }),
    });
    return res.json();
  },

  // Secure QR Sharing
  async createQRShare(data: { documentId: string; expirationMinutes: number; password?: string; permissions: 'view' | 'download' }) {
    const res = await fetch('/api/sharing/qr', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'QR generation failed');
    return json;
  },

  async revokeQRShare(token: string) {
    const res = await fetch(`/api/sharing/qr/${token}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Emergency Access
  async getEmergencyContacts(): Promise<{ contacts: EmergencyContact[] }> {
    const res = await fetch('/api/emergency/contacts', {
      headers: getHeaders(),
    });
    return res.json();
  },

  async addEmergencyContact(contact: { contactName: string; contactEmail: string; relationship: string; accessibleDocIds: string[] }) {
    const res = await fetch('/api/emergency/contacts', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(contact),
    });
    return res.json();
  },

  async removeEmergencyContact(id: string) {
    const res = await fetch(`/api/emergency/contacts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Security Status & Audit Logs
  async getSecurityStatus(): Promise<{ status: SecurityStatus }> {
    const res = await fetch('/api/security/status', {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getAuditLogs(): Promise<{ logs: AuditLog[] }> {
    const res = await fetch('/api/security/audit-logs', {
      headers: getHeaders(),
    });
    return res.json();
  },
};
