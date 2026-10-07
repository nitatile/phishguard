// Fallback / demo content used when the live backend is unreachable,
// and sample content used to make live demos (e.g. a SIWES defense) reliable
// without depending on having a real phishing email on hand.

export const DEMO_STATS = {
  total_scanned: 47,
  high_risk_count: 12,
  average_score: 38,
};

export const DEMO_SUBMISSIONS = [
  { id: "d1", subject: "Urgent: Verify your account now", sender_email: "security@paypa1-support.com", risk_level: "high", risk_score: 86 },
  { id: "d2", subject: "Your invoice is attached", sender_email: "billing@vendor-corp.com", risk_level: "low", risk_score: 12 },
  { id: "d3", subject: "Action required: Password expiring", sender_email: "it-helpdesk@corp-mail-secure.net", risk_level: "high", risk_score: 79 },
  { id: "d4", subject: "Team meeting notes", sender_email: "amaka.obi@company.com", risk_level: "low", risk_score: 4 },
  { id: "d5", subject: "You've won a gift card!", sender_email: "promo@rewards-claim-now.com", risk_level: "medium", risk_score: 54 },
];

export const DEMO_SCENARIOS = [
  {
    id: "ds1",
    sender_display: "IT Support <it-support@yourcompany-helpdesk.com>",
    email_subject: "Immediate action: your mailbox is almost full",
    email_body:
      "Your mailbox has exceeded its storage limit. Click the link below within 24 hours to avoid permanent suspension of your account: http://mailbox-verify-now.com/login",
    correct_answer: "phishing",
    explanation:
      "Urgency, a lookalike domain, and a generic greeting are classic phishing indicators — legitimate IT notices rarely threaten suspension within 24 hours.",
  },
  {
    id: "ds2",
    sender_display: "Amaka Obi <amaka.obi@company.com>",
    email_subject: "Notes from today's standup",
    email_body:
      "Hi team, attaching my notes from this morning's standup. Let me know if I missed anything before Friday's review.",
    correct_answer: "safe",
    explanation:
      "A known internal sender, no urgency, no links or attachments requesting credentials — this reads as routine internal correspondence.",
  },
];

export const SAMPLE_PHISHING_EMAIL = `From: "PayPaI Security" <security@paypa1-verification-center.com>
To: you@example.com
Subject: Urgent: Unusual sign-in activity detected on your account

Dear Valued Customer,

We detected an unusual sign-in attempt on your account from a new device.
If this wasn't you, your account may be at risk. For your protection, we have
temporarily limited some features of your account.

To restore full access, please verify your identity immediately by clicking
the secure link below within 24 hours, or your account will be suspended:

http://paypal-account-verification.secure-loginhelp.com/verify?id=28471

Please do not reply to this email. This mailbox is not monitored.

Thank you for your prompt attention to this matter.

PayPaI Security Team`;
