// D2L/Brightspace-specific helpers (keep all LMS quirks here)
export const inBrightspace = () => !!window?.D2L?.LearnerExperience || /brightspace|d2l/i.test(location.hostname);

export function publicFileUrl(pathRelativeToPublic) {
  // If your course uses a stable public path, centralize it here:
  // return `${getCoursePublicBase()}/${pathRelativeToPublic}`;
  return pathRelativeToPublic; // default: relative paths work when files are co-located
}
