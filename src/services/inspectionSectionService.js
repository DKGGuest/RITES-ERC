/**
 * Service for Inspection Section APIs (Sections A, B, C)
 * All endpoints require JWT authentication
 * Integrates with InspectionSectionController endpoints
 */

const API_ROOT = process.env.REACT_APP_API_URL || 'https://sarthibackendservice-bfe2eag3byfkbsa6.canadacentral-01.azurewebsites.net/sarthi-backend';
const API_BASE_URL = `${API_ROOT}/api/inspection-sections`;
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

/* ==================== SECTION A: Main PO Information ==================== */

/**
 * Save Section A data (Main PO Information)
 */
export const saveSectionA = async (sectionAData) => {
  const response = await fetch(`${API_BASE_URL}/section-a`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(sectionAData)
  });
  const data = await handleResponse(response);
  return data.responseData;
};

/**
 * Get Section A data by call number
 */
export const getSectionAByCallNo = async (callNo) => {
  const response = await fetch(`${API_BASE_URL}/section-a/call/${callNo}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await handleResponse(response);
  return data.responseData;
};

/**
 * Approve Section A
 */
export const approveSectionA = async (callNo) => {
  const response = await fetch(`${API_BASE_URL}/section-a/approve/${callNo}`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  const data = await handleResponse(response);
  return data.responseData;
};

/**
 * Reject Section A
 */
export const rejectSectionA = async (callNo, remarks) => {
  const response = await fetch(`${API_BASE_URL}/section-a/reject/${callNo}?remarks=${encodeURIComponent(remarks)}`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  const data = await handleResponse(response);
  return data.responseData;
};

/* ==================== SECTION B: Inspection Call Details ==================== */

/**
 * Save Section B data (Inspection Call Details)
 */
export const saveSectionB = async (sectionBData) => {
  const response = await fetch(`${API_BASE_URL}/section-b`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(sectionBData)
  });
  const data = await handleResponse(response);
  return data.responseData;
};

/**
 * Get Section B data by call number
 */
export const getSectionBByCallNo = async (callNo) => {
  const response = await fetch(`${API_BASE_URL}/section-b/call/${callNo}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await handleResponse(response);
  return data.responseData;
};

/**
 * Approve Section B
 */
export const approveSectionB = async (callNo) => {
  const response = await fetch(`${API_BASE_URL}/section-b/approve/${callNo}`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  const data = await handleResponse(response);
  return data.responseData;
};

/**
 * Reject Section B
 */
export const rejectSectionB = async (callNo, remarks) => {
  const response = await fetch(`${API_BASE_URL}/section-b/reject/${callNo}?remarks=${encodeURIComponent(remarks)}`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  const data = await handleResponse(response);
  return data.responseData;
};

/* ==================== SECTION C: Sub PO Details ==================== */

/**
 * Save Section C data (Sub PO Details) - batch save
 */
export const saveSectionCBatch = async (sectionCDataList) => {
  const response = await fetch(`${API_BASE_URL}/section-c/batch`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(sectionCDataList)
  });
  const data = await handleResponse(response);
  return data.responseData;
};

/**
 * Get Section C data by call number
 */
export const getSectionCByCallNo = async (callNo) => {
  const response = await fetch(`${API_BASE_URL}/section-c/call/${callNo}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await handleResponse(response);
  return data.responseData;
};

/**
 * Approve all Section C records for a call
 */
export const approveAllSectionC = async (callNo) => {
  const response = await fetch(`${API_BASE_URL}/section-c/approve-all/${callNo}`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  const data = await handleResponse(response);
  return data.responseData;
};

/**
 * Reject all Section C records for a call
 */
export const rejectAllSectionC = async (callNo, remarks) => {
  const response = await fetch(`${API_BASE_URL}/section-c/reject-all/${callNo}?remarks=${encodeURIComponent(remarks)}`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  const data = await handleResponse(response);
  return data.responseData;
};

