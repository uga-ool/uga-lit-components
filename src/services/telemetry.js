// Minimal no-op telemetry that you can later wire to GA, etc.
export const track = (event, data = {}) => {
  // console.log('[telemetry]', event, data);
};
