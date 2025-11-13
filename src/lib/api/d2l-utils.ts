// D2L/Brightspace utility functions
// Helper functions for working with D2L data

/**
 * Get the current course/OU ID from the URL
 * Tries multiple methods: URL parameter, then path parsing
 * @returns Course ID or null if not found
 */
export function getCourse(): string | null {
  const currentLocation = window.location;
  const url = currentLocation.href;
  let ou: string | null = null;
  const pathSegments = url.split('/');

  // Try to extract from URL parameter (e.g., ?ou=12345)
  const lastSegment = pathSegments[pathSegments.length - 1];
  const attributes = lastSegment.split('&');

  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes[i];
    if (attribute.slice(0, 3) === 'ou=') {
      ou = attribute.slice(3);
      return ou;
    }
  }

  // Fallback: parse from folder structure in URL
  // Typical D2L URL structure: /d2l/le/content/123456/...
  if (ou === null && pathSegments.length > 5) {
    const contentSegment = pathSegments[5];
    if (contentSegment) {
      const parts = contentSegment.split('-');
      if (parts.length > 0) {
        ou = parts[0];
        return ou;
      }
    }
  }

  return ou;
}

/**
 * Transform date string to a more readable format
 * @param dateString - ISO date string from D2L API
 * @returns Formatted date string
 */
export function transformDate(dateString: string): string {
  const dateObj = new Date(dateString);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const month = monthNames[dateObj.getMonth()];
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();
  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // Hour '0' should be '12'
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  
  return `${month} ${day}, ${year} at ${hours}:${minutesStr} ${ampm}`;
}

/**
 * Check if code is running inside Brightspace/D2L
 * @returns true if in Brightspace environment
 */
export function inBrightspace(): boolean {
  return !!window?.D2L?.LearnerExperience || /brightspace|d2l/i.test(location.hostname);
}

/**
 * Get parent window URL (useful for iframe contexts)
 * @returns Parent URL or current URL if not in iframe
 */
export function getParentUrl(): string {
  try {
    return window.parent.location.href;
  } catch (e) {
    // Cross-origin iframe - can't access parent URL
    return window.location.href;
  }
}
