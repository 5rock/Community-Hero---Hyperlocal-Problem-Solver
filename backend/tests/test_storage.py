from unittest.mock import MagicMock

import pytest

from app.services import storage


def test_storage_upload_download_delete(monkeypatch):
    bucket = MagicMock()
    bucket.get_public_url.return_value = "https://project.supabase.co/storage/test.png"
    bucket.download.return_value = b"image"
    client = MagicMock()
    client.storage.from_.return_value = bucket
    monkeypatch.setattr(storage, "get_supabase_client", lambda: client)

    uploaded = storage.upload_image(b"image", "image/png", "png")
    assert uploaded.path.endswith(".png")
    assert uploaded.public_url.startswith("https://")
    assert storage.download_image(uploaded.path) == b"image"
    storage.delete_image(uploaded.path)
    bucket.remove.assert_called_once_with([uploaded.path])


def test_storage_rejects_unsafe_content():
    with pytest.raises(ValueError):
        storage.upload_image(b"payload", "text/html", "html")
