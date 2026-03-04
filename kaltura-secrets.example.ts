/**
 * Kaltura API credentials template
 *
 * Copy this file to kaltura-secrets.ts and fill in your values.
 * kaltura-secrets.ts is gitignored and will not be committed.
 */

export const KALTURA_SECRETS = {
  /** Partner ID (e.g. 1727411) - from Kaltura Management Console */
  partnerId: 0,

  /** Secret - from Kaltura Management Console > Settings > Integration Settings */
  secret: 'your-secret-here',
} as const;