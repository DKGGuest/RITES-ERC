/**
 * Workflow Service
 * Handles workflow transition API calls
 */

import { getAuthToken, getStoredUser } from './authService';
import { fetchCleanedVendorName } from './poDataService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 
  'https://sarthibackendservice-bfe2eag3byfkbsa6.canadacentral-01.azurewebsites.net/sarthi-backend';

/**
 * Get auth headers with JWT token
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

/**
 * Fetch all pending workflow transitions for a given role
 * @param {string} roleName - Role name (e.g., 'IE')
 * @returns {Promise<Array>} List of pending workflow transitions
 */
export const fetchPendingWorkflowTransitions = async (roleName) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/allPendingWorkflowTransition?roleName=${encodeURIComponent(roleName)}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.responseStatus?.message || 'Failed to fetch pending transitions');
    }

    // Check for successful status (statusCode === 0 means success)
    if (data.responseStatus?.statusCode !== 0) {
      throw new Error(data.responseStatus?.message || 'Failed to fetch pending transitions');
    }

    return data.responseData || [];
  } catch (error) {
    console.error('Error fetching pending workflow transitions:', error);
    throw error;
  }
};

/**
 * Fetch pending workflow transitions filtered by current user
 * Filters results where assignedToUser matches logged-in user's userId
 * @returns {Promise<Array>} Filtered list of pending workflow transitions
 */
export const fetchUserPendingCalls = async () => {
  try {
    const user = getStoredUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const roleName = user.roleName;
    const userId = parseInt(user.userId, 10);

    const allTransitions = await fetchPendingWorkflowTransitions(roleName);

    // Filter transitions where assignedToUser matches logged-in userId
    const userTransitions = allTransitions.filter(
      (transition) => transition.assignedToUser === userId
    );

    // Transform API response and fetch cleaned vendor names
    const transformedCalls = await Promise.all(
      userTransitions.map(async (transition) => {
        // Fetch cleaned vendor name from PO API
        let cleanedVendorName = transition.vendorName || '-';
        if (transition.poNo && transition.poNo !== '-') {
          try {
            cleanedVendorName = await fetchCleanedVendorName(transition.poNo);
          } catch (error) {
            console.error(`Failed to fetch vendor name for PO ${transition.poNo}:`, error);
            // Fallback to original vendor name if API call fails
            cleanedVendorName = transition.vendorName || '-';
          }
        }

        return {
          id: transition.workflowTransitionId,
          call_no: transition.requestId,
          workflowId: transition.workflowId,
          transitionId: transition.transitionId,
          status: transition.status, // Use actual workflow status from API
          action: transition.action,
          remarks: transition.remarks,
          currentRole: transition.currentRole,
          nextRole: transition.nextRole,
          createdBy: transition.createdBy,
          createdDate: transition.createdDate,
          workflowSequence: transition.workflowSequence,
          assignedToUser: transition.assignedToUser,
          // Map API fields to table fields
          po_no: transition.poNo || '-',
          vendor_name: cleanedVendorName,
          product_type: transition.productType || '-',
          call_date: transition.createdDate ? transition.createdDate.split('T')[0] : null,
          desired_inspection_date: transition.desiredInspectionDate || null,
        };
      })
    );

    return transformedCalls;
  } catch (error) {
    console.error('Error fetching user pending calls:', error);
    throw error;
  }
};

/**
 * Perform workflow transition action (e.g., INITIATE_INSPECTION)
 * Azure API: POST /performTransitionAction
 * @param {Object} actionData - { workflowTransitionId, requestId, action, remarks, actionBy, pincode }
 * @returns {Promise<Object>} Workflow transition result
 */
export const performTransitionAction = async (actionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/performTransitionAction`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(actionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.responseStatus?.message || 'Failed to perform transition action');
    }

    const data = await response.json();
    return data.responseData;
  } catch (error) {
    console.error('Error performing transition action:', error);
    throw error;
  }
};

// Local API (commented out)
// export const performTransitionActionLocal = async (actionData) => {
//   try {
//     const response = await fetch('http://localhost:8081/sarthi-backend/performTransitionAction', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(actionData),
//     });
//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.responseStatus?.message || 'Failed to perform transition action');
//     }
//     const data = await response.json();
//     return data.responseData;
//   } catch (error) {
//     console.error('Error performing transition action:', error);
//     throw error;
//   }
// };

