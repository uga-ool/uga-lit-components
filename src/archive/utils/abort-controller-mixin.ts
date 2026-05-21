// AbortController mixin for Lit components
// Provides automatic request cancellation on component disconnect

import type { ReactiveElement } from 'lit';

/**
 * Mixin that adds AbortController support to Lit components
 * Automatically cancels requests when component disconnects
 */
export function AbortControllerMixin<T extends Constructor<ReactiveElement>>(superClass: T) {
  class AbortControllerMixinClass extends superClass {
    protected abortController: AbortController | null = null;
    
    connectedCallback() {
      super.connectedCallback();
      this.abortController = new AbortController();
    }
    
    disconnectedCallback() {
      super.disconnectedCallback();
      // Cancel all in-flight requests
      this.abortController?.abort();
      this.abortController = null;
    }
    
    /**
     * Check if component is still connected (not aborted)
     */
    protected isConnected(): boolean {
      return this.abortController !== null && !this.abortController.signal.aborted;
    }
    
    /**
     * Get abort signal for API calls
     */
    protected getAbortSignal(): AbortSignal | undefined {
      return this.abortController?.signal;
    }
  }
  
  return AbortControllerMixinClass as Constructor<ReactiveElement> & T;
}

// Type helper
type Constructor<T = {}> = new (...args: any[]) => T;
