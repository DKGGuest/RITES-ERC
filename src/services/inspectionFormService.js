/**
 * Service for Inspection Form APIs (Sections A, B, C, D)
 * All endpoints require JWT authentication
 */

const API_BASE_URL = 'http://localhost:8081/sarthi-backend/api/inspection-form';

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

// ==================== Combined Form Data ====================

/**
 * Get all form data (Sections A, B, C) by inspection call number
 */
export const getFormDataByCallNo = async (callNo) => {
  const response = await fetch(`${API_BASE_URL}/${callNo}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return data.data;
};

// ==================== Section A: PO Details ====================

export const getPoDetailsByCallNo = async (callNo) => {
  const response = await fetch(`${API_BASE_URL}/po-details/${callNo}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return data.data;
};

export const savePoDetails = async (poDetails) => {
  const response = await fetch(`${API_BASE_URL}/po-details`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(poDetails)
  });
  const data = await response.json();
  return data.data;
};

export const verifyPoDetails = async (callNo, verifiedBy) => {
  const response = await fetch(`${API_BASE_URL}/po-details/verify/${callNo}?verifiedBy=${verifiedBy}`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return data.data;
};

// ==================== Section B: Inspection Call ====================

export const getCallDetailsByCallNo = async (callNo) => {
  const response = await fetch(`${API_BASE_URL}/call-details/${callNo}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return data.data;
};

export const saveCallDetails = async (callDetails) => {
  const response = await fetch(`${API_BASE_URL}/call-details`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(callDetails)
  });
  const data = await response.json();
  return data.data;
};

export const updateCallDetails = async (callDetails) => {
  const response = await fetch(`${API_BASE_URL}/call-details`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(callDetails)
  });
  const data = await response.json();
  return data.data;
};

export const verifyCallDetails = async (callNo, verifiedBy) => {
  const response = await fetch(`${API_BASE_URL}/call-details/verify/${callNo}?verifiedBy=${verifiedBy}`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return data.data;
};

// ==================== Section C: Sub PO Details ====================

export const getSubPoDetailsByCallNo = async (callNo) => {
  const response = await fetch(`${API_BASE_URL}/sub-po-details/${callNo}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return data.data;
};

export const saveSubPoDetails = async (subPoDetails) => {
  const response = await fetch(`${API_BASE_URL}/sub-po-details`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(subPoDetails)
  });
  const data = await response.json();
  return data.data;
};

export const verifySubPoDetails = async (callNo, verifiedBy) => {
  const response = await fetch(`${API_BASE_URL}/sub-po-details/verify/${callNo}?verifiedBy=${verifiedBy}`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return data.data;
};

// ==================== Section D: Production Lines (Process Inspection) ====================

/**
 * Get all production lines by inspection call number
 */
export const getProductionLinesByCallNo = async (callNo) => {
  const response = await fetch(`${API_BASE_URL}/production-lines/${callNo}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return data.data;
};

/**
 * Save production lines for an inspection call
 */
export const saveProductionLines = async (callNo, lines) => {
  const response = await fetch(`${API_BASE_URL}/production-lines/${callNo}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(lines)
  });
  const data = await response.json();
  return data.data;
};

/**
 * Verify all production lines for an inspection call
 */
export const verifyProductionLines = async (callNo, verifiedBy) => {
  const response = await fetch(`${API_BASE_URL}/production-lines/verify/${callNo}?verifiedBy=${verifiedBy}`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return data.data;
};
