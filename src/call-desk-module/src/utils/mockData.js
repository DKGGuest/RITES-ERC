/**
 * Call Desk Module Mock Data
 * Comprehensive mock data for demonstration and testing
 */

import { CALL_STATUS, PRODUCT_TYPES, INSPECTION_STAGES, RIO_TYPES } from './constants';

// Mock Vendors
export const MOCK_VENDORS = [
  { id: 'V001', name: 'Global Materials Corp', location: 'Mumbai', contact: '+91-9876543210', email: 'contact@globalmat.com' },
  { id: 'V002', name: 'Premium Materials Inc', location: 'Delhi', contact: '+91-9876543211', email: 'info@premiummat.com' },
  { id: 'V003', name: 'Steel Industries Ltd', location: 'Bangalore', contact: '+91-9876543212', email: 'sales@steelindustries.com' },
  { id: 'V004', name: 'Quality Forge Pvt Ltd', location: 'Chennai', contact: '+91-9876543213', email: 'quality@forge.com' },
  { id: 'V005', name: 'Precision Engineering Co', location: 'Pune', contact: '+91-9876543214', email: 'contact@precision.com' },
  { id: 'V006', name: 'Advanced Metallurgy Works', location: 'Kolkata', contact: '+91-9876543215', email: 'info@advancedmet.com' }
];

// Mock RIO Offices
export const MOCK_RIO_OFFICES = [
  { id: 'CRIO', name: 'Central Regional Inspection Office', location: 'Delhi', code: RIO_TYPES.CRIO },
  { id: 'ERIO', name: 'Eastern Regional Inspection Office', location: 'Kolkata', code: RIO_TYPES.ERIO },
  { id: 'NRIO', name: 'Northern Regional Inspection Office', location: 'Chandigarh', code: RIO_TYPES.NRIO },
  { id: 'SRIO', name: 'Southern Regional Inspection Office', location: 'Chennai', code: RIO_TYPES.SRIO },
  { id: 'WRIO', name: 'Western Regional Inspection Office', location: 'Mumbai', code: RIO_TYPES.WRIO }
];

// Mock Pending Verification Calls
export const MOCK_PENDING_VERIFICATION_CALLS = [
  {
    id: 'CALL-2025-PV-001',
    callNumber: 'CALL-2025-PV-001',
    vendor: MOCK_VENDORS[0],
    submissionDateTime: '2025-01-24T09:30:00',
    poNumber: 'PO-2024-1234',
    product: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.RAW_MATERIAL,
    productStage: `${PRODUCT_TYPES.ERC} - ${INSPECTION_STAGES.RAW_MATERIAL}`,
    desiredInspectionDate: '2025-02-05',
    placeOfInspection: 'Mumbai Plant - Unit 1',
    status: CALL_STATUS.FRESH_SUBMISSION,
    rio: RIO_TYPES.WRIO,
    quantity: 1500,
    submissionCount: 1,
    documents: ['PO_Copy.pdf', 'TC_Certificate.pdf', 'Drawing.pdf']
  },
  {
    id: 'CALL-2025-PV-002',
    callNumber: 'CALL-2025-PV-002',
    vendor: MOCK_VENDORS[1],
    submissionDateTime: '2025-01-24T10:15:00',
    poNumber: 'PO-2024-1235',
    product: PRODUCT_TYPES.SLEEPER,
    stage: INSPECTION_STAGES.PROCESS,
    productStage: `${PRODUCT_TYPES.SLEEPER} - ${INSPECTION_STAGES.PROCESS}`,
    desiredInspectionDate: '2025-02-06',
    placeOfInspection: 'Delhi Manufacturing Facility',
    status: CALL_STATUS.RESUBMISSION,
    rio: RIO_TYPES.CRIO,
    quantity: 2000,
    submissionCount: 2,
    returnReason: 'Incomplete documentation - TC missing',
    documents: ['PO_Copy.pdf', 'TC_Certificate.pdf', 'Drawing.pdf', 'Revised_TC.pdf']
  },
  {
    id: 'CALL-2025-PV-003',
    callNumber: 'CALL-2025-PV-003',
    vendor: MOCK_VENDORS[2],
    submissionDateTime: '2025-01-24T11:00:00',
    poNumber: 'PO-2024-1236',
    product: PRODUCT_TYPES.GRSP,
    stage: INSPECTION_STAGES.FINAL,
    productStage: `${PRODUCT_TYPES.GRSP} - ${INSPECTION_STAGES.FINAL}`,
    desiredInspectionDate: '2025-02-07',
    placeOfInspection: 'Bangalore Production Unit',
    status: CALL_STATUS.FRESH_SUBMISSION,
    rio: RIO_TYPES.SRIO,
    quantity: 1200,
    submissionCount: 1,
    documents: ['PO_Copy.pdf', 'TC_Certificate.pdf', 'Drawing.pdf', 'Test_Report.pdf']
  },
  {
    id: 'CALL-2025-PV-004',
    callNumber: 'CALL-2025-PV-004',
    vendor: MOCK_VENDORS[3],
    submissionDateTime: '2025-01-23T14:30:00',
    poNumber: 'PO-2024-1237',
    product: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.PROCESS,
    productStage: `${PRODUCT_TYPES.ERC} - ${INSPECTION_STAGES.PROCESS}`,
    desiredInspectionDate: '2025-02-08',
    placeOfInspection: 'Chennai Forge Works',
    status: CALL_STATUS.RETURNED,
    rio: RIO_TYPES.SRIO,
    quantity: 1800,
    submissionCount: 3,
    returnReason: 'PO number mismatch with documents',
    flaggedFields: ['poNumber', 'quantity'],
    documents: ['PO_Copy.pdf', 'TC_Certificate.pdf']
  },
  {
    id: 'CALL-2025-PV-005',
    callNumber: 'CALL-2025-PV-005',
    vendor: MOCK_VENDORS[4],
    submissionDateTime: '2025-01-24T08:45:00',
    poNumber: 'PO-2024-1238',
    product: PRODUCT_TYPES.SLEEPER,
    stage: INSPECTION_STAGES.RAW_MATERIAL,
    productStage: `${PRODUCT_TYPES.SLEEPER} - ${INSPECTION_STAGES.RAW_MATERIAL}`,
    desiredInspectionDate: '2025-02-09',
    placeOfInspection: 'Pune Steel Plant',
    status: CALL_STATUS.FRESH_SUBMISSION,
    rio: RIO_TYPES.WRIO,
    quantity: 2500,
    submissionCount: 1,
    documents: ['PO_Copy.pdf', 'TC_Certificate.pdf', 'Drawing.pdf', 'Material_Cert.pdf']
  },
  {
    id: 'CALL-2025-PV-006',
    callNumber: 'CALL-2025-PV-006',
    vendor: MOCK_VENDORS[5],
    submissionDateTime: '2025-01-23T16:20:00',
    poNumber: 'PO-2024-1239',
    product: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.FINAL,
    productStage: `${PRODUCT_TYPES.ERC} - ${INSPECTION_STAGES.FINAL}`,
    desiredInspectionDate: '2025-02-10',
    placeOfInspection: 'Kolkata Manufacturing Hub',
    status: CALL_STATUS.RESUBMISSION,
    rio: RIO_TYPES.ERIO,
    quantity: 1600,
    submissionCount: 2,
    returnReason: 'Drawing revision mismatch',
    documents: ['PO_Copy.pdf', 'TC_Certificate.pdf', 'Drawing_Rev2.pdf']
  }
];

// Mock Verified & Open Calls
export const MOCK_VERIFIED_OPEN_CALLS = [
  {
    id: 'CALL-2025-VO-001',
    callNumber: 'CALL-2025-VO-001',
    vendor: MOCK_VENDORS[0],
    submissionDateTime: '2025-01-20T09:00:00',
    poNumber: 'PO-2024-1220',
    product: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.RAW_MATERIAL,
    productStage: `${PRODUCT_TYPES.ERC} - ${INSPECTION_STAGES.RAW_MATERIAL}`,
    desiredInspectionDate: '2025-02-01',
    placeOfInspection: 'Mumbai Plant - Unit 2',
    status: CALL_STATUS.VERIFIED_REGISTERED,
    rio: RIO_TYPES.WRIO,
    quantity: 1400,
    verifiedDate: '2025-01-20T14:30:00',
    verifiedBy: 'Call Desk Officer - Ramesh Kumar'
  },
  {
    id: 'CALL-2025-VO-002',
    callNumber: 'CALL-2025-VO-002',
    vendor: MOCK_VENDORS[1],
    submissionDateTime: '2025-01-19T10:30:00',
    poNumber: 'PO-2024-1221',
    product: PRODUCT_TYPES.SLEEPER,
    stage: INSPECTION_STAGES.PROCESS,
    productStage: `${PRODUCT_TYPES.SLEEPER} - ${INSPECTION_STAGES.PROCESS}`,
    desiredInspectionDate: '2025-02-02',
    placeOfInspection: 'Delhi Manufacturing Facility',
    status: CALL_STATUS.IE_ASSIGNMENT_PENDING,
    rio: RIO_TYPES.CRIO,
    quantity: 1900,
    verifiedDate: '2025-01-19T15:00:00',
    verifiedBy: 'Call Desk Officer - Priya Sharma'
  },
  {
    id: 'CALL-2025-VO-003',
    callNumber: 'CALL-2025-VO-003',
    vendor: MOCK_VENDORS[2],
    submissionDateTime: '2025-01-18T11:15:00',
    poNumber: 'PO-2024-1222',
    product: PRODUCT_TYPES.GRSP,
    stage: INSPECTION_STAGES.FINAL,
    productStage: `${PRODUCT_TYPES.GRSP} - ${INSPECTION_STAGES.FINAL}`,
    desiredInspectionDate: '2025-02-03',
    placeOfInspection: 'Bangalore Production Unit',
    status: CALL_STATUS.ASSIGNED_TO_IE,
    rio: RIO_TYPES.SRIO,
    quantity: 1100,
    verifiedDate: '2025-01-18T16:00:00',
    verifiedBy: 'Call Desk Officer - Amit Patel',
    assignedIE: 'IE - Rajesh Kumar',
    assignedDate: '2025-01-19T10:00:00'
  },
  {
    id: 'CALL-2025-VO-004',
    callNumber: 'CALL-2025-VO-004',
    vendor: MOCK_VENDORS[3],
    submissionDateTime: '2025-01-17T09:45:00',
    poNumber: 'PO-2024-1223',
    product: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.PROCESS,
    productStage: `${PRODUCT_TYPES.ERC} - ${INSPECTION_STAGES.PROCESS}`,
    desiredInspectionDate: '2025-02-04',
    placeOfInspection: 'Chennai Forge Works',
    status: CALL_STATUS.SCHEDULED,
    rio: RIO_TYPES.SRIO,
    quantity: 1700,
    verifiedDate: '2025-01-17T14:00:00',
    verifiedBy: 'Call Desk Officer - Sneha Reddy',
    assignedIE: 'IE - Priya Sharma',
    assignedDate: '2025-01-18T09:00:00',
    scheduledDate: '2025-02-04'
  },
  {
    id: 'CALL-2025-VO-005',
    callNumber: 'CALL-2025-VO-005',
    vendor: MOCK_VENDORS[4],
    submissionDateTime: '2025-01-16T13:20:00',
    poNumber: 'PO-2024-1224',
    product: PRODUCT_TYPES.SLEEPER,
    stage: INSPECTION_STAGES.RAW_MATERIAL,
    productStage: `${PRODUCT_TYPES.SLEEPER} - ${INSPECTION_STAGES.RAW_MATERIAL}`,
    desiredInspectionDate: '2025-01-28',
    placeOfInspection: 'Pune Steel Plant',
    status: CALL_STATUS.UNDER_INSPECTION,
    rio: RIO_TYPES.WRIO,
    quantity: 2200,
    verifiedDate: '2025-01-16T16:00:00',
    verifiedBy: 'Call Desk Officer - Ramesh Kumar',
    assignedIE: 'IE - Amit Patel',
    assignedDate: '2025-01-17T10:00:00',
    scheduledDate: '2025-01-28',
    inspectionStartDate: '2025-01-28T09:00:00'
  },
  {
    id: 'CALL-2025-VO-006',
    callNumber: 'CALL-2025-VO-006',
    vendor: MOCK_VENDORS[5],
    submissionDateTime: '2025-01-15T10:00:00',
    poNumber: 'PO-2024-1225',
    product: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.FINAL,
    productStage: `${PRODUCT_TYPES.ERC} - ${INSPECTION_STAGES.FINAL}`,
    desiredInspectionDate: '2025-01-27',
    placeOfInspection: 'Kolkata Manufacturing Hub',
    status: CALL_STATUS.UNDER_LAB_TESTING,
    rio: RIO_TYPES.ERIO,
    quantity: 1300,
    verifiedDate: '2025-01-15T15:00:00',
    verifiedBy: 'Call Desk Officer - Priya Sharma',
    assignedIE: 'IE - Vikram Singh',
    assignedDate: '2025-01-16T09:00:00',
    scheduledDate: '2025-01-27',
    inspectionStartDate: '2025-01-27T08:30:00',
    labTestingStartDate: '2025-01-29T10:00:00'
  },
  {
    id: 'CALL-2025-VO-007',
    callNumber: 'CALL-2025-VO-007',
    vendor: MOCK_VENDORS[0],
    submissionDateTime: '2025-01-14T11:30:00',
    poNumber: 'PO-2024-1226',
    product: PRODUCT_TYPES.GRSP,
    stage: INSPECTION_STAGES.PROCESS,
    productStage: `${PRODUCT_TYPES.GRSP} - ${INSPECTION_STAGES.PROCESS}`,
    desiredInspectionDate: '2025-01-26',
    placeOfInspection: 'Mumbai Plant - Unit 3',
    status: CALL_STATUS.IC_PENDING,
    rio: RIO_TYPES.WRIO,
    quantity: 1550,
    verifiedDate: '2025-01-14T16:00:00',
    verifiedBy: 'Call Desk Officer - Amit Patel',
    assignedIE: 'IE - Rajesh Kumar',
    assignedDate: '2025-01-15T09:00:00',
    scheduledDate: '2025-01-26',
    inspectionStartDate: '2025-01-26T09:00:00',
    inspectionCompletedDate: '2025-01-27T17:00:00'
  },
  {
    id: 'CALL-2025-VO-008',
    callNumber: 'CALL-2025-VO-008',
    vendor: MOCK_VENDORS[1],
    submissionDateTime: '2025-01-13T09:15:00',
    poNumber: 'PO-2024-1227',
    product: PRODUCT_TYPES.SLEEPER,
    stage: INSPECTION_STAGES.FINAL,
    productStage: `${PRODUCT_TYPES.SLEEPER} - ${INSPECTION_STAGES.FINAL}`,
    desiredInspectionDate: '2025-01-25',
    placeOfInspection: 'Delhi Manufacturing Facility',
    status: CALL_STATUS.BILLING_PENDING,
    rio: RIO_TYPES.CRIO,
    quantity: 2100,
    verifiedDate: '2025-01-13T14:00:00',
    verifiedBy: 'Call Desk Officer - Sneha Reddy',
    assignedIE: 'IE - Priya Sharma',
    assignedDate: '2025-01-14T09:00:00',
    scheduledDate: '2025-01-25',
    inspectionStartDate: '2025-01-25T08:00:00',
    inspectionCompletedDate: '2025-01-26T16:00:00',
    icIssuedDate: '2025-01-27T11:00:00'
  }
];

// Mock Disposed Calls
export const MOCK_DISPOSED_CALLS = [
  {
    id: 'CALL-2025-D-001',
    callNumber: 'CALL-2025-D-001',
    vendor: MOCK_VENDORS[0],
    submissionDateTime: '2025-01-05T09:00:00',
    poNumber: 'PO-2024-1200',
    product: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.RAW_MATERIAL,
    productStage: `${PRODUCT_TYPES.ERC} - ${INSPECTION_STAGES.RAW_MATERIAL}`,
    desiredInspectionDate: '2025-01-15',
    placeOfInspection: 'Mumbai Plant - Unit 1',
    status: CALL_STATUS.COMPLETED,
    rio: RIO_TYPES.WRIO,
    quantity: 1500,
    verifiedDate: '2025-01-05T14:00:00',
    verifiedBy: 'Call Desk Officer - Ramesh Kumar',
    assignedIE: 'IE - Rajesh Kumar',
    completedDate: '2025-01-20T17:00:00',
    disposalReason: 'Inspection completed successfully'
  },
  {
    id: 'CALL-2025-D-002',
    callNumber: 'CALL-2025-D-002',
    vendor: MOCK_VENDORS[1],
    submissionDateTime: '2025-01-06T10:30:00',
    poNumber: 'PO-2024-1201',
    product: PRODUCT_TYPES.SLEEPER,
    stage: INSPECTION_STAGES.PROCESS,
    productStage: `${PRODUCT_TYPES.SLEEPER} - ${INSPECTION_STAGES.PROCESS}`,
    desiredInspectionDate: '2025-01-16',
    placeOfInspection: 'Delhi Manufacturing Facility',
    status: CALL_STATUS.WITHDRAWN,
    rio: RIO_TYPES.CRIO,
    quantity: 2000,
    verifiedDate: '2025-01-06T15:00:00',
    verifiedBy: 'Call Desk Officer - Priya Sharma',
    withdrawnDate: '2025-01-18T11:00:00',
    disposalReason: 'Vendor requested withdrawal due to production delay'
  },
  {
    id: 'CALL-2025-D-003',
    callNumber: 'CALL-2025-D-003',
    vendor: MOCK_VENDORS[2],
    submissionDateTime: '2025-01-07T11:15:00',
    poNumber: 'PO-2024-1202',
    product: PRODUCT_TYPES.GRSP,
    stage: INSPECTION_STAGES.FINAL,
    productStage: `${PRODUCT_TYPES.GRSP} - ${INSPECTION_STAGES.FINAL}`,
    desiredInspectionDate: '2025-01-17',
    placeOfInspection: 'Bangalore Production Unit',
    status: CALL_STATUS.CANCELLED_CHARGEABLE,
    rio: RIO_TYPES.SRIO,
    quantity: 1200,
    verifiedDate: '2025-01-07T16:00:00',
    verifiedBy: 'Call Desk Officer - Amit Patel',
    assignedIE: 'IE - Priya Sharma',
    cancelledDate: '2025-01-19T14:00:00',
    disposalReason: 'Vendor failed to provide material on scheduled date (3rd instance)'
  },
  {
    id: 'CALL-2025-D-004',
    callNumber: 'CALL-2025-D-004',
    vendor: MOCK_VENDORS[3],
    submissionDateTime: '2025-01-08T09:45:00',
    poNumber: 'PO-2024-1203',
    product: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.PROCESS,
    productStage: `${PRODUCT_TYPES.ERC} - ${INSPECTION_STAGES.PROCESS}`,
    desiredInspectionDate: '2025-01-18',
    placeOfInspection: 'Chennai Forge Works',
    status: CALL_STATUS.COMPLETED,
    rio: RIO_TYPES.SRIO,
    quantity: 1800,
    verifiedDate: '2025-01-08T14:00:00',
    verifiedBy: 'Call Desk Officer - Sneha Reddy',
    assignedIE: 'IE - Amit Patel',
    completedDate: '2025-01-22T16:30:00',
    disposalReason: 'Inspection completed successfully'
  },
  {
    id: 'CALL-2025-D-005',
    callNumber: 'CALL-2025-D-005',
    vendor: MOCK_VENDORS[4],
    submissionDateTime: '2025-01-09T13:20:00',
    poNumber: 'PO-2024-1204',
    product: PRODUCT_TYPES.SLEEPER,
    stage: INSPECTION_STAGES.RAW_MATERIAL,
    productStage: `${PRODUCT_TYPES.SLEEPER} - ${INSPECTION_STAGES.RAW_MATERIAL}`,
    desiredInspectionDate: '2025-01-19',
    placeOfInspection: 'Pune Steel Plant',
    status: CALL_STATUS.CANCELLED_NON_CHARGEABLE,
    rio: RIO_TYPES.WRIO,
    quantity: 2500,
    verifiedDate: '2025-01-09T16:00:00',
    verifiedBy: 'Call Desk Officer - Ramesh Kumar',
    cancelledDate: '2025-01-17T10:00:00',
    disposalReason: 'PO cancelled by railway administration'
  },
  {
    id: 'CALL-2025-D-006',
    callNumber: 'CALL-2025-D-006',
    vendor: MOCK_VENDORS[5],
    submissionDateTime: '2025-01-10T10:00:00',
    poNumber: 'PO-2024-1205',
    product: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.FINAL,
    productStage: `${PRODUCT_TYPES.ERC} - ${INSPECTION_STAGES.FINAL}`,
    desiredInspectionDate: '2025-01-20',
    placeOfInspection: 'Kolkata Manufacturing Hub',
    status: CALL_STATUS.REJECTED_CLOSED,
    rio: RIO_TYPES.ERIO,
    quantity: 1600,
    verifiedDate: '2025-01-10T15:00:00',
    verifiedBy: 'Call Desk Officer - Priya Sharma',
    assignedIE: 'IE - Vikram Singh',
    rejectedDate: '2025-01-21T13:00:00',
    disposalReason: 'Material failed critical quality parameters - rejected by IE'
  },
  {
    id: 'CALL-2025-D-007',
    callNumber: 'CALL-2025-D-007',
    vendor: MOCK_VENDORS[0],
    submissionDateTime: '2025-01-11T11:30:00',
    poNumber: 'PO-2024-1206',
    product: PRODUCT_TYPES.GRSP,
    stage: INSPECTION_STAGES.PROCESS,
    productStage: `${PRODUCT_TYPES.GRSP} - ${INSPECTION_STAGES.PROCESS}`,
    desiredInspectionDate: '2025-01-21',
    placeOfInspection: 'Mumbai Plant - Unit 2',
    status: CALL_STATUS.COMPLETED,
    rio: RIO_TYPES.WRIO,
    quantity: 1400,
    verifiedDate: '2025-01-11T16:00:00',
    verifiedBy: 'Call Desk Officer - Amit Patel',
    assignedIE: 'IE - Rajesh Kumar',
    completedDate: '2025-01-23T15:00:00',
    disposalReason: 'Inspection completed successfully'
  }
];

// Mock Call History
export const MOCK_CALL_HISTORY = {
  'CALL-2025-PV-001': [
    { timestamp: '2025-01-24T09:30:00', action: 'Call Submitted', user: 'Vendor - Global Materials Corp', remarks: 'Fresh call submission for RM inspection' }
  ],
  'CALL-2025-PV-002': [
    { timestamp: '2025-01-23T10:00:00', action: 'Call Submitted', user: 'Vendor - Premium Materials Inc', remarks: 'Fresh call submission' },
    { timestamp: '2025-01-23T15:30:00', action: 'Returned for Rectification', user: 'Call Desk - Priya Sharma', remarks: 'TC certificate missing' },
    { timestamp: '2025-01-24T10:15:00', action: 'Call Resubmitted', user: 'Vendor - Premium Materials Inc', remarks: 'Resubmitted with TC certificate' }
  ],
  'CALL-2025-PV-004': [
    { timestamp: '2025-01-21T09:00:00', action: 'Call Submitted', user: 'Vendor - Quality Forge Pvt Ltd', remarks: 'Fresh call submission' },
    { timestamp: '2025-01-21T14:00:00', action: 'Returned for Rectification', user: 'Call Desk - Amit Patel', remarks: 'PO number mismatch' },
    { timestamp: '2025-01-22T10:00:00', action: 'Call Resubmitted', user: 'Vendor - Quality Forge Pvt Ltd', remarks: 'Corrected PO number' },
    { timestamp: '2025-01-22T16:00:00', action: 'Returned for Rectification', user: 'Call Desk - Sneha Reddy', remarks: 'Quantity mismatch with PO' },
    { timestamp: '2025-01-23T14:30:00', action: 'Call Resubmitted', user: 'Vendor - Quality Forge Pvt Ltd', remarks: 'Corrected quantity' }
  ]
};

// Mock Dashboard KPIs
export const MOCK_DASHBOARD_KPIS = {
  pendingVerification: {
    total: 6,
    fresh: 3,
    resubmissions: 2,
    returned: 1
  },
  verifiedOpen: {
    total: 8,
    ieAssignmentPending: 1,
    assignedToIE: 1,
    underInspection: 1,
    icPending: 1,
    billingPending: 1
  },
  disposed: {
    total: 7,
    completed: 3,
    withdrawn: 1,
    cancelled: 2,
    rejected: 1
  }
};

// Export all mock data
export const MOCK_ALL_CALLS = [
  ...MOCK_PENDING_VERIFICATION_CALLS,
  ...MOCK_VERIFIED_OPEN_CALLS,
  ...MOCK_DISPOSED_CALLS
];


