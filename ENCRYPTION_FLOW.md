# Encryption Workflow

## Algorithm
- **Algorithm**: AES-256-GCM (Galois/Counter Mode).
- **Library**: Python `cryptography.fernet` replaced with `cryptography.hazmat.primitives.ciphers.aead.AESGCM`.
- **Key Derivation**: 32-byte key generated from secure environment variables.

## Data Encryption Flow (Insert)
1. User submits plaintext PII (e.g., `phone_number`).
2. SQLAlchemy `TypeDecorator` interceptor (`EncryptedString`) triggers `process_bind_param`.
3. A 12-byte random IV/Nonce is generated via `os.urandom(12)`.
4. AES-GCM encrypts the plaintext using the key and nonce.
5. The Nonce is prepended to the Ciphertext, Base64 encoded, and saved to the DB.

## Data Decryption Flow (Read)
1. SQLAlchemy triggers `process_result_value` on read.
2. The Base64 string is decoded.
3. The first 12 bytes are extracted as the Nonce.
4. The remaining bytes are the Ciphertext and Authentication Tag.
5. AES-GCM decrypts and verifies the data. Plaintext is returned to the application.

## Searchable Hashing (Deterministic Lookup)
- Emails must be exact-match searchable for logins.
- **Algorithm**: HMAC-SHA256.
- A deterministic hash is generated using a fixed salt and the lowercase email.
- The DB queries `email_hash == user_input_hash`, never decrypting the table for lookups.
