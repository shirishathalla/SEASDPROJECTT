# DocuVault — Threat Modeling & Security Specification

**Course:** B.Tech Computer Science & Engineering (Cyber Security) — SEASD Project

---

## 1. Threat Model (STRIDE Methodology)

| Threat | Target | Mitigation Implemented in DocuVault |
|---|---|---|
| **Spoofing** | User Identity & Sessions | PBKDF2 password hashing with cryptographically unique salts, 6-digit PIN secondary authorization, WebAuthn/Android biometric attestation. |
| **Tampering** | Stored Documents | Authenticated Encryption with AES-256-GCM. 128-bit authentication tag guarantees ciphertext integrity; SHA-256 cryptographic hash calculated on raw file bytes detects tampering. |
| **Repudiation** | Vault Actions | Append-only immutable Audit Log recording IP address, User-Agent, UTC timestamp, and specific cryptographic actions (upload, decrypt, share, revoke). |
| **Information Disclosure** | Cloud Object Storage | Encryption keys are derived per user from vault PIN and master salt. Database administrators or storage bucket leaks yield only ciphertext without user PIN. |
| **Denial of Service** | Authentication APIs | 5-strike failed PIN attempt triggers exponential lockout timer (1 minute). Rate-limited endpoints. |
| **Elevation of Privilege** | Family & QR Sharing | Role-Based Access Control (RBAC: Owner, Editor, Viewer). Strict SQL queries scoped to `user_id` or explicit `document_shares` rows. |

---

## 2. Cryptographic Algorithm Suite

- **Payload Cipher:** `AES-256-GCM` (Galois/Counter Mode) with 96-bit initialization vector and 128-bit authentication tag.
- **Key Derivation Function:** `PBKDF2-HMAC-SHA256` with 100,000 iterations and 16-byte random salt.
- **Integrity Digest:** `SHA-256` (FIPS 180-4 standard).
- **Session Tokens:** 256-bit entropy generated using OS-level cryptographically secure pseudo-random number generator (`crypto.randomBytes`).
