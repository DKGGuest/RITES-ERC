/**
 * Service for Billing Stage API calls
 * TODO: Uncomment API calls for production with backend
 */

// TODO: Uncomment for production with backend
// const API_BASE_URL = 'http://localhost:8081/sarthi-backend/api/billing';

// Billing status constants
export const BILLING_STATUS = {
    BILLING_PENDING: 'Billing Pending',
    BILL_RAISED: 'Bill Raised',
    PAYMENT_PENDING: 'Payment Pending',
    UNDER_SUSPENSE: 'Under Suspense',
    PAYMENT_DONE: 'Payment Done'
};

// Mock storage for billing data (persists in memory during session)
const mockBillingData = {};

/**
 * Get all calls in billing stage (IC issued, not yet payment done)
 * @returns {Promise<Array>} - List of calls in billing stage
 */
export const getBillingCalls = async () => {
    // TODO: Uncomment for production with backend
    /*
    const response = await fetch(`${API_BASE_URL}/calls`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fetch billing calls');
    const data = await response.json();
    return data.responseData || [];
    */

    // Mock implementation for Vercel deployment
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(Object.values(mockBillingData));
        }, 200);
    });
};

/**
 * Raise a bill for a call
 * @param {Object} billData - { callNo, billNo, billDate, billAmount, createdBy }
 */
export const raiseBill = async (billData) => {
    // TODO: Uncomment for production with backend
    /*
    const response = await fetch(`${API_BASE_URL}/raise-bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.responseStatus?.message || 'Failed to raise bill');
    }
    return await response.json();
    */

    // Mock implementation for Vercel deployment
    return new Promise((resolve) => {
        setTimeout(() => {
            mockBillingData[billData.callNo] = {
                ...mockBillingData[billData.callNo],
                ...billData,
                billing_status: BILLING_STATUS.BILL_RAISED,
                updatedAt: new Date().toISOString()
            };
            resolve(mockBillingData[billData.callNo]);
        }, 300);
    });
};

/**
 * Update billing status for a call
 * @param {Object} statusData - { callNo, billing_status, updatedBy }
 */
export const updateBillingStatus = async (statusData) => {
    // TODO: Uncomment for production with backend
    /*
    const response = await fetch(`${API_BASE_URL}/update-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statusData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.responseStatus?.message || 'Failed to update billing status');
    }
    return await response.json();
    */

    // Mock implementation for Vercel deployment
    return new Promise((resolve) => {
        setTimeout(() => {
            mockBillingData[statusData.callNo] = {
                ...mockBillingData[statusData.callNo],
                billing_status: statusData.billing_status,
                updatedBy: statusData.updatedBy,
                updatedAt: new Date().toISOString()
            };
            resolve(mockBillingData[statusData.callNo]);
        }, 300);
    });
};

/**
 * Mark payment as done and approve (moves to Completed)
 * @param {Object} paymentData - { callNo, paymentDate, paymentRef, approvedBy }
 */
export const approvePayment = async (paymentData) => {
    // TODO: Uncomment for production with backend
    /*
    const response = await fetch(`${API_BASE_URL}/approve-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.responseStatus?.message || 'Failed to approve payment');
    }
    return await response.json();
    */

    // Mock implementation for Vercel deployment
    return new Promise((resolve) => {
        setTimeout(() => {
            mockBillingData[paymentData.callNo] = {
                ...mockBillingData[paymentData.callNo],
                billing_status: BILLING_STATUS.PAYMENT_DONE,
                payment_date: paymentData.paymentDate,
                payment_ref: paymentData.paymentRef,
                approved_by: paymentData.approvedBy,
                updatedAt: new Date().toISOString()
            };
            resolve(mockBillingData[paymentData.callNo]);
        }, 300);
    });
};

/**
 * Get billing details for a specific call
 * @param {string} callNo - Call number
 */
export const getBillingByCallNo = async (callNo) => {
    // TODO: Uncomment for production with backend
    /*
    const response = await fetch(`${API_BASE_URL}/${callNo}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.responseData;
    */

    // Mock implementation for Vercel deployment
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockBillingData[callNo] || null);
        }, 200);
    });
};

