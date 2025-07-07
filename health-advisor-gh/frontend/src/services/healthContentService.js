const API_BASE_URL = '/api/health-content';

/**
 * Fetches health content, optionally filtered.
 * @param {object} filters - An object containing filter criteria.
 * Example: { category: 'Nutrition', type: 'tip', search: 'hydration' }
 * All filters are optional.
 * @returns {Promise<Array>} A promise that resolves to an array of health content objects.
 */
export const fetchHealthContents = async (filters = {}) => {
  const activeFilters = {};
  for (const key in filters) {
    if (filters[key] !== null && filters[key] !== undefined && String(filters[key]).trim() !== '') {
      activeFilters[key] = String(filters[key]).trim();
    }
  }

  const queryParams = new URLSearchParams(activeFilters).toString();
  const url = queryParams ? `${API_BASE_URL}?${queryParams}` : API_BASE_URL;

  // console.log(`Fetching health content from URL: ${url}`); // For debugging

  const response = await fetch(url);

  if (!response.ok) {
    let errorMessage = `Failed to fetch health content. Status: ${response.status}`;
    try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
    } catch (e) {
        // Could not parse JSON, stick with status code error
        // console.error("Could not parse error JSON from backend:", e); // For debugging
    }
    // console.error("fetchHealthContents error:", errorMessage); // For debugging
    throw new Error(errorMessage);
  }

  const data = await response.json();
  // console.log("Fetched health content data:", data); // For debugging
  return data;
};

/**
 * Fetches a single health content item by its ID.
 * @param {string} contentId - The ID of the content item to fetch.
 * @returns {Promise<object>} A promise that resolves to a single health content object.
 */
export const fetchHealthContentById = async (contentId) => {
  if (!contentId) {
    // console.error("fetchHealthContentById error: Content ID is required."); // For debugging
    throw new Error("Content ID is required to fetch details.");
  }
  const url = `${API_BASE_URL}/${contentId}`;
  // console.log(`Fetching health content by ID from URL: ${url}`); // For debugging

  const response = await fetch(url);

  if (!response.ok) {
    let errorMessage = `Failed to fetch health content item for ID ${contentId}. Status: ${response.status}`;
    try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
    } catch (e) {
        // console.error("Could not parse error JSON from backend:", e); // For debugging
    }
    // console.error("fetchHealthContentById error:", errorMessage); // For debugging
    throw new Error(errorMessage);
  }

  const data = await response.json();
  // console.log(`Fetched health content data for ID ${contentId}:`, data); // For debugging
  return data;
};
