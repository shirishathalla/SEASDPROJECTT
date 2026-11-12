import os
import hashlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from app.core.config import settings

def derive_vault_key(pin_or_password: str, salt: bytes) -> bytes:
    """Derives a 256-bit encryption key using PBKDF2-HMAC-SHA256 with 100,000 rounds."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=settings.PBKDF2_ROUNDS,
    )
    return kdf.derive(pin_or_password.encode('utf-8'))

def encrypt_document_aes256_gcm(plain_bytes: bytes, key: bytes) -> tuple[bytes, bytes]:
    """
    Encrypts document byte content using AES-256-GCM.
    Returns (nonce_iv_12bytes, ciphertext_with_auth_tag).
    """
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)  # 96-bit recommended nonce for GCM
    ciphertext = aesgcm.encrypt(nonce, plain_bytes, None)
    return nonce, ciphertext

def decrypt_document_aes256_gcm(nonce: bytes, ciphertext: bytes, key: bytes) -> bytes:
    """
    Decrypts document byte content using AES-256-GCM.
    Verifies the authentication tag automatically.
    """
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, ciphertext, None)

def compute_sha256_checksum(data: bytes) -> str:
    """Computes SHA-256 cryptographic digest of document bytes."""
    return hashlib.sha256(data).hexdigest()
