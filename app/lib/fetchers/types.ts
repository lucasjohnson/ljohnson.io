export interface RawJob {
  external_id: string;
  source: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  visa_sponsorship: boolean;
  salary: string | null;
  url: string;
  tags: string[];
  posted_at: string; // YYYY-MM-DD
  apply_email?: string;
  apply_subject?: string;
}
