import 'dart:convert';
import 'dart:typed_data';
import 'package:crypto/crypto.dart' as crypto_pkg;
import 'package:cryptography/cryptography.dart';

class VaultCryptoService {
  static final _algorithm = AesGcm.with256Bits();

  /// Calculates SHA-256 integrity checksum for a document byte array.
  static String calculateSHA256(Uint8List bytes) {
    return crypto_pkg.sha256.convert(bytes).toString();
  }

  /// Derives a 256-bit AES key from user's vault PIN and unique salt using PBKDF2-HMAC-SHA256.
  static Future<SecretKey> deriveKeyFromPin(String pin, List<int> salt) async {
    final pbkdf2 = Pbkdf2(
      macAlgorithm: Hmac.sha256(),
      iterations: 100000,
      bits: 256,
    );
    return await pbkdf2.deriveKey(
      secretKey: SecretKey(utf8.encode(pin)),
      nonce: salt,
    );
  }

  /// Encrypts document bytes using AES-256-GCM.
  static Future<SecretBox> encryptDocument(Uint8List plainBytes, SecretKey key) async {
    return await _algorithm.encrypt(
      plainBytes,
      secretKey: key,
    );
  }

  /// Decrypts document bytes with authenticated integrity verification.
  static Future<List<int>> decryptDocument(SecretBox secretBox, SecretKey key) async {
    return await _algorithm.decrypt(
      secretBox,
      secretKey: key,
    );
  }
}
