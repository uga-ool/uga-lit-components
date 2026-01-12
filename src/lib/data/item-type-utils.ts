// Utility functions for item type detection and filtering
// Shared logic used by assignment and duedate components

export type ItemType = 'assignment' | 'discussion' | 'quiz' | 'content';

export const DEFAULT_TYPES: ItemType[] = ['assignment', 'discussion', 'quiz', 'content'];
export const DEFAULT_TYPES_STRING = 'assignment,discussion,quiz,content';

export interface ItemWithType {
  TopicId?: number;
  ForumId?: number;
  ItemType?: string | number;
}

/**
 * Determine the item type (assignment, discussion, quiz, content)
 */
export function getItemType(item: ItemWithType): ItemType {
  // Check if it's a discussion
  if (item.TopicId || item.ForumId || 
      item.ItemType === 'Discussion' || 
      item.ItemType === 'DiscussionTopic' ||
      (typeof item.ItemType === 'string' && item.ItemType.toLowerCase().includes('discussion'))) {
    return "discussion";
  }
  // Check if it's a quiz (might have ItemType or ContentType indicating quiz)
  if (item.ItemType === 'Quiz' || item.ItemType === 'Quizzing' ||
      (typeof item.ItemType === 'string' && item.ItemType.toLowerCase().includes('quiz'))) {
    return "quiz";
  }
  // Check if it's content
  if (item.ItemType === 'Content' || item.ItemType === 'ContentObject' ||
      (typeof item.ItemType === 'string' && item.ItemType.toLowerCase().includes('content'))) {
    return "content";
  }
  // Default to assignment
  return "assignment";
}

/**
 * Get the types array from a comma-separated string
 */
export function getTypesArray(typesString: string | null | undefined): ItemType[] {
  if (!typesString) return DEFAULT_TYPES;
  return typesString.split(',').map(t => t.trim().toLowerCase()) as ItemType[];
}

/**
 * Check if an item should be included based on the types filter
 */
export function shouldIncludeItem(item: ItemWithType, allowedTypes: ItemType[]): boolean {
  const itemType = getItemType(item);
  return allowedTypes.includes(itemType);
}

/**
 * Format the item type for display (capitalize first letter)
 */
export function formatItemType(item: ItemWithType): string {
  const itemType = getItemType(item);
  return itemType.charAt(0).toUpperCase() + itemType.slice(1);
}
