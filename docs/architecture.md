# DocuVault — System Architecture & Technical Specifications

**Project Title:** DocuVault — AI-Powered Privacy-First Personal Digital Document Wallet  
**Tagline:** "Carry your identity securely, not your documents."  
**Project Category:** B.Tech CSE Cyber Security SEASD Project  

---

## 1. High-Level Architectural Overview

DocuVault employs a layered Zero-Knowledge security architecture designed to prevent unauthorized inspection, tampering, or exfiltration of sensitive identity, academic, financial, and health records.

```
+------------------------------------------------------------------+
|                     CLIENT APPLICATION LAYER                    |
|  - Native Android (Flutter / Dart / Material 3 / Riverpod)       |
|  - Progressive Web App / Preview (React 19 / TypeScript / Vite)   |
|  - Biometric Sensor (WebAuthn / Android BiometricPrompt)         |
|  - Camera Hardware Integration with Canvas Perspective Preproc   |
+----------------------------------+-------------------------------+
                                   | TLS 1.3 / HTTPS
                                   v
+----------------------------------+-------------------------------+
|                      BACKEND / API GATEWAY                       |
|  - Python FastAPI / Node.js Express Gateway                      |
|  - Rate Limiting & Brute-Force Lockout (5-strike threshold)      |
|  - PBKDF2-HMAC-SHA256 Key Derivation (100,000 computational rounds)|
|  - AES-256-GCM Authenticated Encryption & Decryption Engine      |
|  - SHA-256 Checksum Validation at Ingestion and Retrieval        |
|  - Ephemeral QR Token Generator with Configurable TTL            |
+-------------------+------------------------------+---------------+
                    |                              |
                    v                              v
+-------------------+-------------+  +-------------+---------------+
|        DATABASE LAYER           |  |      AI MEDIATION LAYER     |
|  - PostgreSQL Relational Store  |  |  - Google Gemini 3.8 Flash  |
|  - User Data Partitioning       |  |  - Document Classification  |
|  - Strict Foreign Key Cascades  |  |  - OCR Data Extraction      |
|  - Immutable Audit Trails       |  |  - Executive Summaries      |
+---------------------------------+  |  - Zero-Knowledge Chat      |
                                     +-----------------------------+
```

---

## 2. Core Security Invariants

1. **Zero Plaintext Storage**: Document bytes are encrypted with AES-256-GCM before persistent commit. No unencrypted document blobs ever touch disk.
2. **Deterministic Integrity Verification**: Every document produces a SHA-256 digest upon ingestion. Whenever a document is decrypted, the hash is re-computed and compared with the stored integrity checksum to detect bit-rot or malicious database tampering.
3. **Backend-Mediated AI**: Client applications never contact Gemini endpoints directly. All queries pass through server-side proxies with strict context limits (only authorized metadata, zero transmission of unconsented health records).
4. **Hardware-Backed Biometrics**: Biometric verification is anchored to device platform authenticators (Android BiometricPrompt, WebAuthn) with 6-digit cryptographic PIN fallback.
