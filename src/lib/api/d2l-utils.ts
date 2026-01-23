// D2L/Brightspace utility functions
// Helper functions for working with D2L data

/**
 * Get the current course/OU ID from the URL
 * Tries multiple methods: URL parameter, query string, then path parsing
 * @returns Course ID or null if not found
 */
export function getCourse(): string | null {
  const currentLocation = window.location;
  const url = currentLocation.href;
  const searchParams = new URLSearchParams(currentLocation.search);
  let ou: string | null = null;

  // Method 1: Try URLSearchParams (most reliable for ?ou=12345)
  if (searchParams.has('ou')) {
    ou = searchParams.get('ou');
    if (ou) return ou;
  }

  // Method 2: Try hash parameters (e.g., #ou=12345)
  const hash = currentLocation.hash;
  if (hash) {
    const hashParams = new URLSearchParams(hash.substring(1));
    if (hashParams.has('ou')) {
      ou = hashParams.get('ou');
      if (ou) return ou;
    }
  }

  // Method 3: Parse from URL path segments
  // Try to extract from URL parameter in path (e.g., .../content/12345?ou=67890)
  const pathSegments = url.split('/');
  const lastSegment = pathSegments[pathSegments.length - 1];
  
  // Check if last segment contains query params
  if (lastSegment.includes('?')) {
    const [pathPart, queryPart] = lastSegment.split('?');
    const segmentParams = new URLSearchParams(queryPart);
    if (segmentParams.has('ou')) {
      ou = segmentParams.get('ou');
      if (ou) return ou;
    }
  }
  
  // Check for &ou= in the last segment
  if (lastSegment.includes('&')) {
    const attributes = lastSegment.split('&');
    for (const attribute of attributes) {
      if (attribute.startsWith('ou=')) {
        ou = attribute.slice(3);
        // Remove any trailing query params or fragments
        ou = ou.split('?')[0].split('#')[0];
        if (ou) return ou;
      }
    }
  }

  // Method 4: Parse from folder structure in URL
  // Typical D2L URL structure: /d2l/le/content/123456/...
  // But be careful - this might be a content folder ID, not a course ID
  if (ou === null && pathSegments.length > 5) {
    // Look for content, home, or course-related paths
    const contentIndex = pathSegments.findIndex(seg => seg === 'content' || seg === 'home' || seg === 'course');
    if (contentIndex >= 0 && pathSegments.length > contentIndex + 1) {
      const potentialOu = pathSegments[contentIndex + 1];
      if (potentialOu) {
        // Remove any query params or fragments
        const parts = potentialOu.split('-');
        if (parts.length > 0) {
          ou = parts[0].split('?')[0].split('#')[0];
          // Validate it looks like a number
          if (ou && /^\d+$/.test(ou)) {
            return ou;
          }
        }
      }
    }
  }

  // Method 5: Try to get from D2L global object if available
  if (typeof window !== 'undefined' && (window as any).D2L?.LearnerExperience?.Context?.orgUnitId) {
    const d2lOu = String((window as any).D2L.LearnerExperience.Context.orgUnitId);
    if (d2lOu) return d2lOu;
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
