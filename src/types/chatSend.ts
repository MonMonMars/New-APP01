export type ChatSendOutcome =
  | 'sent'
  | 'rate_limited'
  | 'upload_failed'
  | 'invalid'
  | 'scam_link_blocked';
