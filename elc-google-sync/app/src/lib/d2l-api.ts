/**
 * Minimal D2L/eLC API client for Template Manager.
 * Uses fetch - must run in eLC context for same-origin API calls.
 */

export interface ApiVersions {
  [key: string]: string;
}

export interface Enrollment {
  OrgUnit: { Id: number; Name: string };
  User: { Identifier: string; DisplayName: string };
  Role: { Id: number; Code: string; Name: string };
}

export interface ContentModule {
  ModuleId: number;
  Title: string;
  Description?: string;
  IsHidden: boolean;
  Topics?: ContentTopic[];
}

export interface ContentTopic {
  TopicId: number;
  Title: string;
  Description?: string;
  Url?: string;
  IsHidden: boolean;
}

const versionsCache: { data: ApiVersions | null; ts: number } = { data: null, ts: 0 };
const CACHE_MS = 5 * 60 * 1000;

async function d2lFetch(url: string): Promise<Response> {
  const res = await fetch(url, { credentials: 'same-origin' });
  if (!res.ok) throw new Error(`D2L API ${res.status}: ${url}`);
  return res;
}

/**
 * Get current course OU from URL or D2L context.
 */
export function getCourse(): string | null {
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has('ou')) return searchParams.get('ou');

  const hash = window.location.hash;
  if (hash) {
    const hashParams = new URLSearchParams(hash.substring(1));
    if (hashParams.has('ou')) return hashParams.get('ou');
  }

  const d2l = (window as any).D2L?.LearnerExperience?.Context?.orgUnitId;
  if (d2l != null) return String(d2l);

  const pathSegments = window.location.href.split('/');
  const contentIndex = pathSegments.findIndex((s) => s === 'content' || s === 'home' || s === 'course');
  if (contentIndex >= 0 && pathSegments.length > contentIndex + 1) {
    const ou = pathSegments[contentIndex + 1]?.split('?')[0]?.split('-')[0];
    if (ou && /^\d+$/.test(ou)) return ou;
  }

  return null;
}

/**
 * Get D2L API versions (simplified).
 */
export async function getVersions(): Promise<ApiVersions> {
  if (versionsCache.data && Date.now() - versionsCache.ts < CACHE_MS) {
    return versionsCache.data;
  }
  const res = await d2lFetch('/d2l/api/versions/');
  const arr = await res.json();
  const result: ApiVersions = {};
  for (const item of arr) {
    result[item.ProductCode] = item.LatestVersion;
  }
  versionsCache.data = result;
  versionsCache.ts = Date.now();
  return result;
}

/**
 * Get current user's enrollment for a course.
 */
export async function getEnrollment(ou: string, lpVersion: string): Promise<Enrollment | null> {
  const res = await d2lFetch(
    `/d2l/api/lp/${lpVersion}/enrollments/myenrollments/?orgUnitTypeId=3`
  );
  const json = await res.json();
  const items: Enrollment[] = json.Items || [];
  for (const item of items) {
    if (item.OrgUnit.Id.toString() === ou) return item;
  }
  return null;
}

/**
 * Admin role IDs (UGA: 169 = Administrator; 170–173 = Instructor variants).
 * SPEC: Template Manager is admin-only; adjust if UGA confirms different IDs.
 */
export const ADMIN_ROLE_IDS = [169, 170, 171, 172, 173];

/**
 * Check if enrollment indicates admin/instructor.
 */
export function isAdmin(enrollment: Enrollment | null): boolean {
  if (!enrollment?.Role) return false;
  const { Id, Name } = enrollment.Role;
  if (ADMIN_ROLE_IDS.includes(Id)) return true;
  return /admin/i.test(Name ?? '');
}

/**
 * Fallback for org-level admins: probe org structure API.
 * Org admins can read org structure; instructors/students typically get 403.
 */
export async function canAccessOrgStructure(ou: string, lpVersion: string): Promise<boolean> {
  const res = await fetch(`/d2l/api/lp/${lpVersion}/orgstructure/${ou}`, {
    credentials: 'same-origin',
  });
  return res.ok;
}

/**
 * Fetch content table of contents.
 */
export async function getContentTOC(ou: string, leVersion: string): Promise<ContentModule[]> {
  const res = await d2lFetch(`/d2l/api/le/${leVersion}/${ou}/content/toc`);
  return res.json();
}
