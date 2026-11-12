# DocuVault — RESTful API Documentation

Base URI: `/api` (or `/api/v1` in production FastAPI)

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates new user account, hashes password and PIN, dispatches email verification OTP.
- **Request:** `{ fullName, email, password, pin, biometricEnabled }`
- **Response:** `201 Created` with `{ message, email, otpSent: true }`

### `POST /api/auth/verify-email`
Verifies OTP code and initializes empty user vault.
- **Request:** `{ email, otp }`
- **Response:** `200 OK` with `{ verified: true }`

### `POST /api/auth/login`
Validates email/password credentials and issues session token.
- **Request:** `{ email, password }`
- **Response:** `200 OK` with `{ token, user, requiresPinUnlock: true }`

### `POST /api/auth/verify-pin`
Validates 6-digit vault PIN with 5-strike rate limiting.
- **Request:** `{ email, pin }`
- **Response:** `200 OK` with `{ unlocked: true }`

---

## 2. Document Vault Endpoints

### `GET /api/documents`
Lists documents owned by the authenticated user with optional filtering.
- **Headers:** `x-user-email: <email>`
- **Query Params:** `category`, `favorite`, `q` (search)
- **Response:** `{ documents: [...] }`

### `POST /api/documents/upload`
Encrypted document ingestion with SHA-256 calculation and AES-256-GCM ciphering.
- **Request:** `{ name, category, description, tags, documentDate, expiryDate, mimeType, base64Data, ocrText, healthConsentGiven }`
- **Response:** `201 Created` with `{ id, name, sha256Checksum, fileSize }`

### `GET /api/documents/:id`
Retrieves and decrypts document with verified SHA-256 checksum.
- **Response:** `{ document: { ..., base64Data, integrityVerified: true } }`

---

## 3. AI & Expiry Endpoints

- `POST /api/ai/classify`: Inspects document snippet with Gemini 3.8 Flash, suggesting category, title, tags, and dates.
- `POST /api/ai/ocr-extract`: Extracts structured key-value pairs (IDs, dates, issuer).
- `POST /api/ai/summarize`: Generates executive summary and action items.
- `POST /api/ai/chat`: Privacy-mediated chat assistant answering strictly from user's authorized vault context.
- `GET /api/expiry/alerts`: Returns 30, 15, 7, and 1-day reminders with renewal checklists.
- `POST /api/sharing/qr`: Creates short-lived temporary QR link with optional password and download permissions.
