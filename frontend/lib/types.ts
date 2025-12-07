export type Module = {
  id: string;
  code: string;
  display_name: string;
  description?: string;
};

export type ProformaItem = {
  id: string;
  text: string;
  order: number;
  weight: number;
};

export type ProformaSection = {
  id: string;
  title: string;
  order: number;
  items: ProformaItem[];
};

export type ProformaTemplate = {
  id: string;
  code: string;
  title: string;
  authority_name?: string;
  version: string;
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
