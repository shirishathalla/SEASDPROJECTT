# DocuVault — PostgreSQL Database Schema & Relational Specifications

## 1. Relational ER Diagram Overview

DocuVault isolates user data while supporting Role-Based Access Control (RBAC) for family sharing and ephemeral QR grants.

```
 +------------------+           +----------------------+
 |      users       | 1       * |      documents       |
 |------------------|<----------|----------------------|
 | id (PK, UUID)    |           | id (PK, UUID)        |
 | email (UQ)       |           | user_id (FK -> users)|
 | password_hash    |           | name                 |
 | pin_hash         |           | category             |
 | biometrics_active|           | sha256_checksum      |
 +--------+---------+           | encrypted_blob       |
          | 1                   | iv_nonce             |
          |                     | auth_tag             |
          | *                   | expiry_date          |
 +--------v---------+           +----------+-----------+
 |    audit_logs    |                      | 1
 |------------------|                      |
 | id (PK, UUID)    |                      | *
 | user_id (FK)     |           +----------v-----------+
 | action           |           |   document_shares    |
 | ip_address       |           |----------------------|
 | timestamp        |           | id (PK, UUID)        |
 +------------------+           | document_id (FK)     |
                                | shared_with_email    |
                                | permission (view/edit|
                                +----------------------+
```

## 2. Table Specifications

### `users`
- `id`: UUID PRIMARY KEY
- `full_name`: VARCHAR(150) NOT NULL
- `email`: VARCHAR(255) UNIQUE NOT NULL (Indexed)
- `password_hash`: VARCHAR(255) NOT NULL
- `pin_hash`: VARCHAR(255) NOT NULL
- `is_email_verified`: BOOLEAN DEFAULT FALSE
- `biometrics_enabled`: BOOLEAN DEFAULT TRUE
- `created_at`: TIMESTAMPTZ DEFAULT NOW()

### `documents`
- `id`: UUID PRIMARY KEY
- `user_id`: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE (Indexed)
- `name`: VARCHAR(255) NOT NULL
- `category`: VARCHAR(50) NOT NULL (Indexed: 'Identity', 'Education', 'Finance', 'Health', 'Personal', 'Other')
- `description`: TEXT NULL
- `tags`: TEXT[] DEFAULT '{}'
- `document_date`: DATE NOT NULL
- `expiry_date`: DATE NULL (Indexed for Expiry Intelligence)
- `mime_type`: VARCHAR(100) NOT NULL
- `file_size_bytes`: BIGINT NOT NULL
- `sha256_checksum`: CHAR(64) NOT NULL (Indexed)
- `encrypted_blob`: TEXT NOT NULL (AES-256-GCM base64 ciphertext)
- `iv_nonce`: CHAR(24) NOT NULL (12 bytes hex)
- `auth_tag`: CHAR(32) NOT NULL (16 bytes hex)
- `ocr_extracted_text`: TEXT NULL
- `is_favorite`: BOOLEAN DEFAULT FALSE
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
