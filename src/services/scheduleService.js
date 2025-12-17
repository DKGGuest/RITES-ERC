/**
 * Service for Inspection Schedule API calls
 * TODO: Uncomment API calls for production with backend
 */

// TODO: Uncomment for production with backend
// const API_BASE_URL = 'http://localhost:8081/sarthi-backend/api/inspection-schedule';

// Mock storage for schedules (persists in memory during session)
const mockSchedules = {};

/**
 * Schedule an inspection call
 * @param {Object} scheduleData - { callNo, scheduleDate, reason, createdBy }
 */
export const scheduleInspection = async (scheduleData) => {
    // TODO: Uncomment for production with backend
    /*
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
    */

    // Mock implementation for Vercel deployment
    return new Promise((resolve) => {
        setTimeout(() => {
            mockSchedules[scheduleData.callNo] = {
                ...scheduleData,
                id: Date.now(),
                status: 'Scheduled',
                createdAt: new Date().toISOString()
            };
            resolve(mockSchedules[scheduleData.callNo]);
        }, 300);
    });
};

/**
 * Reschedule an existing inspection call
 * @param {Object} scheduleData - { callNo, scheduleDate, reason, updatedBy }
 */
export const rescheduleInspection = async (scheduleData) => {
    // TODO: Uncomment for production with backend
    /*
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
    */

    // Mock implementation for Vercel deployment
    return new Promise((resolve) => {
        setTimeout(() => {
            mockSchedules[scheduleData.callNo] = {
                ...mockSchedules[scheduleData.callNo],
                ...scheduleData,
                status: 'Rescheduled',
                updatedAt: new Date().toISOString()
            };
            resolve(mockSchedules[scheduleData.callNo]);
        }, 300);
    });
};

/**
 * Get schedule status for a call
 * @param {string} callNo - Call number
 */
export const getScheduleByCallNo = async (callNo) => {
    // TODO: Uncomment for production with backend
    /*
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
    */

    // Mock implementation for Vercel deployment
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockSchedules[callNo] || null);
        }, 200);
    });
};

/**
 * Check if a call is scheduled
 * @param {string} callNo - Call number
 */
export const isCallScheduled = async (callNo) => {
    // TODO: Uncomment for production with backend
    /*
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
    */

    // Mock implementation for Vercel deployment
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(!!mockSchedules[callNo]);
        }, 200);
    });
};

/**
 * Get all schedules
 */
export const getAllSchedules = async () => {
    // TODO: Uncomment for production with backend
    /*
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
    */

    // Mock implementation for Vercel deployment
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(Object.values(mockSchedules));
        }, 200);
    });
};

/**
 * Maximum calls allowed to be scheduled per day
 */
export const MAX_CALLS_PER_DAY = 5;

/**
 * Count how many calls are scheduled for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<number>} - Count of calls scheduled for the date
 */
export const getScheduleCountByDate = async (date) => {
    // TODO: Uncomment for production with backend
    /*
    const response = await fetch(`${API_BASE_URL}/count-by-date?date=${date}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        return 0;
    }

    const data = await response.json();
    return data.responseData || 0;
    */

    // Mock implementation for Vercel deployment
    return new Promise((resolve) => {
        setTimeout(() => {
            const count = Object.values(mockSchedules).filter(
                schedule => schedule.scheduleDate === date
            ).length;
            resolve(count);
        }, 100);
    });
};

/**
 * Validate if more calls can be scheduled for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} additionalCalls - Number of additional calls to schedule (default 1)
 * @returns {Promise<{canSchedule: boolean, currentCount: number, remaining: number, maxLimit: number}>}
 */
export const validateScheduleLimit = async (date, additionalCalls = 1) => {
    const currentCount = await getScheduleCountByDate(date);
    const remaining = MAX_CALLS_PER_DAY - currentCount;
    const canSchedule = remaining >= additionalCalls;

    return {
        canSchedule,
        currentCount,
        remaining,
        maxLimit: MAX_CALLS_PER_DAY
    };
};

