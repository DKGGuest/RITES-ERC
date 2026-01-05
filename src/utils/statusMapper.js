/**
 * Status Mapper Utility
 * Maps API status values to display labels and determines available actions
 * 
 * This is a PRESENTATION LAYER utility - it does NOT modify the actual status
 * from the API response. It only maps status for display purposes.
 */

/**
 * API Status Constants (from workflow API)
 */
export const API_STATUS = {
  CALL_REGISTERED: 'CALL_REGISTERED',
  SCHEDULED: 'SCHEDULED',
  VERIFY_PO_DETAILS: 'VERIFY_PO_DETAILS',
  // Add more statuses as needed
};

/**
 * Display Status Labels
 */
export const DISPLAY_STATUS = {
  PENDING: 'Pending',
  SCHEDULED: 'Scheduled',
  UNDER_INSPECTION: 'Under Inspection',
  // Add more display labels as needed
};

/**
 * Map API status to display label
 * @param {string} apiStatus - Status from API response
 * @returns {string} Display label for UI
 */
export const getDisplayStatus = (apiStatus) => {
  const statusMap = {
    [API_STATUS.CALL_REGISTERED]: DISPLAY_STATUS.PENDING,
    [API_STATUS.SCHEDULED]: DISPLAY_STATUS.SCHEDULED,
    [API_STATUS.VERIFY_PO_DETAILS]: DISPLAY_STATUS.UNDER_INSPECTION,
  };

  const displayStatus = statusMap[apiStatus] || apiStatus;

  return displayStatus; // Fallback to original status if not mapped
};

/**
 * Get available actions for a given API status
 * @param {string} apiStatus - Status from API response
 * @returns {Array<string>} List of available actions
 */
export const getAvailableActions = (apiStatus) => {
  const actionMap = {
    [API_STATUS.CALL_REGISTERED]: ['schedule'],
    [API_STATUS.SCHEDULED]: ['start', 'reschedule'],
    [API_STATUS.VERIFY_PO_DETAILS]: ['resume', 'reschedule'],
  };

  return actionMap[apiStatus] || [];
};

/**
 * Check if schedule date should be displayed for this status
 * @param {string} apiStatus - Status from API response
 * @returns {boolean} True if schedule date should be shown
 */
export const shouldShowScheduleDate = (apiStatus) => {
  // Show schedule date for SCHEDULED and VERIFY_PO_DETAILS (Under Inspection)
  // because the call was scheduled before inspection started
  return apiStatus === API_STATUS.SCHEDULED || apiStatus === API_STATUS.VERIFY_PO_DETAILS;
};

/**
 * Get status badge color/variant for UI
 * @param {string} apiStatus - Status from API response
 * @returns {string} Color variant for badge/chip
 */
export const getStatusVariant = (apiStatus) => {
  const variantMap = {
    [API_STATUS.CALL_REGISTERED]: 'warning', // Yellow/Orange for pending
    [API_STATUS.SCHEDULED]: 'info',          // Blue for scheduled
    [API_STATUS.VERIFY_PO_DETAILS]: 'success', // Green for under inspection
  };

  return variantMap[apiStatus] || 'default';
};

