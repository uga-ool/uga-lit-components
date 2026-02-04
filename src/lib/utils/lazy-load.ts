// Lazy loading utility using Intersection Observer
// Loads component data only when component is visible in viewport

/**
 * Options for lazy loading
 */
interface LazyLoadOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean; // If true, only trigger once
}

/**
 * Create a lazy load observer that triggers callback when element is visible
 * @param element - Element to observe
 * @param callback - Function to call when element becomes visible
 * @param options - Intersection Observer options
 * @returns Cleanup function to disconnect observer
 */
export function observeLazyLoad(
  element: Element,
  callback: () => void,
  options: LazyLoadOptions = {}
): () => void {
  const {
    root = null,
    rootMargin = '50px', // Start loading 50px before element is visible
    threshold = 0.1,
    once = true
  } = options;
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          
          // If once is true, disconnect after first trigger
          if (once) {
            observer.disconnect();
          }
        }
      });
    },
    {
      root,
      rootMargin,
      threshold
    }
  );
  
  observer.observe(element);
  
  // Return cleanup function
  return () => observer.disconnect();
}

/**
 * Check if element is currently visible in viewport
 * @param element - Element to check
 * @returns true if element is visible
 */
export function isVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
