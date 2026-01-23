// API Response Cache
// Provides in-memory caching for API responses to reduce redundant calls

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface InFlightRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

/**
 * Simple in-memory cache for API responses
 */
class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private inFlightRequests = new Map<string, InFlightRequest<any>>();
  
  // Default TTL values (in milliseconds)
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly TTL_OVERRIDES: Record<string, number> = {
    'versions': 30 * 60 * 1000, // 30 minutes - versions rarely change
    'course': 60 * 60 * 1000, // 1 hour - course ID doesn't change
    'enrollment': 10 * 60 * 1000, // 10 minutes - enrollment can change
    'classlist': 5 * 60 * 1000, // 5 minutes - classlist can change
    'assignments': 2 * 60 * 1000, // 2 minutes - assignments change frequently
    'gradebook': 2 * 60 * 1000, // 2 minutes - grades change frequently
  };
  
  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    const age = now - entry.timestamp;
    
    if (age > entry.ttl) {
      // Cache expired
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  /**
   * Set cached data with TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const cacheKey = this.getCacheKey(key);
    const entryTTL = ttl || this.getTTL(key);
    
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: entryTTL
    });
  }
  
  /**
   * Check if there's an in-flight request for this key
   */
  getInFlight<T>(key: string): Promise<T> | null {
    const inFlight = this.inFlightRequests.get(key);
    if (!inFlight) return null;
    
    // Clean up old in-flight requests (older than 30 seconds)
    const age = Date.now() - inFlight.timestamp;
    if (age > 30000) {
      this.inFlightRequests.delete(key);
      return null;
    }
    
    return inFlight.promise as Promise<T>;
  }
  
  /**
   * Register an in-flight request
   */
  setInFlight<T>(key: string, promise: Promise<T>): void {
    this.inFlightRequests.set(key, {
      promise,
      timestamp: Date.now()
    });
    
    // Clean up when promise resolves/rejects
    promise.finally(() => {
      this.inFlightRequests.delete(key);
    });
  }
  
  /**
   * Clear cache entry
   */
  clear(key: string): void {
    this.cache.delete(this.getCacheKey(key));
  }
  
  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear();
    this.inFlightRequests.clear();
  }
  
  /**
   * Get cache key with prefix
   */
  private getCacheKey(key: string): string {
    return `api:${key}`;
  }
  
  /**
   * Get TTL for a cache key based on its type
   */
  private getTTL(key: string): number {
    // Extract the type from the key (e.g., "versions", "classlist:12345")
    const type = key.split(':')[0];
    return this.TTL_OVERRIDES[type] || this.DEFAULT_TTL;
  }
  
  /**
   * Get cache statistics (useful for debugging)
   */
  getStats(): {
    cacheSize: number;
    inFlightSize: number;
    keys: string[];
  } {
    return {
      cacheSize: this.cache.size,
      inFlightSize: this.inFlightRequests.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Singleton instance
export const apiCache = new ApiCache();

/**
 * Cached API call wrapper
 * Automatically caches responses and deduplicates concurrent requests
 * 
 * @param key - Unique cache key
 * @param fn - Function that returns a Promise
 * @param ttl - Optional TTL override in milliseconds
 * @returns Cached or fresh data
 */
export async function cachedApiCall<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Check cache first
  const cached = apiCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }
  
  // Check for in-flight request
  const inFlight = apiCache.getInFlight<T>(key);
  if (inFlight) {
    return inFlight;
  }
  
  // Make new request
  const promise = fn();
  apiCache.setInFlight(key, promise);
  
  try {
    const data = await promise;
    apiCache.set(key, data, ttl);
    return data;
  } catch (error) {
    // Don't cache errors
    throw error;
  }
}

/**
 * Clear cache for a specific key
 */
export function clearCache(key: string): void {
  apiCache.clear(key);
}

/**
 * Clear all API cache
 */
export function clearAllCache(): void {
  apiCache.clearAll();
}
