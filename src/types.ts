export type SectionContent = Record<string, unknown>;

export interface SectionEntry {
  sectionKey: string;
  displayName: string;
  isFixed: boolean;
  sortOrder: number;
  content: SectionContent;
  isEnabled: boolean;
}

export interface AgencyInfo {
  name: string;
  email: string;
  phoneNumber?: string | null;
  contacts?: Record<string, unknown> | null;
  logo?: string | null;
  website?: string | null;
}

export interface WebsiteData {
  agency: AgencyInfo;
  template: { templateId: string; name: string; globalSettings?: Record<string, unknown> } | null;
  sections: SectionEntry[];
}

export interface AdminSection {
  templateSectionId: string;
  sectionKey: string;
  displayName: string;
  isFixed: boolean;
  sortOrder: number;
  defaultConfig: Record<string, unknown> | null;
  content: SectionContent | null;
  isEnabled: boolean;
  agencySectionId: string | null;
}

export interface FieldSchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'json';
  required: boolean;
  description?: string;
  options?: string[];
  fields?: Record<string, FieldSchema>;
  itemShape?: Record<string, FieldSchema>;
  arrayItemType?: 'string' | 'number';
}

export interface SectionSchema {
  sectionKey: string;
  displayName: string;
  description?: string;
  fields: Record<string, FieldSchema>;
}

export interface SectionDetails {
  templateSectionId: string;
  sectionKey: string;
  displayName: string;
  isFixed: boolean;
  sortOrder: number;
  content: SectionContent | null;
  agencySectionId: string | null;
  schema: SectionSchema;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function str<T extends object>(content: T, key: string, fb = ''): string {
  const v = (content as Record<string, unknown>)[key];
  return typeof v === 'string' && v ? v : fb;
}

export function num<T extends object>(content: T, key: string, fb = 0): number {
  const v = (content as Record<string, unknown>)[key];
  return typeof v === 'number' ? v : fb;
}

export function arr<T>(content: SectionContent, key: string): T[] {
  const v = content[key];
  return Array.isArray(v) ? (v as T[]) : [];
}

export function obj<T extends object>(content: T, key: string): SectionContent {
  const v = (content as Record<string, unknown>)[key];
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as SectionContent) : {};
}

export function isEnabled(section: SectionEntry): boolean {
  return section.isEnabled !== false;
}
