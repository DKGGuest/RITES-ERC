/**
 * Service for Inspection Schedule API calls
 */

const API_BASE_URL = 'http://localhost:8081/sarthi-backend/api/inspection-schedule';

/**
 * Schedule an inspection call
 * @param {Object} scheduleData - { callNo, scheduleDate, reason, createdBy }
 */
export const scheduleInspection = async (scheduleData) => {
    const response = await fetch(`${API_BASE_URL}/schedule`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.responseStatus?.message || 'Failed to schedule inspection');
    }

    const data = await response.json();
    return data.responseData;
};

/**
 * Reschedule an existing inspection call
 * @param {Object} scheduleData - { callNo, scheduleDate, reason, updatedBy }
 */
export const rescheduleInspection = async (scheduleData) => {
    const response = await fetch(`${API_BASE_URL}/reschedule`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.responseStatus?.message || 'Failed to reschedule inspection');
    }

    const data = await response.json();
    return data.responseData;
};

/**
 * Get schedule status for a call
 * @param {string} callNo - Call number
 */
export const getScheduleByCallNo = async (callNo) => {
    const response = await fetch(`${API_BASE_URL}/${callNo}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    return data.responseData;
};

/**
 * Check if a call is scheduled
 * @param {string} callNo - Call number
 */
export const isCallScheduled = async (callNo) => {
    const response = await fetch(`${API_BASE_URL}/check/${callNo}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        return false;
    }

    const data = await response.json();
    return data.responseData === true;
};

/**
 * Get all schedules
 */
export const getAllSchedules = async () => {
    const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch schedules');
    }

    const data = await response.json();
    return data.responseData || [];
};

