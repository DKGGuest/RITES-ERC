import { API_BASE_URL } from './apiConfig';
import { getAuthHeaders, handleResponse } from './apiConfig';

/**
 * Save Calibration & Documents data
 * POST /api/final-inspection/submodules/calibration-documents
 */
export const saveCalibrationDocuments = async (data) => {
  try {
    const url = `${API_BASE_URL}/api/final-inspection/submodules/calibration-documents`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error saving calibration documents:', error);
    throw error;
  }
};

/**
 * Save Visual & Dimensional data
 * POST /api/final-inspection/submodules/visual-dimensional
 */
export const saveVisualDimensional = async (data) => {
  try {
    const url = `${API_BASE_URL}/api/final-inspection/submodules/visual-dimensional`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error saving visual dimensional data:', error);
    throw error;
  }
};

/**
 * Save Chemical Analysis data
 * POST /api/final-inspection/submodules/chemical-analysis
 */
export const saveChemicalAnalysis = async (data) => {
  try {
    const url = `${API_BASE_URL}/api/final-inspection/submodules/chemical-analysis`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error saving chemical analysis data:', error);
    throw error;
  }
};

/**
 * Save Hardness Test data
 * POST /api/final-inspection/submodules/hardness-test
 */
export const saveHardnessTest = async (data) => {
  try {
    const url = `${API_BASE_URL}/api/final-inspection/submodules/hardness-test`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error saving hardness test data:', error);
    throw error;
  }
};

/**
 * Save Inclusion Rating data
 * POST /api/final-inspection/submodules/inclusion-rating
 */
export const saveInclusionRating = async (data) => {
  try {
    const url = `${API_BASE_URL}/api/final-inspection/submodules/inclusion-rating`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error saving inclusion rating data:', error);
    throw error;
  }
};

/**
 * Save Application Deflection data
 * POST /api/final-inspection/submodules/application-deflection
 */
export const saveApplicationDeflection = async (data) => {
  try {
    const url = `${API_BASE_URL}/api/final-inspection/submodules/application-deflection`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error saving application deflection data:', error);
    throw error;
  }
};

/**
 * Save Weight Test data
 * POST /api/final-inspection/submodules/weight-test
 */
export const saveWeightTest = async (data) => {
  try {
    const url = `${API_BASE_URL}/api/final-inspection/submodules/weight-test`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error saving weight test data:', error);
    throw error;
  }
};

/**
 * Save Toe Load Test data
 * POST /api/final-inspection/submodules/toe-load-test
 */
export const saveToeLoadTest = async (data) => {
  try {
    const url = `${API_BASE_URL}/api/final-inspection/submodules/toe-load-test`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error saving toe load test data:', error);
    throw error;
  }
};

