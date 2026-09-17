export type LegalDocumentId =
  | 'terms'
  | 'privacy'
  | 'community'
  | 'disguise'
  | 'verification'
  | 'cookies'
  | 'subscription'
  | 'safety';

export type LegalDocumentSection = {
  id: string;
  title: string;
  body: string;
};

export type LegalDocument = {
  id: LegalDocumentId;
  title: string;
  effective: string;
  intro: string;
  sections: LegalDocumentSection[];
  footer: string;
};

export type LegalDocumentLink = {
  id: LegalDocumentId;
  label: string;
  icon: string;
};
