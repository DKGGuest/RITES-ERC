import React from 'react';
import DataTable from './DataTable';
import StatusBadge from './StatusBadge';
import { getProductTypeDisplayName, formatDate } from '../utils/helpers';

const CompletedCallsTab = ({ calls }) => {
  const completedCalls = calls.filter(c => c.status === 'Completed');

  const columns = [
    { key: 'call_no', label: 'Call No.' },
    { key: 'po_no', label: 'PO No.' },
    { key: 'vendor_name', label: 'Vendor Name' },
    { key: 'product_type', label: 'Product Type', render: (val) => getProductTypeDisplayName(val) },
    { key: 'requested_date', label: 'Date', render: (val) => formatDate(val) },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
  ];

  return <DataTable columns={columns} data={completedCalls} />;
};

export default CompletedCallsTab;
