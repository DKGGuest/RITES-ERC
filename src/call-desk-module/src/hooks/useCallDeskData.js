

import { useState, useEffect } from 'react';
import axios from 'axios';
import { getStoredUser, getAuthHeaders } from '../../../services/authService';
const BASE_URL =
  'https://sarthibackendservice-bfe2eag3byfkbsa6.canadacentral-01.azurewebsites.net/sarthi-backend';


export const useCallDeskData = () => {
  const [pendingCalls, setPendingCalls] = useState([]);
  const [verifiedCalls, setVerifiedCalls] = useState([]);
  const [disposedCalls, setDisposedCalls] = useState([]);
  const [dashboardKPIs, setDashboardKPIs] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [rioOffices, setRioOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulate API call to fetch data
 // Fetch data from backend API
const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);

    // Pending Verification Calls
    const pending = await fetchPendingVerificationCalls();

    setPendingCalls(pending);

    // KPIs (derived from API data)
    setDashboardKPIs({
      pendingVerification: {
        total: pending.length,
        fresh: pending.length,
        resubmissions: 0,
        returned: 0,
      },
      verifiedOpen: {
        total: 0,
      },
      disposed: {
        total: 0,
      },
    });

    setVerifiedCalls([]);   // later via API
    setDisposedCalls([]);   // later via API
    setVendors([]);         // later via API
    setRioOffices([]);      // later via API

  } catch (err) {
    setError(err.message || 'Failed to fetch Call Desk data');
  } finally {
    setLoading(false);
  }
};

  //  API: Fetch Pending Verification Calls
const fetchPendingVerificationCalls = async () => {
  const user = getStoredUser();

  const response = await axios.get(
    `${BASE_URL}/allPendingWorkflowTransition`,
    {
      params: {
        roleName: 'RIO Help Desk',
      },
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (response.data?.responseStatus?.statusCode !== 0) {
    throw new Error('Failed to fetch pending verification calls');
  }

  //  Filter by assignedToUser == logged-in user
  return response.data.responseData
    .filter(
      item => String(item.rio) === String(user.rio)
    )
    .map(item => ({
      id: item.workflowTransitionId,
      callNumber: item.requestId,
      vendor: { name: item.vendorName || '-' },
      submissionDateTime: item.createdDate,
      poNumber: item.poNo,
      productStage: item.productType,
      desiredInspectionDate: item.desiredInspectionDate,
      placeOfInspection: '-',
      status: item.status,
      rio: item.rio,
    }));
};


  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Get call by ID
  const getCallById = (callId) => {
    const allCalls = [...pendingCalls, ...verifiedCalls, ...disposedCalls];
    return allCalls.find(call => call.id === callId || call.callNumber === callId);
  };

  // Get call history
 const getCallHistory = () => {
  return [];
};

  // Get calls by status
  const getCallsByStatus = (status) => {
    const allCalls = [...pendingCalls, ...verifiedCalls, ...disposedCalls];
    return allCalls.filter(call => call.status === status);
  };

  // Get calls by RIO
  const getCallsByRIO = (rio) => {
    const allCalls = [...pendingCalls, ...verifiedCalls, ...disposedCalls];
    return allCalls.filter(call => call.rio === rio);
  };

  // Get vendor by ID
  const getVendorById = (vendorId) => {
    return vendors.find(vendor => vendor.id === vendorId);
  };

  // Refresh data
  const refreshData = () => {
    fetchData();
  };

  return {
    // Data
    pendingCalls,
    verifiedCalls,
    disposedCalls,
    dashboardKPIs,
    vendors,
    rioOffices,
    
    // State
    loading,
    error,
    
    // Functions
    getCallById,
    getCallHistory,
    getCallsByStatus,
    getCallsByRIO,
    getVendorById,
    refreshData
  };
};

export default useCallDeskData;

