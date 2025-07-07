const API_BASE_URL = '/api/clinics'; // Assuming frontend and backend are served on the same domain or proxied

/**
 * Fetches a list of clinics, optionally filtered.
 * @param {object} filters - An object containing filter criteria.
 * Example: { region: 'Ashanti', service: 'Dental', name: 'City Clinic', cost: 'low' }
 * All filters are optional.
 * @returns {Promise<Array>} A promise that resolves to an array of clinic objects.
 */
export const fetchClinics = async (filters = {}) => {
  // Remove any null or undefined filter values before creating query string
  const activeFilters = {};
  for (const key in filters) {
    if (filters[key] !== null && filters[key] !== undefined && String(filters[key]).trim() !== '') {
      activeFilters[key] = String(filters[key]).trim();
    }
  }

  const queryParams = new URLSearchParams(activeFilters).toString();
  const url = queryParams ? `${API_BASE_URL}?${queryParams}` : API_BASE_URL;

  console.log(`Fetching clinics from URL: ${url}`); // For debugging

  const response = await fetch(url);

  if (!response.ok) {
    let errorMessage = `Failed to fetch clinics. Status: ${response.status}`;
    try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
    } catch (e) {
        // Could not parse JSON, stick with status code error
        console.error("Could not parse error JSON from backend:", e);
    }
    console.error("fetchClinics error:", errorMessage);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("Fetched clinics data:", data); // For debugging
  return data; // Expects an array of clinic objects
};

/**
 * Fetches details for a single clinic by its ID.
 * @param {string} clinicId - The ID of the clinic to fetch.
 * @returns {Promise<object>} A promise that resolves to a single clinic object.
 */
export const fetchClinicById = async (clinicId) => {
  if (!clinicId) {
    console.error("fetchClinicById error: Clinic ID is required.");
    throw new Error("Clinic ID is required to fetch details.");
  }
  const url = `${API_BASE_URL}/${clinicId}`;
  console.log(`Fetching clinic by ID from URL: ${url}`); // For debugging

  const response = await fetch(url);

  if (!response.ok) {
    let errorMessage = `Failed to fetch clinic details for ID ${clinicId}. Status: ${response.status}`;
    try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
    } catch (e) {
        console.error("Could not parse error JSON from backend:", e);
    }
    console.error("fetchClinicById error:", errorMessage);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log(`Fetched clinic data for ID ${clinicId}:`, data); // For debugging
  return data; // Expects a single clinic object
};
