export interface AcceptanceOptions {
  fetcher?: (url: string, init: RequestInit) => Promise<Response>;
  origin?: string;
  token?: string;
}
export interface AcceptanceCheck {
  name: string;
  status: 'pass' | 'fail';
  duration_ms?: number;
  organization_id?: string;
  default_client_id?: string | null;
  scopes?: string[];
  returned_count?: number;
}
export function runAcceptance(options?: AcceptanceOptions): Promise<{
  checks: AcceptanceCheck[];
  authenticated: 'attempted' | 'skipped_no_credential';
  research_started: false;
}>;
