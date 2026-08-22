from fastapi import HTTPException
import magic
from PIL import Image
import io
import mimetypes

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_DIMENSION = 4000

def sanitize_and_validate_image(content: bytes) -> tuple[bytes, str, str]:
    """
    Validates file size, MIME type, decodes the image to verify it,
    validates dimensions, and sanitizes EXIF metadata.
    Returns: (sanitized_content, mime_type, extension)
    """
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB.")

    mime = magic.Magic(mime=True)
    mime_type = mime.from_buffer(content)

    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, and WebP are allowed.")

    try:
        img = Image.open(io.BytesIO(content))
        img.verify()
        
        # PIL verify() requires reopening to do further processing
        img = Image.open(io.BytesIO(content))

        if img.width > MAX_DIMENSION or img.height > MAX_DIMENSION:
            raise HTTPException(status_code=400, detail=f"Image dimensions too large. Max is {MAX_DIMENSION}x{MAX_DIMENSION}px.")

        # Sanitize metadata by creating a new image (removes EXIF)
        # Handle RGBA to RGB conversion for JPEG
        if mime_type in ["image/jpeg", "image/jpg"] and img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
            
        data = list(img.getdata())
        image_without_exif = Image.new(img.mode, img.size)
        image_without_exif.putdata(data)

        output = io.BytesIO()
        save_format = "JPEG" if mime_type in ["image/jpeg", "image/jpg"] else mime_type.split("/")[-1].upper()
        
        image_without_exif.save(output, format=save_format)
        sanitized_content = output.getvalue()
        
        # Determine strict extension based on actual mime type
        ext = mimetypes.guess_extension(mime_type)
        if not ext:
            ext = "." + save_format.lower()
            
        # Remove the leading dot
        ext = ext.lstrip(".")
        # Standardize jpeg
        if ext == "jpe":
            ext = "jpeg"

        return sanitized_content, mime_type, ext

    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid or corrupted image file.")
