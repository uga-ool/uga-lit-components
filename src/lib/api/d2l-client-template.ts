/**
 * Helpers for uga-template-manager: preview and (future) template operations.
 */
import { getContentTOC } from './d2l-client-content.js';

export interface TemplateManagerPreview {
  liveOu: string;
  templateOu: string;
  liveModuleCount: number;
  templateModuleCount: number;
  error?: string;
}

/**
 * MVP: compare content module counts between live and template org units (read-only).
 */
export async function getTemplateManagerPreview(
  liveOu: string,
  templateOu: string,
  leVersion: string
): Promise<TemplateManagerPreview> {
  try {
    const [liveToc, templateToc] = await Promise.all([
      getContentTOC(liveOu, leVersion),
      getContentTOC(templateOu, leVersion),
    ]);
    return {
      liveOu,
      templateOu,
      liveModuleCount: liveToc.length,
      templateModuleCount: templateToc.length,
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      liveOu,
      templateOu,
      liveModuleCount: 0,
      templateModuleCount: 0,
      error: msg,
    };
  }
}
