// Memoization utility
// Caches function results based on input parameters

interface MemoizedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>;
  clear: () => void;
  cache: Map<string, ReturnType<T>>;
}

/**
 * Memoize a function - cache results based on arguments
 * @param fn - Function to memoize
 * @param keyFn - Optional function to generate cache key from arguments
 * @returns Memoized function with clear() method
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyFn?: (...args: Parameters<T>) => string
): MemoizedFunction<T> {
  const cache = new Map<string, ReturnType<T>>();
  
  const memoized = ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as MemoizedFunction<T>;
  
  memoized.clear = () => cache.clear();
  memoized.cache = cache;
  
  return memoized;
}

/**
 * Memoize with TTL (Time To Live)
 * Cache entries expire after specified time
 */
export function memoizeWithTTL<T extends (...args: any[]) => any>(
  fn: T,
  ttl: number, // milliseconds
  keyFn?: (...args: Parameters<T>) => string
): MemoizedFunction<T> {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();
  
  const memoized = ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    const now = Date.now();
    
    const cached = cache.get(key);
    if (cached && (now - cached.timestamp) < ttl) {
      return cached.value;
    }
    
    const result = fn(...args);
    cache.set(key, { value: result, timestamp: now });
    
    // Clean up expired entries
    for (const [k, v] of cache.entries()) {
      if ((now - v.timestamp) >= ttl) {
        cache.delete(k);
      }
    }
    
    return result;
  }) as MemoizedFunction<T>;
  
  memoized.clear = () => cache.clear();
  memoized.cache = cache as any;
  
  return memoized;
}
