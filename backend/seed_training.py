"""
Run this once (python seed_training.py) after your tables exist,
to populate the training module with sample scenarios so you have
something to test the quiz UI against.
"""

from database import SessionLocal
import models

scenarios = [
    {
        "title": "Bank account suspension",
        "email_subject": "URGENT: Your account will be suspended in 24 hours",
        "sender_display": "GTBank Alerts <alerts@gtb-secure-ng.com>",
        "email_body": "Dear Customer, we detected unusual activity on your account. Verify immediately or face permanent suspension.",
        "is_phishing": True,
        "explanation_text": "Sender domain (gtb-secure-ng.com) isn't GTBank's real domain, and it uses urgency to rush you into acting without checking.",
    },
    {
        "title": "Vendor bank detail change",
        "email_subject": "Updated vendor bank details — please action today",
        "sender_display": "Finance — Tunde Adebayo <t.adebayo@company-ng.co>",
        "email_body": "Hi, please update our payment records — the vendor has changed banks ahead of this month's invoice. Kindly process before EOD.",
        "is_phishing": True,
        "explanation_text": "Classic BEC pattern: urgent request to change payment/banking details, pressuring same-day action.",
    },
    {
        "title": "Team meeting notes",
        "email_subject": "Team standup notes — Friday",
        "sender_display": "Maria Ibrahim <maria.ibrahim@yourcompany.com>",
        "email_body": "Hi team, sharing today's standup notes. Let me know if I missed anything.",
        "is_phishing": False,
        "explanation_text": "Internal sender, matching company domain, no urgency or financial request — normal internal email.",
    },
    {
        "title": "Software invoice",
        "email_subject": "Your invoice #4471 is ready",
        "sender_display": "QuickBooks Billing <billing@quickbooks.com>",
        "email_body": "Your monthly invoice is ready to view in your account. No action required unless you have questions.",
        "is_phishing": False,
        "explanation_text": "Legitimate sender domain, no urgent call to action, and doesn't ask you to click a link to 'verify' anything.",
    },
    {
        "title": "IT password reset",
        "email_subject": "Password expiring — reset now",
        "sender_display": "IT Support <support@it-support-portal.net>",
        "email_body": "Your password expires today. Click here to reset it now to avoid losing access to your account.",
        "is_phishing": True,
        "explanation_text": "Generic third-party domain (not your actual company's IT domain) combined with urgency and a reset link — classic credential-harvesting pattern.",
    },
]

db = SessionLocal()
for s in scenarios:
    exists = db.query(models.TrainingScenario).filter(models.TrainingScenario.title == s["title"]).first()
    if not exists:
        db.add(models.TrainingScenario(**s))
db.commit()
db.close()
print(f"Seeded {len(scenarios)} training scenarios.")
