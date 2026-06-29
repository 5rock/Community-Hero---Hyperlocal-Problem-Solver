"""Live Supabase Storage smoke test. Requires backend/.env credentials."""

import base64

from app.services.storage import delete_image, download_image, ensure_bucket, upload_image

ONE_PIXEL_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUB"
    "AScY42YAAAAASUVORK5CYII="
)


def main() -> None:
    ensure_bucket()
    stored = upload_image(ONE_PIXEL_PNG, "image/png", "png")
    try:
        downloaded = download_image(stored.path)
        if downloaded != ONE_PIXEL_PNG:
            raise RuntimeError("Downloaded object did not match uploaded content")
        if not stored.public_url.startswith("https://"):
            raise RuntimeError("Storage did not return a public HTTPS URL")
        print("Supabase Storage upload/download/public URL: OK")
    finally:
        delete_image(stored.path)
    print("Supabase Storage delete: OK")


if __name__ == "__main__":
    main()
