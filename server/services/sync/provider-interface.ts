import { OAuthTokens } from '../../auth/oauth/types';

export interface ProviderAdapter {
  pullData(tokens: OAuthTokens, options?: { realTime?: boolean }): Promise<any[]>;
  pushData?(tokens: OAuthTokens, data: any[]): Promise<void>;
  // Optionally add more methods for two-way sync
}
