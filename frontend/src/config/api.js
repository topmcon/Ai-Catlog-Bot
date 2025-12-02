/**
 * API Configuration
 * Centralizes all API URL configuration for production and development
 */

// Determine API URL based on environment
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_KEY = import.meta.env.VITE_API_KEY || 'test123';

// Frontend URLs (dynamically determined)
export const FRONTEND_URL = typeof window !== 'undefined' 
  ? window.location.origin 
  : 'http://localhost:3001';

export const ADMIN_URL = `${FRONTEND_URL}/admin.html`;

// API endpoints
export const API_ENDPOINTS = {
  HEALTH: `${API_URL}/health`,
  ENRICH: `${API_URL}/enrich`,
  AI_PROVIDERS: `${API_URL}/ai-providers`,
  AI_METRICS: `${API_URL}/ai-metrics`,
  AI_COMPARISON: `${API_URL}/ai-comparison`,
  AI_METRICS_RESET: `${API_URL}/ai-metrics/reset`,
  ENRICH_PART: `${API_URL}/enrich-part`,
  ENRICH_HOME_PRODUCT: `${API_URL}/enrich-home-product`,
  LOOKUP_FERGUSON: `${API_URL}/lookup-ferguson`,
  SEARCH_FERGUSON: `${API_URL}/search-ferguson`,
  PORTAL_METRICS: `${API_URL}/portal-metrics`,
};

// Helper function for API requests with authentication
export async function apiRequest(endpoint, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': API_KEY,
      ...options.headers,
    },
  };

  const response = await fetch(endpoint, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
}

export default {
  API_URL,
  API_KEY,
  FRONTEND_URL,
  ADMIN_URL,
  API_ENDPOINTS,
  apiRequest,
};
