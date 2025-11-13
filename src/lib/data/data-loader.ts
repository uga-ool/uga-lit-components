// Data loader service
// Handles loading JSON files from local or program-specific locations

/**
 * Load data from a JSON file
 * Supports both local files and program-specific shared template locations
 * 
 * @param type - 'local' for local files, 'program' for shared template files
 * @param filename - Name of the JSON file to load
 * @param program - Program identifier (required when type is 'program')
 * @returns Promise resolving to the parsed JSON data
 */
export async function loadData<T>(
  type: 'local' | 'program',
  filename: string,
  program?: string
): Promise<T> {
  let url: string;

  if (type === 'local') {
    url = filename;
  } else if (type === 'program') {
    if (!program) {
      throw new Error('Program identifier is required when type is "program"');
    }
    url = `/shared/ugaonline/templates/${program}/data/${filename}`;
  } else {
    throw new Error(`Invalid type: ${type}. Must be 'local' or 'program'`);
  }

  const response = await axios.get(url);
  return response.data as T;
}

// Axios is available globally in Brightspace
declare const axios: any;
