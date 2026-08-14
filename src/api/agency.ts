import { api, AGENCY_ID } from './client';
import type {
  AdminSection,
  SectionContent,
  SectionDetails,
  WebsiteData,
} from '../types';

let cachedWebsite: WebsiteData | null = null;

export async function fetchWebsiteContent(): Promise<WebsiteData> {
  if (cachedWebsite) return cachedWebsite;
  const data = await api.get<WebsiteData>(
    `/agency/website-content/${AGENCY_ID}`,
  );
  cachedWebsite = data;
  return data;
}

export function resetWebsiteCache(): void {
  cachedWebsite = null;
}

export async function signin(
  emailOrPhone: string,
  password: string,
): Promise<void> {
  await api.post('/auth/signin', { emailOrPhone, password });
}

export async function fetchMe(): Promise<{ agency?: { name?: string } } | null> {
  try {
    return await api.get('/auth/me');
  } catch {
    return null;
  }
}

export async function fetchSections(): Promise<AdminSection[]> {
  return api.get<AdminSection[]>('/agency/sections');
}

export async function fetchSectionDetails(
  templateSectionId: string,
): Promise<SectionDetails> {
  return api.get<SectionDetails>(
    `/agency/section-details/${templateSectionId}`,
  );
}

export async function saveSectionContent(
  templateSectionId: string,
  content: SectionContent,
): Promise<void> {
  await api.patch(`/agency/sections/${templateSectionId}`, { content });
  resetWebsiteCache();
}

export interface SectionOrderItem {
  templateSectionId: string;
  sortOrder: number;
  isEnabled?: boolean;
}

export async function reorderSections(
  items: SectionOrderItem[],
): Promise<AdminSection[]> {
  const list = await api.patch<AdminSection[]>('/agency/sections/order', {
    items,
  });
  resetWebsiteCache();
  return list;
}

export async function resetSectionsOrder(): Promise<AdminSection[]> {
  const list = await api.post<AdminSection[]>('/agency/sections/reset-order', {});
  resetWebsiteCache();
  return list;
}
