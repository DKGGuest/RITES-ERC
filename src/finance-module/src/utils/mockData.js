/**
 * Finance Module Mock Data
 * Comprehensive mock data for all Finance Dashboard sections
 */

import { PAYMENT_STATUS, BILL_STATUS, PAYMENT_TYPES, PRODUCT_TYPES, INSPECTION_STAGES } from './constants';

// Mock Vendors
export const MOCK_VENDORS = [
  { id: 'V001', name: 'ABC Steel Industries', code: 'ABC-001' },
  { id: 'V002', name: 'XYZ Manufacturing Ltd', code: 'XYZ-002' },
  { id: 'V003', name: 'PQR Engineering Works', code: 'PQR-003' },
  { id: 'V004', name: 'LMN Fabricators Pvt Ltd', code: 'LMN-004' },
  { id: 'V005', name: 'RST Industries', code: 'RST-005' }
];

// Mock Dashboard KPIs
export const MOCK_DASHBOARD_KPIS = {
  pendingFinanceApproval: {
    count: 12,
    amount: 2450000,
    slaBreached: 3
  },
  pendingBilling: {
    count: 8,
    amount: 1850000,
    underSuspense: 2
  },
  billsGenerated: {
    count: 15,
    amount: 3750000,
    paymentPending: 15
  },
  billsCleared: {
    count: 45,
    amount: 12500000,
    thisMonth: 8
  },
  totalRevenue: {
    amount: 20550000,
    thisMonth: 4250000,
    growth: 12.5
  }
};

// Section 1: Vendor Payments - Pending Finance Approval
export const MOCK_PENDING_PAYMENTS = [
  {
    id: 'PAY-001',
    callNumber: 'CALL-2025-001',
    vendor: { id: 'V001', name: 'ABC Steel Industries' },
    poNumber: 'PO-2024-1001',
    productType: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.FINAL,
    paymentType: PAYMENT_TYPES.INSPECTION_FEE,
    amount: 125000,
    submissionDate: '2025-01-20T10:30:00',
    submittedBy: 'IE - Rajesh Kumar',
    paymentStatus: PAYMENT_STATUS.PENDING_FINANCE_APPROVAL,
    remarks: 'Final inspection completed, IC issued',
    documents: ['invoice.pdf', 'ic_certificate.pdf'],
    slaBreached: false
  },
  {
    id: 'PAY-002',
    callNumber: 'CALL-2025-002',
    vendor: { id: 'V002', name: 'XYZ Manufacturing Ltd' },
    poNumber: 'PO-2024-1002',
    productType: PRODUCT_TYPES.SLEEPER,
    stage: INSPECTION_STAGES.RAW_MATERIAL,
    paymentType: PAYMENT_TYPES.TESTING_FEE,
    amount: 85000,
    submissionDate: '2025-01-18T14:15:00',
    submittedBy: 'IE - Priya Sharma',
    paymentStatus: PAYMENT_STATUS.PENDING_FINANCE_APPROVAL,
    remarks: 'Lab testing completed',
    documents: ['test_report.pdf', 'invoice.pdf'],
    slaBreached: true
  },
  {
    id: 'PAY-003',
    callNumber: 'CALL-2025-003',
    vendor: { id: 'V003', name: 'PQR Engineering Works' },
    poNumber: 'PO-2024-1003',
    productType: PRODUCT_TYPES.GRSP,
    stage: INSPECTION_STAGES.PROCESS,
    paymentType: PAYMENT_TYPES.INSPECTION_FEE,
    amount: 95000,
    submissionDate: '2025-01-22T09:00:00',
    submittedBy: 'IE - Amit Patel',
    paymentStatus: PAYMENT_STATUS.PENDING_FINANCE_APPROVAL,
    remarks: 'Process inspection completed',
    documents: ['invoice.pdf'],
    slaBreached: false
  },
  {
    id: 'PAY-004',
    callNumber: 'CALL-2025-004',
    vendor: { id: 'V001', name: 'ABC Steel Industries' },
    poNumber: 'PO-2024-1004',
    productType: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.FINAL,
    paymentType: PAYMENT_TYPES.TRAVEL_CHARGES,
    amount: 15000,
    submissionDate: '2025-01-17T11:30:00',
    submittedBy: 'IE - Rajesh Kumar',
    paymentStatus: PAYMENT_STATUS.RETURNED,
    remarks: 'Incorrect travel claim amount',
    returnReason: 'Travel claim exceeds approved limit. Please revise.',
    returnedBy: 'Finance - Suresh Menon',
    returnedDate: '2025-01-19T16:00:00',
    documents: ['travel_claim.pdf'],
    slaBreached: true
  },
  {
    id: 'PAY-005',
    callNumber: 'CALL-2025-005',
    vendor: { id: 'V004', name: 'LMN Fabricators Pvt Ltd' },
    poNumber: 'PO-2024-1005',
    productType: PRODUCT_TYPES.SLEEPER,
    stage: INSPECTION_STAGES.RAW_MATERIAL,
    paymentType: PAYMENT_TYPES.INSPECTION_FEE,
    amount: 110000,
    submissionDate: '2025-01-23T13:45:00',
    submittedBy: 'IE - Neha Gupta',
    paymentStatus: PAYMENT_STATUS.RESUBMITTED,
    remarks: 'Resubmitted with corrected invoice',
    originalSubmissionDate: '2025-01-15T10:00:00',
    documents: ['invoice_revised.pdf', 'ic_certificate.pdf'],
    slaBreached: false
  }
];

// Section 2: Inspection Calls Pending Billing
export const MOCK_PENDING_BILLING = [
  {
    id: 'IC-001',
    callNumber: 'CALL-2025-010',
    vendor: { id: 'V001', name: 'ABC Steel Industries' },
    poNumber: 'PO-2024-1010',
    productType: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.FINAL,
    icIssuedDate: '2025-01-15T10:00:00',
    icNumber: 'IC-2025-001',
    inspectionAmount: 125000,
    testingAmount: 35000,
    totalAmount: 160000,
    billStatus: BILL_STATUS.BILLING_PENDING,
    assignedTo: 'Finance - Suresh Menon',
    remarks: 'IC issued, ready for billing',
    slaBreached: true
  },
  {
    id: 'IC-002',
    callNumber: 'CALL-2025-011',
    vendor: { id: 'V002', name: 'XYZ Manufacturing Ltd' },
    poNumber: 'PO-2024-1011',
    productType: PRODUCT_TYPES.SLEEPER,
    stage: INSPECTION_STAGES.PROCESS,
    icIssuedDate: '2025-01-20T14:30:00',
    icNumber: 'IC-2025-002',
    inspectionAmount: 95000,
    testingAmount: 0,
    totalAmount: 95000,
    billStatus: BILL_STATUS.UNDER_SUSPENSE,
    assignedTo: 'Finance - Suresh Menon',
    remarks: 'Payment not received for previous bill',
    suspenseReason: 'Vendor has outstanding payment of ₹2,50,000 from previous billing cycle',
    suspenseDate: '2025-01-21T09:00:00',
    slaBreached: false
  },
  {
    id: 'IC-003',
    callNumber: 'CALL-2025-012',
    vendor: { id: 'V003', name: 'PQR Engineering Works' },
    poNumber: 'PO-2024-1012',
    productType: PRODUCT_TYPES.GRSP,
    stage: INSPECTION_STAGES.RAW_MATERIAL,
    icIssuedDate: '2025-01-22T11:00:00',
    icNumber: 'IC-2025-003',
    inspectionAmount: 75000,
    testingAmount: 25000,
    totalAmount: 100000,
    billStatus: BILL_STATUS.BILLING_PENDING,
    assignedTo: 'Finance - Suresh Menon',
    remarks: 'Ready for billing',
    slaBreached: false
  }
];

// Section 3: Bills Generated - Payment Pending
export const MOCK_BILLS_GENERATED = [
  {
    id: 'BILL-001',
    billNumber: 'BILL-202501-0001',
    callNumber: 'CALL-2025-020',
    vendor: { id: 'V001', name: 'ABC Steel Industries' },
    poNumber: 'PO-2024-1020',
    productType: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.FINAL,
    billDate: '2025-01-10T10:00:00',
    billAmount: 185000,
    gstAmount: 33300,
    totalAmount: 218300,
    billStatus: BILL_STATUS.PAYMENT_PENDING,
    generatedBy: 'Finance - Suresh Menon',
    dueDate: '2025-01-24T23:59:59',
    remarks: 'Bill sent to vendor',
    documents: ['bill_202501_0001.pdf'],
    slaBreached: false
  },
  {
    id: 'BILL-002',
    billNumber: 'BILL-202501-0002',
    callNumber: 'CALL-2025-021',
    vendor: { id: 'V002', name: 'XYZ Manufacturing Ltd' },
    poNumber: 'PO-2024-1021',
    productType: PRODUCT_TYPES.SLEEPER,
    stage: INSPECTION_STAGES.PROCESS,
    billDate: '2025-01-08T14:30:00',
    billAmount: 125000,
    gstAmount: 22500,
    totalAmount: 147500,
    billStatus: BILL_STATUS.PAYMENT_PENDING,
    generatedBy: 'Finance - Suresh Menon',
    dueDate: '2025-01-22T23:59:59',
    remarks: 'Awaiting payment',
    documents: ['bill_202501_0002.pdf'],
    slaBreached: true
  },
  {
    id: 'BILL-003',
    billNumber: 'BILL-202501-0003',
    callNumber: 'CALL-2025-022',
    vendor: { id: 'V004', name: 'LMN Fabricators Pvt Ltd' },
    poNumber: 'PO-2024-1022',
    productType: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.RAW_MATERIAL,
    billDate: '2025-01-12T09:15:00',
    billAmount: 95000,
    gstAmount: 17100,
    totalAmount: 112100,
    billStatus: BILL_STATUS.PAYMENT_RECORDED,
    generatedBy: 'Finance - Suresh Menon',
    dueDate: '2025-01-26T23:59:59',
    paymentDate: '2025-01-23T15:30:00',
    paymentReference: 'UTR-2025012300123',
    paymentMode: 'NEFT',
    recordedBy: 'Finance - Suresh Menon',
    remarks: 'Payment received and recorded',
    documents: ['bill_202501_0003.pdf', 'payment_proof.pdf'],
    slaBreached: false
  }
];

// Section 4: Bills Cleared
export const MOCK_BILLS_CLEARED = [
  {
    id: 'BILL-CLR-001',
    billNumber: 'BILL-202412-0045',
    callNumber: 'CALL-2024-150',
    vendor: { id: 'V001', name: 'ABC Steel Industries' },
    poNumber: 'PO-2024-0950',
    productType: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.FINAL,
    billDate: '2024-12-15T10:00:00',
    billAmount: 150000,
    gstAmount: 27000,
    totalAmount: 177000,
    billStatus: BILL_STATUS.BILL_CLEARED,
    paymentDate: '2024-12-28T14:30:00',
    paymentReference: 'UTR-2024122800456',
    paymentMode: 'RTGS',
    clearedDate: '2024-12-29T10:00:00',
    clearedBy: 'Finance - Suresh Menon',
    remarks: 'Payment cleared successfully',
    documents: ['bill_202412_0045.pdf', 'payment_proof.pdf']
  },
  {
    id: 'BILL-CLR-002',
    billNumber: 'BILL-202412-0046',
    callNumber: 'CALL-2024-151',
    vendor: { id: 'V003', name: 'PQR Engineering Works' },
    poNumber: 'PO-2024-0951',
    productType: PRODUCT_TYPES.GRSP,
    stage: INSPECTION_STAGES.PROCESS,
    billDate: '2024-12-18T11:30:00',
    billAmount: 120000,
    gstAmount: 21600,
    totalAmount: 141600,
    billStatus: BILL_STATUS.BILL_CLEARED,
    paymentDate: '2025-01-05T16:00:00',
    paymentReference: 'UTR-2025010500789',
    paymentMode: 'NEFT',
    clearedDate: '2025-01-06T09:30:00',
    clearedBy: 'Finance - Suresh Menon',
    remarks: 'Payment cleared',
    documents: ['bill_202412_0046.pdf', 'payment_proof.pdf']
  }
];

// Section 5: Historical Financial Records & Audit Trail
export const MOCK_AUDIT_TRAIL = [
  {
    id: 'AUD-FIN-001',
    callNumber: 'CALL-2025-001',
    billNumber: 'BILL-202501-0001',
    action: 'Payment Approved',
    performedBy: 'Finance - Suresh Menon',
    timestamp: '2025-01-21T10:30:00',
    remarks: 'Payment approved after verification',
    amount: 125000,
    previousStatus: PAYMENT_STATUS.PENDING_FINANCE_APPROVAL,
    newStatus: PAYMENT_STATUS.APPROVED
  },
  {
    id: 'AUD-FIN-002',
    callNumber: 'CALL-2025-002',
    action: 'Payment Returned',
    performedBy: 'Finance - Suresh Menon',
    timestamp: '2025-01-19T16:00:00',
    remarks: 'Incorrect documentation - invoice amount mismatch',
    amount: 85000,
    previousStatus: PAYMENT_STATUS.PENDING_FINANCE_APPROVAL,
    newStatus: PAYMENT_STATUS.RETURNED
  },
  {
    id: 'AUD-FIN-003',
    callNumber: 'CALL-2025-010',
    billNumber: 'BILL-202501-0010',
    action: 'Bill Generated',
    performedBy: 'Finance - Suresh Menon',
    timestamp: '2025-01-16T14:00:00',
    remarks: 'Bill generated for IC-2025-001',
    amount: 160000,
    previousStatus: BILL_STATUS.BILLING_PENDING,
    newStatus: BILL_STATUS.BILL_GENERATED
  },
  {
    id: 'AUD-FIN-004',
    callNumber: 'CALL-2025-020',
    billNumber: 'BILL-202501-0001',
    action: 'Payment Recorded',
    performedBy: 'Finance - Suresh Menon',
    timestamp: '2025-01-23T15:30:00',
    remarks: 'Payment received via NEFT - UTR-2025012300123',
    amount: 218300,
    previousStatus: BILL_STATUS.PAYMENT_PENDING,
    newStatus: BILL_STATUS.PAYMENT_RECORDED
  },
  {
    id: 'AUD-FIN-005',
    callNumber: 'CALL-2024-150',
    billNumber: 'BILL-202412-0045',
    action: 'Bill Cleared',
    performedBy: 'Finance - Suresh Menon',
    timestamp: '2024-12-29T10:00:00',
    remarks: 'Payment cleared and reconciled',
    amount: 177000,
    previousStatus: BILL_STATUS.PAYMENT_RECORDED,
    newStatus: BILL_STATUS.BILL_CLEARED
  }
];

