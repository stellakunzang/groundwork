export const INTERVIEW_TYPES = new Set([
  'screen',
  'technical',
  'behavioral',
  'onsite',
  'panel',
]);

export function isInterviewType(type: string): boolean {
  return INTERVIEW_TYPES.has(type.toLowerCase().replace(/\s+/g, '_'));
}
