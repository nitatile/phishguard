"""
PhishGuard — Email Parser
Extracts the fields the detection engine needs from a raw email
(headers + body). No external libraries required — uses Python's
built-in `email` package.
"""

import re
from email import policy
from email.parser import Parser, BytesParser
from email.utils import parseaddr


def parse_raw_email(raw_email: str) -> dict:
    """
    Parses a raw email STRING (e.g. pasted into a textarea) and
    returns a dict with everything the detection heuristics need.
    """
    msg = Parser(policy=policy.default).parsestr(raw_email)
    return _extract_fields(msg)


def parse_eml_file(file_bytes: bytes) -> dict:
    """
    Parses an uploaded .eml FILE (raw bytes) — use this one if you
    add file upload later instead of paste-in-textarea.
    """
    msg = BytesParser(policy=policy.default).parsebytes(file_bytes)
    return _extract_fields(msg)


def _extract_fields(msg) -> dict:
    # --- Basic headers ---
    subject = msg.get("Subject", "")
    from_header = msg.get("From", "")
    reply_to_header = msg.get("Reply-To", "")

    # parseaddr splits 'Display Name <email@domain.com>' into
    # ('Display Name', 'email@domain.com') — handles missing parts too
    from_name, from_address = parseaddr(from_header)
    reply_name, reply_address = parseaddr(reply_to_header)

    from_domain = from_address.split("@")[-1].lower() if "@" in from_address else ""
    reply_domain = reply_address.split("@")[-1].lower() if "@" in reply_address else ""

    # --- Authentication headers (SPF/DKIM/DMARC, if present) ---
    auth_results = msg.get("Authentication-Results", "")

    # --- Body + links ---
    body = _extract_body(msg)
    links = _extract_links(body)

    return {
        "subject": subject,
        "from_name": from_name,
        "from_address": from_address,
        "from_domain": from_domain,
        "reply_to_address": reply_address,
        "reply_to_domain": reply_domain,
        "authentication_results": auth_results,
        "body": body,
        "links": links,
        "raw_headers": dict(msg.items()),  # keep everything, in case you need more later
    }


def _extract_body(msg) -> str:
    """
    Emails can be multipart (plain text + HTML versions) or single-part.
    This grabs the plain text version if available, falls back to HTML.
    """
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                return part.get_content()
        for part in msg.walk():
            if part.get_content_type() == "text/html":
                return part.get_content()
        return ""
    else:
        return msg.get_content()


def _extract_links(body: str) -> list:
    """
    Pulls out URLs from the body text. Also catches 'hxxp' style
    (a common defanging convention used when sharing phishing samples).
    """
    url_pattern = r'(?:https?|hxxps?)://[^\s<>"\')]+'
    return re.findall(url_pattern, body)


# ---------------------------------------------------------------
# Quick test — run this file directly to see it work on a sample
# ---------------------------------------------------------------
if __name__ == "__main__":
    sample_email = """From: "GTBank Alerts" <alerts@gtb-secure-ng.com>
Reply-To: verify-support@gtb-secure-ng.com
Subject: URGENT: Your account will be suspended in 24 hours
Content-Type: text/plain

Dear Customer,

We detected unusual activity on your account. Verify immediately:
hxxp://gtbank-verify.secure-auth-ng.com/login

GTBank Security Team
"""
    result = parse_raw_email(sample_email)
    for key, value in result.items():
        print(f"{key}: {value}")
