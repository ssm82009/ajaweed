/**
 * API Configuration
 * Determines the base URL for API calls based on environment
 */

// Get the current hostname
const hostname = window.location.hostname;

// Determine API base URL
export const API_BASE_URL = (() => {
    // Development environment (localhost)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return ''; // Use proxy
    }

    // Production environment (cPanel)
    // Use the same hostname as the frontend
    return ''; // Use relative paths for production too
})();

// Export helper function for API calls
export const getApiUrl = (path: string) => {
    return `${API_BASE_URL}${path}`;
};
