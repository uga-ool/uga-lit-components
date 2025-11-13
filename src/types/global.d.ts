// Global type declarations

// Axios is available globally in Brightspace environment
declare const axios: any;

// D2L/Brightspace window object extensions
declare global {
  interface Window {
    D2L?: {
      LearnerExperience?: any;
    };
  }
}

export {};
