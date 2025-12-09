export type Module = {
  id: string;
  code: string;
  display_name: string;
  description?: string;
};

export type ProformaItem = {
  id: string;
  code: string;
  text: string;
  requirement_text: string;
  required_evidence_type: string;
  importance_level?: number;
  implementation_criteria: string;
  order: number;
  weight: number;
  max_score: number;
  weightage_percent: number;
  is_licensing_critical: boolean;
};

export type ProformaSection = {
  id: string;
  code: string;
  title: string;
  description: string;
  order: number;
  weight: number;
  items: ProformaItem[];
};

export type ProformaTemplate = {
  id: string;
  code: string;
  title: string;
  authority_name?: string;
  version: string;
  description: string;
  is_active: boolean;
  sections: ProformaSection[];
};

export type ItemStatus = {
  id: string;
  assignment: string;
  item: string;
  item_text: string;
  status: string;
  comment?: string;
  score?: number;
};

export type Assignment = {
  id: string;
  template: string;
  template_title: string;
  program: string;
  program_name: string;
  title: string;
  status: string;
  item_statuses: ItemStatus[];
  created_at: string;
  updated_at: string;
};

export type Institution = {
  id: string;
  name: string;
  city?: string;
  type?: string;
};

export type PGItemCompliance = {
  id: string;
  institution?: string;
  item: string;
  item_details?: ProformaItem;
  status: 'YES' | 'NO' | 'PARTIAL' | 'NA';
  comment: string;
  evidence_url: string;
  updated_by?: string;
  updated_at: string;
};
