import re


class PIISanitizer:
    @staticmethod
    def sanitize(text: str) -> str:
        if not text:
            return text

        # 1. Mask Email Addresses
        email_pattern = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
        text = re.sub(email_pattern, "[EMAIL REDACTED]", text)

        # 2. Mask Credit Card numbers (13-16 digits)
        cc_pattern = r"\b(?:\d[ -]*?){13,16}\b"
        text = re.sub(cc_pattern, "[CARD REDACTED]", text)

        # 3. Mask Aadhaar/SSN (12 digit Aadhaar, e.g., 1234-5678-9012 or 123456789012)
        aadhaar_pattern = r"\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b"
        text = re.sub(aadhaar_pattern, "[ID REDACTED]", text)

        # 4. Mask Phone Numbers (matches 10 digits or international formats, 98765-43210, etc.)
        phone_pattern = r"(?<!\d)(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{5}[-.\s]?\d{5}|\d{10})(?!\d)"
        text = re.sub(phone_pattern, "[PHONE REDACTED]", text)

        return text
