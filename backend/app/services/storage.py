from dataclasses import dataclass
from uuid import uuid4

from app.supabase_client import get_supabase_client

BUCKET = "issues"
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024


@dataclass(frozen=True)
class StoredObject:
    path: str
    public_url: str


def ensure_bucket() -> None:
    client = get_supabase_client()
    bucket_names = {bucket.name for bucket in client.storage.list_buckets()}
    if BUCKET not in bucket_names:
        client.storage.create_bucket(
            BUCKET,
            options={
                "public": True,
                "allowed_mime_types": sorted(ALLOWED_MIME_TYPES),
                "file_size_limit": MAX_UPLOAD_BYTES,
            },
        )


def upload_image(content: bytes, mime_type: str, extension: str) -> StoredObject:
    if mime_type not in ALLOWED_MIME_TYPES:
        raise ValueError("Unsupported image type")
    if not content or len(content) > MAX_UPLOAD_BYTES:
        raise ValueError("Image must be between 1 byte and 10 MiB")

    path = f"{uuid4().hex}.{extension.lower()}"
    bucket = get_supabase_client().storage.from_(BUCKET)
    bucket.upload(
        path=path,
        file=content,
        file_options={"content-type": mime_type, "upsert": "false"},
    )
    return StoredObject(path=path, public_url=bucket.get_public_url(path))


def download_image(path: str) -> bytes:
    return get_supabase_client().storage.from_(BUCKET).download(path)


def delete_image(path: str) -> None:
    get_supabase_client().storage.from_(BUCKET).remove([path])
