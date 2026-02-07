/**
 * Centralized API Configuration
 * 
 * This file manages API URLs based on environment:
 * - Local Development: Uses localhost:8080 (from .env.local)
 * - Production (Vercel): Uses Azure backend (from .env.production)
 * 
 * Usage in services:
 * import { API_BASE_URL } from './apiConfig';
 * const response = await fetch(`${API_BASE_URL}/api/your-endpoint`);
 */

// Get API URL from environment variable or fallback to Azure production URL
// TEMPORARY: Force Azure URL for testing (comment out to use .env.local)
// export const API_BASE_URL = 'https://sarthibackendservice-bfe2eag3byfkbsa6.canadacentral-01.azurewebsites.net/sarthi-backend';
export const API_BASE_URL = 'http://localhost:8080/sarthi-backend' || 'https://sarthibackendservice-bfe2eag3byfkbsa6.canadacentral-01.azurewebsites.net/sarthi-backend';
// export const API_BASE_URL = process.env.REACT_APP_API_URL ||
//    'https://sarthibackendservice-bfe2eag3byfkbsa6.canadacentral-01.azurewebsites.net/sarthi-backend';

// Log current environment for debugging
console.log('🌐 API Configuration:', {
    environment: process.env.NODE_ENV,
    apiUrl: API_BASE_URL,
    isLocal: API_BASE_URL.includes('localhost')
});

/**
 * Common API endpoints
 */
export const API_ENDPOINTS = {
    // Authentication
    AUTH: `${API_BASE_URL}/api/auth`,

    // Inspection Requests
    INSPECTION_REQUESTS: `${API_BASE_URL}/api/inspection-requests`,

    // Raw Material
    RAW_MATERIAL: `${API_BASE_URL}/api/raw-material`,
    RM_INSPECTION: `${API_BASE_URL}/api/rm-inspection`,
    // Final Material
    FINAL_MATERIAL: `${API_BASE_URL}/api/final-material`,

    // Process Material
    PROCESS_MATERIAL: `${API_BASE_URL}/api/process-material`,
    PROCESS_INSPECTION: `${API_BASE_URL}/api/process-inspection`,

    // Inspection Sections
    INSPECTION_SECTIONS: `${API_BASE_URL}/api/inspection-sections`,

    // Workflow
    WORKFLOW: `${API_BASE_URL}/api/workflow`,

    // Billing
    BILLING: `${API_BASE_URL}/api/billing`,

    // Certificates
    CERTIFICATES: `${API_BASE_URL}/api/certificate`,

    // Schedule
    SCHEDULE: `${API_BASE_URL}/api/inspection-schedule`,

    // PO Data
    PO_DATA: `${API_BASE_URL}/api/po-data`,

    // Vendor
    VENDOR: `${API_BASE_URL}/api/vendor`,
};

/**
 * Get authorization headers with token
 */
export const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

/**
 * Handle API response errors
 */
export const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.errorMessage || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
    }
    return response.json();
};

