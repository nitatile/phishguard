"""
PhishGuard — Detection Engine
Takes the parsed email (see email_parser.py) and runs it through
heuristic checks. Each check that fires adds points + a human-readable
explanation. Total score -> risk level.
"""

import re
from difflib import SequenceMatcher

# Known brand domains — extend this list with the brands relevant
# to your organization (banks, common software vendors, etc.)
KNOWN_BRAND_DOMAINS = {
    "gtbank": "gtbank.com",
    "gtbank alerts": "gtbank.com",
    "access bank": "accessbankplc.com",
    "zenith bank": "zenithbank.com",
    "first bank": "firstbanknigeria.com",
    "microsoft": "microsoft.com",
    "google": "google.com",
}

URGENCY_KEYWORDS = [
    "urgent", "immediately", "act now", "24 hours", "suspend",
    "verify your account", "act today", "final notice", "restricted",
    "unusual activity", "click here", "expire", "failure to act",
]

FINANCIAL_KEYWORDS = [
    "wire transfer", "bank details", "change of account", "invoice",
    "payment", "beneficiary", "swift code", "account number", "settle",
]


def domain_similarity(a: str, b: str) -> float:
    """Returns a 0-1 similarity score between two domains."""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def check_domain_spoof(parsed: dict) -> dict | None:
    """Flags when the display name suggests a known brand, but the
    actual sending domain doesn't match that brand's real domain."""
    display_name = (parsed["from_name"] or "").lower()
    from_domain = (parsed["from_domain"] or "").lower()

    for brand, real_domain in KNOWN_BRAND_DOMAINS.items():
        if brand in display_name and real_domain not in from_domain:
            return {
                "flag_type": "domain_spoof",
                "detail_text": f'"{parsed["from_name"]}" sent from {from_domain} — not a recognized {real_domain} domain',
                "points_assigned": 30,
            }

    # Also catch typosquatting even without a known display name match,
    # e.g. gtbank-secure-ng.com vs gtbank.com
    for brand, real_domain in KNOWN_BRAND_DOMAINS.items():
        base = real_domain.split(".")[0]
        if base in from_domain and from_domain != real_domain:
            similarity = domain_similarity(from_domain, real_domain)
            if similarity < 0.9:  # similar-looking but not exact = suspicious
                return {
                    "flag_type": "domain_typosquat",
                    "detail_text": f"{from_domain} closely resembles {real_domain} but is not an exact match",
                    "points_assigned": 25,
                }
    return None


def check_reply_to_mismatch(parsed: dict) -> dict | None:
    from_domain = parsed["from_domain"]
    reply_domain = parsed["reply_to_domain"]

    if reply_domain and from_domain and reply_domain != from_domain:
        return {
            "flag_type": "reply_to_mismatch",
            "detail_text": f"Replies route to {reply_domain}, different from the sending domain {from_domain}",
            "points_assigned": 15,
        }
    return None


def check_urgency_language(parsed: dict) -> dict | None:
    body = (parsed["body"] or "").lower()
    subject = (parsed["subject"] or "").lower()
    text = f"{subject} {body}"

    found = [kw for kw in URGENCY_KEYWORDS if kw in text]
    if found:
        return {
            "flag_type": "urgency_language",
            "detail_text": f"Urgency/pressure language detected: {', '.join(found[:4])}",
            "points_assigned": min(15 + (len(found) - 1) * 3, 25),
        }
    return None


def check_financial_request(parsed: dict) -> dict | None:
    body = (parsed["body"] or "").lower()
    found = [kw for kw in FINANCIAL_KEYWORDS if kw in body]
    if found:
        return {
            "flag_type": "financial_request",
            "detail_text": f"References financial/payment change: {', '.join(found[:3])}",
            "points_assigned": 20,
        }
    return None


def check_suspicious_links(parsed: dict) -> dict | None:
    links = parsed.get("links", [])
    if not links:
        return None

    from_domain = parsed["from_domain"]
    suspicious = []
    ip_pattern = re.compile(r"https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}")

    for link in links:
        clean_link = link.replace("hxxp", "http")
        if ip_pattern.match(clean_link):
            suspicious.append(link)
            continue
        # crude check: does the link's domain match the sender's domain?
        match = re.search(r"https?://([^/]+)", clean_link)
        if match and from_domain and from_domain not in match.group(1):
            suspicious.append(link)

    if suspicious:
        return {
            "flag_type": "suspicious_link",
            "detail_text": f"Link target does not match sender domain: {suspicious[0]}",
            "points_assigned": 22,
        }
    return None


def check_auth_results(parsed: dict) -> dict | None:
    """If Authentication-Results header exists, check for SPF/DKIM failures.
    Many forwarded/pasted emails won't have this header at all — in that
    case we simply skip the check rather than penalizing."""
    auth = (parsed.get("authentication_results") or "").lower()
    if not auth:
        return None

    if "spf=fail" in auth or "dkim=fail" in auth:
        return {
            "flag_type": "auth_failure",
            "detail_text": "SPF or DKIM authentication failed for this sender",
            "points_assigned": 25,
        }
    return None


def run_detection(parsed: dict) -> dict:
    """Runs all checks, returns total score, risk level, and flag list."""
    checks = [
        check_domain_spoof,
        check_reply_to_mismatch,
        check_urgency_language,
        check_financial_request,
        check_suspicious_links,
        check_auth_results,
    ]

    flags = []
    total_score = 0

    for check in checks:
        result = check(parsed)
        if result:
            flags.append(result)
            total_score += result["points_assigned"]

    total_score = min(total_score, 100)

    if total_score >= 60:
        risk_level = "high"
    elif total_score >= 25:
        risk_level = "medium"
    else:
        risk_level = "low"

    return {
        "risk_score": total_score,
        "risk_level": risk_level,
        "flags": flags,
    }


if __name__ == "__main__":
    from email_parser import parse_raw_email

    sample = """From: "GTBank Alerts" <alerts@gtb-secure-ng.com>
Reply-To: verify-support@gtb-secure-ng.com
Subject: URGENT: Your account will be suspended in 24 hours
Content-Type: text/plain

Dear Customer,

We detected unusual activity on your account. Verify immediately:
hxxp://gtbank-verify.secure-auth-ng.com/login

GTBank Security Team
"""
    parsed = parse_raw_email(sample)
    result = run_detection(parsed)
    print(f"Score: {result['risk_score']} ({result['risk_level']})")
    for f in result["flags"]:
        print(f"  [{f['points_assigned']:+d}] {f['flag_type']}: {f['detail_text']}")
