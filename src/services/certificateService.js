/**
 * Certificate Service
 * Handles certificate generation API calls
 */
// const API_ROOT = 'http://localhost:8080/sarthi-backend';

const API_ROOT = process.env.REACT_APP_API_URL ||
  'https://sarthibackendservice-bfe2eag3byfkbsa6.canadacentral-01.azurewebsites.net/sarthi-backend';
const API_BASE_URL = `${API_ROOT}/api/certificate`;

/**
 * Get auth headers with JWT token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

/**
 * Generate Raw Material Inspection Certificate by IC Number
 * @param {string} icNumber - Inspection Call Number (e.g., RM-IC-1767772023499 or N/RM-IC-1767618858167/RAJK)
 * @returns {Promise<Object>} Certificate data
 */
export const generateRawMaterialCertificate = async (icNumber) => {
  try {
    console.log('🔍 Generating certificate for IC Number:', icNumber);

    // Use query parameter instead of path variable to handle slashes
    // URL-encode the IC number to handle special characters
    const encodedIcNumber = encodeURIComponent(icNumber);
    console.log('📝 Encoded IC Number:', encodedIcNumber);

    const response = await fetch(`${API_BASE_URL}/raw-material?icNumber=${encodedIcNumber}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to generate certificate: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Certificate generated successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error generating certificate:', error);
    throw error;
  }
};

/**
 * Generate Raw Material Inspection Certificate by Call ID
 * @param {number} callId - Inspection Call ID
 * @returns {Promise<Object>} Certificate data
 */
export const generateRawMaterialCertificateById = async (callId) => {
  try {
    console.log('🔍 Generating certificate for Call ID:', callId);
    
    const response = await fetch(`${API_BASE_URL}/raw-material/by-id/${callId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to generate certificate: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Certificate generated successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error generating certificate:', error);
    throw error;
  }
};

/**
 * Download certificate as PDF (future implementation)
 * @param {string} icNumber - Inspection Call Number (will be URL-encoded automatically by generateRawMaterialCertificate)
 * @returns {Promise<Blob>} PDF blob
 */
export const downloadCertificatePDF = async (icNumber) => {
  try {
    console.log('🔍 Downloading certificate PDF for IC Number:', icNumber);

    // TODO: Implement PDF download endpoint when backend is ready
    // For now, we'll generate the certificate data and let the frontend handle PDF generation
    // Note: icNumber will be URL-encoded by generateRawMaterialCertificate
    const certificateData = await generateRawMaterialCertificate(icNumber);

    return certificateData;
  } catch (error) {
    console.error('❌ Error downloading certificate PDF:', error);
    throw error;
  }
};

/**
 * Health check for certificate service
 * @returns {Promise<string>} Health status
 */
export const checkCertificateServiceHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Certificate service is not available');
    }

    const data = await response.text();
    return data;
  } catch (error) {
    console.error('❌ Certificate service health check failed:', error);
    throw error;
  }
};

