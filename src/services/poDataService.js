/**
 * Service for PO Data APIs
 * Fetches PO data from database tables (po_header, po_item, po_ma_header, po_ma_detail)
 * for populating Inspection Initiation Sections A, B, C
 *
 * All endpoints require JWT authentication
 */

// // Local API URL for PO Data (fetching from local database)
// const API_ROOT = 'http://localhost:8080/sarthi-backend';
// const API_BASE_URL = `${API_ROOT}/api/po-data`;

// Azure API URL (commented out - uncomment for production)
const API_ROOT = process.env.REACT_APP_API_URL || 'https://sarthibackendservice-bfe2eag3byfkbsa6.canadacentral-01.azurewebsites.net/sarthi-backend';
const API_BASE_URL = `${API_ROOT}/api/po-data`;

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
 * Handle API response and surface errors
 */
const handleResponse = async (response) => {
  let body = null;
  try {
    body = await response.json();
  } catch (e) {
    const text = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status} ${response.statusText} - ${text}`);
  }
  if (!response.ok) {
    const serverMsg = body && (body.message || body.error || JSON.stringify(body));
    throw new Error(`HTTP ${response.status} ${response.statusText} - ${serverMsg}`);
  }
  return body;
};

/**
 * Fetch PO data for all sections (A, B, C) by PO Number
 * 
 * @param {string} poNo - PO Number (e.g., "AA195118100297")
 * @returns {Promise<Object>} PO data object with all section fields
 * 
 * Response structure:
 * {
 *   rlyPoNo: "AA195118100297",
 *   rlyCd: "08",
 *   poNo: "AA195118100297",
 *   poDate: "23/11/2019",
 *   poQty: 5,
 *   inspPlace: "Factory",
 *   vendorName: "ABC Industries",
 *   vendorCode: ":13104",
 *   maNo: "N/A",
 *   maDate: "N/A",
 *   purchasingAuthority: "YOGESH KUMAR SINGH~AMM(WS)/KGP~19~#",
 *   billPayingOfficer: "BPO-001",
 *   poCondSrNo: "N/A",
 *   condTitle: "N/A",
 *   condText: "N/A",
 *   itemDesc: "PNEUMATIC DRILL...",
 *   consignee: "SS/W-M/C/KGP",
 *   unit: "Nos.",
 *   deliveryDate: "11/02/2020",
 *   ...
 * }
 */
export const fetchPoDataForSections = async (poNo) => {
  if (!poNo) {
    throw new Error('PO Number is required');
  }

  const response = await fetch(`${API_BASE_URL}/sections?poNo=${encodeURIComponent(poNo)}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  return await handleResponse(response);
};

/**
 * Fetch Section A data only
 * 
 * @param {string} poNo - PO Number
 * @returns {Promise<Object>} Section A data
 */
export const fetchSectionAData = async (poNo) => {
  if (!poNo) {
    throw new Error('PO Number is required');
  }

  const response = await fetch(`${API_BASE_URL}/section-a?poNo=${encodeURIComponent(poNo)}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  return await handleResponse(response);
};

/**
 * Fetch Section B data only
 * 
 * @param {string} poNo - PO Number
 * @returns {Promise<Object>} Section B data
 */
export const fetchSectionBData = async (poNo) => {
  if (!poNo) {
    throw new Error('PO Number is required');
  }

  const response = await fetch(`${API_BASE_URL}/section-b?poNo=${encodeURIComponent(poNo)}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  return await handleResponse(response);
};

/**
 * Fetch Section C data only
 * 
 * @param {string} poNo - PO Number
 * @returns {Promise<Object>} Section C data
 */
export const fetchSectionCData = async (poNo) => {
  if (!poNo) {
    throw new Error('PO Number is required');
  }

  const response = await fetch(`${API_BASE_URL}/section-c?poNo=${encodeURIComponent(poNo)}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  return await handleResponse(response);
};

/**
 * Update color code for a specific heat number
 *
 * @param {number} heatId - Heat ID from rm_heat_quantities table
 * @param {string} colorCode - Color code to update
 * @returns {Promise<string>} Success message
 *
 * Example:
 * await updateColorCode(1, "RED-001");
 */
export const updateColorCode = async (heatId, colorCode) => {
  if (!heatId) {
    throw new Error('Heat ID is required');
  }
  if (!colorCode || !colorCode.trim()) {
    throw new Error('Color code is required');
  }

  const response = await fetch(`${API_BASE_URL}/heat/${heatId}/color-code`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ colorCode })
  });

  return await handleResponse(response);
};

/**
 * Clean vendor name by removing suffixes like PVT. LTD., location names, etc.
 * Example: "SHIVAM HIGHRISE PVT. LTD.-KOLKATA" -> "SHIVAM HIGHRISE"
 *
 * @param {string} vendorName - Full vendor name from API
 * @returns {string} Cleaned vendor name
 */
export const cleanVendorName = (vendorName) => {
  if (!vendorName || vendorName === '-') return vendorName;

  // Remove common suffixes and location indicators
  let cleaned = vendorName
    .replace(/\s*PVT\.?\s*LTD\.?/gi, '')           // Remove PVT. LTD.
    .replace(/\s*PRIVATE\s*LIMITED/gi, '')         // Remove PRIVATE LIMITED
    .replace(/\s*LTD\.?/gi, '')                    // Remove LTD.
    .replace(/\s*LIMITED/gi, '')                   // Remove LIMITED
    .replace(/\s*CORPORATION/gi, '')               // Remove CORPORATION
    .replace(/\s*CORP\.?/gi, '')                   // Remove CORP.
    .replace(/\s*INC\.?/gi, '')                    // Remove INC.
    .replace(/\s*CO\.?/gi, '')                     // Remove CO.
    .replace(/\s*COMPANY/gi, '')                   // Remove COMPANY
    .replace(/-[A-Z\s]+$/i, '')                    // Remove location suffix after dash (e.g., -KOLKATA)
    .replace(/,\s*[A-Z\s]+$/i, '')                 // Remove location suffix after comma
    .trim();

  return cleaned || vendorName; // Return original if cleaning results in empty string
};

/**
 * Fetch vendor name from PO data and return cleaned version
 *
 * @param {string} poNo - PO Number
 * @returns {Promise<string>} Cleaned vendor name
 */
export const fetchCleanedVendorName = async (poNo) => {
  try {
    if (!poNo || poNo === '-') return '-';

    const poData = await fetchPoDataForSections(poNo);
    const vendorName = poData?.vendorName || '-';

    return cleanVendorName(vendorName);
  } catch (error) {
    console.error(`Error fetching vendor name for PO ${poNo}:`, error);
    return '-';
  }
};

