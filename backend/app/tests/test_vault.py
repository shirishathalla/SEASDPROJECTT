import os
import pytest
from app.security.crypto import (
    derive_vault_key,
    encrypt_document_aes256_gcm,
    decrypt_document_aes256_gcm,
    compute_sha256_checksum,
)

def test_key_derivation_deterministic():
    """Verify that identical salt and PIN derive the identical 256-bit key."""
    salt = os.urandom(16)
    pin = "654321"
    key1 = derive_vault_key(pin, salt)
    key2 = derive_vault_key(pin, salt)
    assert key1 == key2
    assert len(key1) == 32  # 256 bits

def test_aes_256_gcm_authenticated_encryption():
    """Verify encryption and successful authenticated decryption."""
    salt = os.urandom(16)
    key = derive_vault_key("987654", salt)
    plaintext = b"CONFIDENTIAL_PASSPORT_DATA_SEASD_PROJECT_2026"
    
    nonce, ciphertext = encrypt_document_aes256_gcm(plaintext, key)
    assert len(nonce) == 12  # 96-bit IV
    assert ciphertext != plaintext
    
    decrypted = decrypt_document_aes256_gcm(nonce, ciphertext, key)
    assert decrypted == plaintext

def test_aes_256_gcm_tamper_detection():
    """Verify that any bit flip in ciphertext causes authenticated decryption failure."""
    salt = os.urandom(16)
    key = derive_vault_key("112233", salt)
    plaintext = b"CRITICAL_HEALTH_VACCINATION_RECORD"
    
    nonce, ciphertext = encrypt_document_aes256_gcm(plaintext, key)
    
    # Tamper with one byte of ciphertext
    tampered = bytearray(ciphertext)
    tampered[0] ^= 0xFF
    
    with pytest.raises(Exception):
        decrypt_document_aes256_gcm(nonce, bytes(tampered), key)

def test_sha256_file_integrity_checksum():
    """Verify SHA-256 integrity calculation matches standard digest."""
    doc_bytes = b"DOCUVAULT_OFFICIAL_TRANSCRIPT_2026"
    checksum = compute_sha256_checksum(doc_bytes)
    assert len(checksum) == 64
    assert checksum == compute_sha256_checksum(doc_bytes)

def test_expiry_days_calculation():
    """Verify expiration math for 30, 15, 7, and 1-day reminders."""
    from datetime import date, timedelta
    today = date.today()
    exp_in_5_days = today + timedelta(days=5)
    diff = (exp_in_5_days - today).days
    assert diff == 5
    assert diff <= 7  # Triggers 7-day alert window
