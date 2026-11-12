# DocuVault — AI-Powered Privacy-First Personal Digital Document Wallet

> **"Carry your identity securely, not your documents."**

[![Security: AES-256-GCM](https://img.shields.io/badge/Security-AES--256--GCM-blue.svg)](#)
[![Integrity: SHA-256](https://img.shields.io/badge/Integrity-SHA--256-emerald.svg)](#)
[![AI: Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%203.8%20Flash-purple.svg)](#)
[![B.Tech Cyber Security](https://img.shields.io/badge/Project-B.Tech%20CSE%20Cyber%20Security-orange.svg)](#)

---

## Executive Summary

DocuVault is an enterprise-grade personal document wallet engineered to deliver zero-knowledge, privacy-first storage for official government identity documents, academic credentials, financial statements, and private medical records.

Built specifically for high-assurance cybersecurity architectures, DocuVault combines:
- **AES-256-GCM Authenticated Encryption**
- **PBKDF2-HMAC-SHA256 Key Derivation (100,000 rounds)**
- **Cryptographic SHA-256 Tamper Detection**
- **Hardware-Backed Biometrics & 6-Digit PIN Protection**
- **Backend-Mediated Google Gemini 3.8 Flash AI Intelligence**
- **Expiry Intelligence with 30, 15, 7, and 1-Day Renewal Alerts**
- **Zero-Knowledge Family Sharing & Ephemeral QR Tokens**
- **Trusted Contact Emergency Access Protocol**

---

## Technology Stack

| Layer | Primary Technologies |
|---|---|
| **Mobile Frontend** | Flutter, Dart, Material 3, Riverpod, GoRouter, Dio |
| **Interactive Web App** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons |
| **Backend API** | Python FastAPI, Pydantic v2, SQLAlchemy ORM, Alembic |
| **Database** | PostgreSQL 15, Relational Isolation, Audit Logging |
| **Authentication** | Password + 6-digit PIN + Biometric Sensor (WebAuthn / Android BiometricPrompt) |
| **AI Intelligence** | Google Gemini API (`gemini-3.8-flash`) mediated securely on server |
| **DevOps** | Docker, Docker Compose, Pytest |

---

## Project Structure

```
docuvault/
├── backend/
│   ├── app/
│   │   ├── api/          # RESTful route controllers
│   │   ├── core/         # Settings & environment config
│   │   ├── models/       # SQLAlchemy relational models
│   │   ├── security/     # AES-256-GCM, PBKDF2, SHA-256 crypto
│   │   └── tests/        # Pytest unit & integration test suite
│   ├── Dockerfile
│   └── requirements.txt
├── docs/
│   ├── architecture.md
│   ├── database_schema.md
│   ├── api_documentation.md
│   ├── security_model.md
│   └── setup_guide.md
├── infrastructure/
│   └── docker-compose.yml
├── mobile/               # Native Android / Flutter codebase
├── src/                  # Full-stack interactive preview
├── server.ts             # Express & Gemini backend proxy
└── README.md
```

---

## Verification & Testing

Backend cryptographic and authentication tests can be executed via:
```bash
pytest backend/app/tests/ -v
```
All cryptographic operations enforce authenticated decryption; any flipped bit in ciphertexts immediately raises authentication failure.
