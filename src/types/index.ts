export type DocumentCategory = 'Identity' | 'Education' | 'Finance' | 'Health' | 'Personal' | 'Other';

export interface DocumentMetadata {
  id: string;
  name: string;
  category: DocumentCategory;
  description?: string;
  tags: string[];
  documentDate: string;
  expiryDate?: string;
  mimeType: string;
  fileSize: number;
  sha256Checksum: string;
  ocrText?: string;
  ocrConfidence: number;
  extractedFields: Record<string, string>;
  isFavorite: boolean;
  healthConsentGiven?: boolean;
  versionsCount: number;
  createdAt: string;
  updatedAt: string;
  base64Data?: string;
  integrityVerified?: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  biometricEnabled: boolean;
  autoLockMinutes: number;
}

export interface ExpiryAlert {
  documentId: string;
  documentName: string;
  category: DocumentCategory;
  expiryDate: string;
  daysRemaining: number;
  status: 'valid' | 'expiring_30' | 'expiring_15' | 'expiring_7' | 'expiring_1' | 'expired';
  renewalChecklist: string[];
}

export interface FamilyGroup {
  id: string;
  ownerId: string;
  name: string;
  members: {
    userId: string;
    email: string;
    fullName: string;
    role: 'owner' | 'editor' | 'viewer';
    joinedAt: string;
  }[];
  createdAt: string;
}

export interface QRShareToken {
  id: string;
  token: string;
  documentId: string;
  expiresAt: string;
  permissions: 'view' | 'download';
  accessCount: number;
  revoked: boolean;
  createdAt: string;
  qrDataUrl?: string;
  shareUrl?: string;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  contactName: string;
  contactEmail: string;
  relationship: string;
  accessibleDocIds: string[];
  status: 'active' | 'pending';
  lastAccessAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface SecurityStatus {
  encryptionAlgorithm: string;
  keyDerivation: string;
  integrityStandard: string;
  biometricsEnrolled: boolean;
  autoLockMinutes: number;
  totalDocuments: number;
  storageUsedBytes: number;
  activeQRShares: number;
  trustedEmergencyContacts: number;
  securityHealthScore: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  referencedDocuments?: { id: string; name: string }[];
}
