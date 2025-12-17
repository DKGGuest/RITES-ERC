/**
 * Service for Inspection Form APIs (Sections A, B, C, D)
 * All endpoints require JWT authentication
 * TODO: Uncomment API calls for production with backend
 */

// TODO: Uncomment for production with backend
// const API_BASE_URL = 'http://localhost:8081/sarthi-backend/api/inspection-form';

// Mock storage for form data (persists in memory during session)
const mockFormData = {
  poDetails: {},
  callDetails: {},
  subPoDetails: {},
  productionLines: {}
};

/**
 * Get auth headers with JWT token
 */
// TODO: Uncomment for production with backend
/*
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};
*/

// ==================== Combined Form Data ====================

/**
 * Get all form data (Sections A, B, C) by inspection call number
 */
export const getFormDataByCallNo = async (callNo) => {
  // TODO: Uncomment for production with backend
  /*
  const response = await fetch(`${API_BASE_URL}/${callNo}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return data.data;
  */

  // Mock implementation for Vercel deployment
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        poDetails: mockFormData.poDetails[callNo] || null,
        callDetails: mockFormData.callDetails[callNo] || null,
        subPoDetails: mockFormData.subPoDetails[callNo] || null
      });
    }, 200);
  });
};

// ==================== Section A: PO Details ====================

export const getPoDetailsByCallNo = async (callNo) => {
  // TODO: Uncomment for production with backend
  /*
  const response = await fetch(`${API_BASE_URL}/po-details/${callNo}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return data.data;
  */

  // Mock implementation for Vercel deployment
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockFormData.poDetails[callNo] || null);
    }, 200);
  });
};

export const savePoDetails = async (poDetails) => {
  // TODO: Uncomment for production with backend
  /*
  const response = await fetch(`${API_BASE_URL}/po-details`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(poDetails)
  });
  const data = await response.json();
  return data.data;
  */

  // Mock implementation for Vercel deployment
  return new Promise((resolve) => {
    setTimeout(() => {
      mockFormData.poDetails[poDetails.inspectionCallNo] = {
        ...poDetails,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      resolve(mockFormData.poDetails[poDetails.inspectionCallNo]);
    }, 300);
  });
};

export const verifyPoDetails = async (callNo, verifiedBy) => {
  // TODO: Uncomment for production with backend
  /*
  const response = await fetch(`${API_BASE_URL}/po-details/verify/${callNo}?verifiedBy=${verifiedBy}`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return data.data;
  */

  // Mock implementation for Vercel deployment
  return new Promise((resolve) => {
    setTimeout(() => {
      if (mockFormData.poDetails[callNo]) {
        mockFormData.poDetails[callNo].isVerified = true;
        mockFormData.poDetails[callNo].verifiedBy = verifiedBy;
        mockFormData.poDetails[callNo].verifiedAt = new Date().toISOString();
      }
      resolve(mockFormData.poDetails[callNo]);
    }, 200);
  });
};

// ==================== Section B: Inspection Call ====================

export const getCallDetailsByCallNo = async (callNo) => {
  // TODO: Uncomment for production with backend
  /*
  const response = await fetch(`${API_BASE_URL}/call-details/${callNo}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return data.data;
  */

  // Mock implementation for Vercel deployment
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockFormData.callDetails[callNo] || null);
    }, 200);
  });
};

export const saveCallDetails = async (callDetails) => {
  // TODO: Uncomment for production with backend
  /*
  const response = await fetch(`${API_BASE_URL}/call-details`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(callDetails)
  });
  const data = await response.json();
  return data.data;
  */

  // Mock implementation for Vercel deployment
  return new Promise((resolve) => {
    setTimeout(() => {
      mockFormData.callDetails[callDetails.inspectionCallNo] = {
        ...callDetails,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      resolve(mockFormData.callDetails[callDetails.inspectionCallNo]);
    }, 300);
  });
};

export const updateCallDetails = async (callDetails) => {
  // TODO: Uncomment for production with backend
  /*
  const response = await fetch(`${API_BASE_URL}/call-details`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(callDetails)
  });
  const data = await response.json();
  return data.data;
  */

  // Mock implementation for Vercel deployment
  return new Promise((resolve) => {
    setTimeout(() => {
      mockFormData.callDetails[callDetails.inspectionCallNo] = {
        ...mockFormData.callDetails[callDetails.inspectionCallNo],
        ...callDetails,
        updatedAt: new Date().toISOString()
      };
      resolve(mockFormData.callDetails[callDetails.inspectionCallNo]);
    }, 300);
  });
};

export const verifyCallDetails = async (callNo, verifiedBy) => {
  // TODO: Uncomment for production with backend
  /*
  const response = await fetch(`${API_BASE_URL}/call-details/verify/${callNo}?verifiedBy=${verifiedBy}`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return data.data;
  */

  // Mock implementation for Vercel deployment
  return new Promise((resolve) => {
    setTimeout(() => {
      if (mockFormData.callDetails[callNo]) {
        mockFormData.callDetails[callNo].isVerified = true;
        mockFormData.callDetails[callNo].verifiedBy = verifiedBy;
        mockFormData.callDetails[callNo].verifiedAt = new Date().toISOString();
      }
      resolve(mockFormData.callDetails[callNo]);
    }, 200);  
  });
};

// ==================== Section C: Sub PO Details ====================

export const getSubPoDetailsByCallNo = async (callNo) => {
  // TODO: Uncomment for production with backend
  /*
  const response = await fetch(`${API_BASE_URL}/sub-po-details/${callNo}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return data.data;
  */

  // Mock implementation for Vercel deployment
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockFormData.subPoDetails[callNo] || null);
    }, 200);
  });
};

export const saveSubPoDetails = async (subPoDetails) => {
  // TODO: Uncomment for production with backend
  /*
  const response = await fetch(`${API_BASE_URL}/sub-po-details`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(subPoDetails)
  });
  const data = await response.json();
  return data.data;
  */

  // Mock implementation for Vercel deployment
  return new Promise((resolve) => {
    setTimeout(() => {
      mockFormData.subPoDetails[subPoDetails.inspectionCallNo] = {
        ...subPoDetails,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      resolve(mockFormData.subPoDetails[subPoDetails.inspectionCallNo]);
    }, 300);
  });
};

export const verifySubPoDetails = async (callNo, verifiedBy) => {
  // TODO: Uncomment for production with backend
  /*
  const response = await fetch(`${API_BASE_URL}/sub-po-details/verify/${callNo}?verifiedBy=${verifiedBy}`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return data.data;
  */

  // Mock implementation for Vercel deployment
  return new Promise((resolve) => {
    setTimeout(() => {
      if (mockFormData.subPoDetails[callNo]) {
        mockFormData.subPoDetails[callNo].isVerified = true;
        mockFormData.subPoDetails[callNo].verifiedBy = verifiedBy;
        mockFormData.subPoDetails[callNo].verifiedAt = new Date().toISOString();
      }
      resolve(mockFormData.subPoDetails[callNo]);
    }, 200);
  });
};

// ==================== Section D: Production Lines (Process Inspection) ====================

/**
 * Get all production lines by inspection call number
 */
export const getProductionLinesByCallNo = async (callNo) => {
  // TODO: Uncomment for production with backend
  /*
  const response = await fetch(`${API_BASE_URL}/production-lines/${callNo}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return data.data;
  */

  // Mock implementation for Vercel deployment
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockFormData.productionLines[callNo] || []);
    }, 200);
  });
};

/**
 * Save production lines for an inspection call
 */
export const saveProductionLines = async (callNo, lines) => {
  // TODO: Uncomment for production with backend
  /*
  const response = await fetch(`${API_BASE_URL}/production-lines/${callNo}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(lines)
  });
  const data = await response.json();
  return data.data;
  */

  // Mock implementation for Vercel deployment
  return new Promise((resolve) => {
    setTimeout(() => {
      mockFormData.productionLines[callNo] = lines.map((line, index) => ({
        ...line,
        id: Date.now() + index,
        createdAt: new Date().toISOString()
      }));
      resolve(mockFormData.productionLines[callNo]);
    }, 300);
  });
};

/**
 * Verify all production lines for an inspection call
 */
export const verifyProductionLines = async (callNo, verifiedBy) => {
  // TODO: Uncomment for production with backend
  /*
  const response = await fetch(`${API_BASE_URL}/production-lines/verify/${callNo}?verifiedBy=${verifiedBy}`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return data.data;
  */

  // Mock implementation for Vercel deployment
  return new Promise((resolve) => {
    setTimeout(() => {
      if (mockFormData.productionLines[callNo]) {
        mockFormData.productionLines[callNo] = mockFormData.productionLines[callNo].map(line => ({
          ...line,
          isVerified: true,
          verifiedBy: verifiedBy,
          verifiedAt: new Date().toISOString()
        }));
      }
      resolve(mockFormData.productionLines[callNo] || []);
    }, 200);
  });
};
