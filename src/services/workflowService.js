/**
 * Workflow Service
 * Handles workflow transition API calls
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - Request caching with TTL
 * - Timeout handling for slow Azure API
 * - Progressive loading (data first, vendor names later)
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

// In-memory cache for workflow transitions
const workflowCache = new Map();
const WORKFLOW_CACHE_TTL = 2 * 60 * 1000; // 2 minutes (shorter than PO cache)

/**
 * Clear workflow cache (useful after scheduling or status changes)
 */
export const clearWorkflowCache = () => {
  workflowCache.clear();
  console.log('🗑️ Workflow cache cleared');
};

/**
 * Fetch with timeout to prevent indefinite waiting
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds (default: 30 seconds)
 * @returns {Promise<Response>} Fetch response
 */
const fetchWithTimeout = async (url, options = {}, timeout = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
};

/**
 * Fetch all pending workflow transitions for a given role
 * Uses caching to reduce repeated API calls
 *
 * @param {string} roleName - Role name (e.g., 'IE')
 * @param {boolean} forceRefresh - Force refresh from API (skip cache)
 * @returns {Promise<Array>} List of pending workflow transitions
 */
export const fetchPendingWorkflowTransitions = async (roleName, forceRefresh = false) => {
  const cacheKey = `workflow_${roleName}`;

  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = workflowCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < WORKFLOW_CACHE_TTL) {
      console.log('✅ Using cached workflow transitions');
      return cached.data;
    }
  }

  try {
    console.log('🌐 Fetching workflow transitions from Azure API...');
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/allPendingWorkflowTransition?roleName=${encodeURIComponent(roleName)}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      },
      30000 // 30 second timeout
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.responseStatus?.message || 'Failed to fetch pending transitions');
    }

    // Check for successful status (statusCode === 0 means success)
    if (data.responseStatus?.statusCode !== 0) {
      throw new Error(data.responseStatus?.message || 'Failed to fetch pending transitions');
    }

    const transitions = data.responseData || [];

    // Store in cache
    workflowCache.set(cacheKey, {
      data: transitions,
      timestamp: Date.now()
    });

    return transitions;
  } catch (error) {
    console.error('Error fetching pending workflow transitions:', error);
    throw error;
  }
};

/**
 * Fetch pending workflow transitions filtered by current user
 * Filters results where assignedToUser matches logged-in user's userId
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - Uses caching to prevent duplicate API calls
 * - Batch fetches vendor names in parallel
 * - Timeout handling for Azure API
 *
 * @returns {Promise<Array>} Filtered list of pending workflow transitions
 */
export const fetchUserPendingCalls = async () => {
  const startTime = performance.now();

  try {
    const user = getStoredUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const roleName = user.roleName;
    const userId = parseInt(user.userId, 10);

    console.log('⏱️ Fetching workflow transitions from Azure...');
    const allTransitions = await fetchPendingWorkflowTransitions(roleName);
    const fetchTime = performance.now() - startTime;
    console.log(`✅ Workflow transitions fetched in ${fetchTime.toFixed(0)}ms`);

    // Filter transitions where assignedToUser matches logged-in userId
    const userTransitions = allTransitions.filter(
      (transition) => transition.assignedToUser === userId
    );

    console.log(`📊 Found ${userTransitions.length} transitions for user ${userId}`);

    // Pre-fetch all unique PO vendor names in parallel to leverage caching
    const uniquePoNumbers = [...new Set(
      userTransitions
        .map(t => t.poNo)
        .filter(poNo => poNo && poNo !== '-')
    )];

    console.log(`🔄 Fetching ${uniquePoNumbers.length} vendor names...`);

    // Batch fetch all vendor names (cache will prevent duplicate API calls)
    const vendorNamePromises = uniquePoNumbers.map(poNo =>
      fetchCleanedVendorName(poNo).catch(error => {
        console.error(`Failed to fetch vendor name for PO ${poNo}:`, error);
        return '-';
      })
    );

    // Wait for all vendor names to be fetched
    await Promise.all(vendorNamePromises);

    const vendorFetchTime = performance.now() - startTime;
    console.log(`✅ Vendor names fetched in ${vendorFetchTime.toFixed(0)}ms`);

    // Transform API response - vendor names will be served from cache now
    const transformedCalls = await Promise.all(
      userTransitions.map(async (transition) => {
        // Fetch cleaned vendor name from PO API (will use cache)
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

    const totalTime = performance.now() - startTime;
    console.log(`⚡ Total fetch time: ${totalTime.toFixed(0)}ms`);

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

