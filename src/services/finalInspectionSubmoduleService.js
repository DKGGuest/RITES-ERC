import { API_BASE_URL } from './apiConfig';
import { getAuthHeaders, handleResponse } from './apiConfig';

/**
 * Get current user ID from localStorage
 * @returns {string} User ID or 'system' as fallback
 */
const getCurrentUserId = () => {
  const userId = localStorage.getItem('userId');
  return userId || 'system';
};

/**
 * Add createdBy field for new records (first save)
 * @param {Object} data - Original data object
 * @returns {Object} Data with createdBy field added
 */
const addCreatedByField = (data) => {
  const userId = getCurrentUserId();
  return {
    ...data,
    createdBy: userId
  };
};

/**
 * Save Calibration & Documents data
 * POST /api/final-inspection/submodules/calibration-documents
 */
export const saveCalibrationDocuments = async (data) => {
  try {
    const url = `${API_BASE_URL}/api/final-inspection/submodules/calibration-documents`;
    const payload = addCreatedByField(data);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
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
    const payload = addCreatedByField(data);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
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
    const payload = addCreatedByField(data);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
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
    const payload = addCreatedByField(data);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
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
    const payload = addCreatedByField(data);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error saving inclusion rating data:', error);
    throw error;
  }
};

/**
 * Save Inclusion Rating data for multiple samples (batch)
 * POST /api/final-inspection/submodules/inclusion-rating/batch
 */
export const saveInclusionRatingBatch = async (data) => {
  try {
    const url = `${API_BASE_URL}/api/final-inspection/submodules/inclusion-rating/batch`;
    const payload = addCreatedByField(data);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error saving inclusion rating batch data:', error);
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
    const payload = addCreatedByField(data);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
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
    const payload = addCreatedByField(data);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
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
    const payload = addCreatedByField(data);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error saving toe load test data:', error);
    throw error;
  }
};

/**
 * Finish Inspection - Save all submodule data to backend
 * Collects all inspection data from localStorage and saves to database
 */
export const finishInspection = async (callNo) => {
  try {
    console.log(`🔄 Starting finish inspection process for call: ${callNo}`);

    const results = {
      success: [],
      failed: [],
      skipped: []
    };

    // Helper function to get and save data for a submodule
    const saveSubmoduleData = async (storageKey, apiFunction, moduleName) => {
      try {
        const storedData = localStorage.getItem(storageKey);
        if (!storedData) {
          console.log(`⏭️  Skipping ${moduleName} - no data found`);
          results.skipped.push(moduleName);
          return;
        }

        const data = JSON.parse(storedData);
        console.log(`📤 Saving ${moduleName} data:`, data);

        // Save each lot's data
        for (const [lotNo, lotData] of Object.entries(data)) {
          const payload = {
            inspectionCallNo: callNo,
            lotNo: lotNo,
            ...lotData
          };

          await apiFunction(payload);
          console.log(`✅ ${moduleName} saved for lot ${lotNo}`);
        }

        results.success.push(moduleName);
      } catch (error) {
        console.error(`❌ Error saving ${moduleName}:`, error);
        results.failed.push({ module: moduleName, error: error.message });
      }
    };

    // Save all submodule data
    await saveSubmoduleData(`visualDimensionalData_${callNo}`, saveVisualDimensional, 'Visual & Dimensional');
    await saveSubmoduleData(`hardnessTestData_${callNo}`, saveHardnessTest, 'Hardness Test');
    await saveSubmoduleData(`inclusionRatingData_${callNo}`, saveInclusionRatingBatch, 'Inclusion Rating');
    await saveSubmoduleData(`deflectionTestData_${callNo}`, saveApplicationDeflection, 'Application Deflection');
    await saveSubmoduleData(`toeLoadTestData_${callNo}`, saveToeLoadTest, 'Toe Load Test');
    await saveSubmoduleData(`weightTestData_${callNo}`, saveWeightTest, 'Weight Test');
    await saveSubmoduleData(`chemicalAnalysisData_${callNo}`, saveChemicalAnalysis, 'Chemical Analysis');
    await saveSubmoduleData(`calibrationDocumentsData_${callNo}`, saveCalibrationDocuments, 'Calibration & Documents');

    console.log('📊 Finish Inspection Results:', results);
    return results;
  } catch (error) {
    console.error('Error during finish inspection:', error);
    throw error;
  }
};

/**
 * Get Ladle Values by Call Number
 * Fetches chemical composition values from vendor's ladle analysis
 * GET /api/final-inspection/submodules/ladle-values/{callNo}
 */
export const getLadleValuesByCall = async (callNo) => {
  try {
    const url = `${API_BASE_URL}/api/final-inspection/submodules/ladle-values/${callNo}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error retrieving ladle values:', error);
    throw error;
  }
};
