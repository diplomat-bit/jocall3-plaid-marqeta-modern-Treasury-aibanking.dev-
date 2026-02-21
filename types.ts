
export interface PlaidCredentials {
  clientId: string;
  secret: string;
  environment: 'sandbox' | 'development' | 'production';
}

export interface MarqetaCredentials {
  applicationToken: string;
  adminAccessToken: string;
}

export interface ModernTreasuryCredentials {
  organizationId: string;
  apiKey: string;
}

export interface PlaidTokenState {
  linkToken: string | null;
  publicToken: string | null;
  accessToken: string | null;
}

export interface Account {
  id: string;
  name: string;
  mask: string;
  type: string;
  subtype: string;
  balance: {
    available: number | null;
    current: number | null;
    limit: number | null;
    currency: string;
  };
}

export interface Transaction {
  id: string;
  date: string;
  name: string;
  amount: number;
  category: string[];
  pending: boolean;
}

export interface MarqetaCardProduct {
  token: string;
  name: string;
  active: boolean;
  created_time: string;
  config: any;
}

export interface MarqetaCard {
  token: string;
  user_token: string;
  card_product_token: string;
  last_four: string;
  pan: string;
  expiration: string;
  cvv: string;
  state: string;
}

export interface MTLedger {
  id: string;
  name: string;
  description: string | null;
  metadata: Record<string, string>;
}

export interface MTInternalAccount {
  id: string;
  name: string;
  currency: string;
  connection: { vendor_name: string };
  status: string;
}

export enum FlowStep {
  CREDENTIALS = 'CREDENTIALS',
  LINK_TOKEN = 'LINK_TOKEN',
  LINK_UI = 'LINK_UI',
  EXCHANGE = 'EXCHANGE',
  DASHBOARD = 'DASHBOARD'
}
