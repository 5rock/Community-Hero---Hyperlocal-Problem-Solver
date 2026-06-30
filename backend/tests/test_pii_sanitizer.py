from app.services.pii_sanitizer import PIISanitizer


def test_sanitize_email():
    text = "My email is test@example.com"
    sanitized = PIISanitizer.sanitize(text)
    assert sanitized == "My email is [EMAIL REDACTED]"


def test_sanitize_phone():
    text = "Call me at +91 9876543210"
    sanitized = PIISanitizer.sanitize(text)
    assert sanitized == "Call me at [PHONE REDACTED]"


def test_sanitize_aadhaar():
    text = "My Aadhaar is 1234-5678-9012."
    sanitized = PIISanitizer.sanitize(text)
    assert sanitized == "My Aadhaar is [ID REDACTED]."


def test_sanitize_credit_card():
    text = "My card number is 1234-5678-1234-5678."
    sanitized = PIISanitizer.sanitize(text)
    assert sanitized == "My card number is [CARD REDACTED]."


def test_multiple_pii():
    text = "Contact me at test@example.com or 98765-43210. ID: 123456789012"
    sanitized = PIISanitizer.sanitize(text)
    assert (
        sanitized
        == "Contact me at [EMAIL REDACTED] or [PHONE REDACTED]. ID: [ID REDACTED]"
    )


def test_no_pii():
    text = "Hello world! This is a simple message."
    sanitized = PIISanitizer.sanitize(text)
    assert sanitized == text
