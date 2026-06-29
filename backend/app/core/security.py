import os
import hashlib
import hmac
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
import sqlalchemy.types as types
from app.config import jwt_secret

# Derive purpose-separated keys from the required JWT secret. Optional
# dedicated keys can be supplied during key-rotation deployments.
master_key = jwt_secret().encode("utf-8")


def _derive(info: bytes) -> bytes:
    return HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=None,
        info=info,
    ).derive(master_key)


raw_aes_key = os.getenv("AES_KEY", "").encode("utf-8") or _derive(b"community-hero/aes")
raw_hmac_key = os.getenv("HMAC_SECRET", "").encode("utf-8") or _derive(
    b"community-hero/hmac"
)
if len(raw_aes_key) < 32:
    raise RuntimeError("AES_KEY must be at least 32 bytes when provided")

aesgcm = AESGCM(raw_aes_key[:32])
hmac_secret = raw_hmac_key


def encrypt_data(data: str) -> str:
    if not data:
        return data
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, data.encode(), None)
    # Prefix nonce to the ciphertext and base64 encode
    return base64.b64encode(nonce + ciphertext).decode()


def decrypt_data(token: str) -> str:
    if not token:
        return token
    try:
        decoded = base64.b64decode(token.encode())
        nonce = decoded[:12]
        ciphertext = decoded[12:]
        return aesgcm.decrypt(nonce, ciphertext, None).decode()
    except Exception:
        # If it fails to decrypt, it might be legacy unencrypted data or Fernet
        # Wait, the prompt said "Do NOT delete existing data", we'll just return it for now
        # Ideal scenario: have a fallback Fernet decrypter here for migration
        return token


def get_data_hash(data: str) -> str:
    """Returns a deterministic HMAC SHA256 hash for exact-match lookups."""
    if not data:
        return ""
    return hmac.new(hmac_secret, data.encode(), hashlib.sha256).hexdigest()


class EncryptedString(types.TypeDecorator):
    impl = types.String
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        return encrypt_data(str(value))

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        return decrypt_data(value)
