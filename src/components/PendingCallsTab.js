import React, { useState, useMemo } from 'react';
import DataTable from './DataTable';
import StatusBadge from './StatusBadge';
import { getProductTypeDisplayName, formatDate } from '../utils/helpers';

const PendingCallsTab = ({ calls, onReturn, onSchedule, onStart, onBulkReturn, onBulkSchedule, onBulkStart }) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Call Number');
  const [filters, setFilters] = useState({
    productTypes: [],
    vendors: [],
    dateFrom: '',
    dateTo: '',
    poNumber: '',
    statuses: [],
    stage: '',
    callNumber: ''
  });

  const pendingCalls = calls.filter(c => c.status === 'Pending');

  // Extract unique values for filter dropdowns
  const uniqueProductTypes = [...new Set(pendingCalls.map(c => c.product_type))];
  const uniqueVendors = [...new Set(pendingCalls.map(c => c.vendor_name))].sort();
  const uniquePONumbers = [...new Set(pendingCalls.map(c => c.po_no))].sort();

  // Apply filters to data
  const filteredCalls = useMemo(() => {
    let result = [...pendingCalls];

    // Product Type filter
    if (filters.productTypes.length > 0) {
      result = result.filter(call => filters.productTypes.includes(call.product_type));
    }

    // Vendor filter
    if (filters.vendors.length > 0) {
      result = result.filter(call => filters.vendors.includes(call.vendor_name));
    }

    // Date range filter
    if (filters.dateFrom) {
      result = result.filter(call => new Date(call.requested_date) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      result = result.filter(call => new Date(call.requested_date) <= new Date(filters.dateTo));
    }

    // PO Number filter
    if (filters.poNumber) {
      result = result.filter(call => call.po_no.toLowerCase().includes(filters.poNumber.toLowerCase()));
    }

    // Stage filter
    if (filters.stage) {
      result = result.filter(call => call.stage === filters.stage);
    }

    // Call Number filter
    if (filters.callNumber) {
      result = result.filter(call => call.call_no.toLowerCase().includes(filters.callNumber.toLowerCase()));
    }

    return result;
  }, [pendingCalls, filters]);

  // (removed unused `uniqueStages` and `activeFilterCount` to satisfy CI lint rules)

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleMultiSelectToggle = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      productTypes: [],
      vendors: [],
      dateFrom: '',
      dateTo: '',
      poNumber: '',
      statuses: [],
      stage: '',
      callNumber: ''
    });
  };

  // removeFilter helper removed (unused in current UI)

  const columns = [
    { key: 'call_no', label: 'Call No.' },
    { key: 'po_no', label: 'PO No.' },
    { key: 'vendor_name', label: 'Vendor Name' },
    { key: 'product_type', label: 'Product Type', render: (val) => getProductTypeDisplayName(val) },
    { key: 'requested_date', label: 'Requested Date', render: (val) => formatDate(val) },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
  ];

  const selectedCallsData = filteredCalls.filter(call => selectedRows.includes(call.id));

  // Show individual actions only when exactly one row is selected
  const actions = selectedRows.length === 1 ? (row) => (
    selectedRows.includes(row.id) ? (
      <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
        <button className="btn btn-sm btn-outline" onClick={() => onReturn(row)}>RETURN</button>
        <button className="btn btn-sm btn-secondary" onClick={() => onSchedule(row)}>SCHEDULE</button>
        <button className="btn btn-sm btn-primary" onClick={() => onStart(row)}>START</button>
      </div>
    ) : null
  ) : null;

  const handleBulkReturn = () => {
    onBulkReturn(selectedCallsData);
    setSelectedRows([]);
  };

  const handleBulkSchedule = () => {
    onBulkSchedule(selectedCallsData);
    setSelectedRows([]);
  };

  const handleBulkStart = () => {
    onBulkStart(selectedCallsData);
    setSelectedRows([]);
  };

 /* ------------------ FILTER DRAWER (REPLACE COMMENTED BLOCK) ------------------ */
/*
  This block is designed to live inside the same component scope where:
   - filters (object) and setFilters (setter) exist OR
   - handleFilterChange(key, value) is available
   - handleMultiSelectToggle(field, value) is available
   - clearAllFilters() is available
   - removeFilter(field, value) may be used by the UI
   - uniqueProductTypes, uniqueVendors, uniqueStages, pendingCalls (array) are available
  If any names differ in your file, either rename them here or keep using setFilters().
*/

// canonical stage labels for UI (user-visible)
const CANONICAL_STAGES = ['RAW MATERIAL', 'PROCESS MATERIAL', 'FINAL'];

// mapping to internal value: all map to 'ERC' as requested
const stageMapping = {
  'RAW MATERIAL': 'ERC',
  'PROCESS MATERIAL': 'ERC',
  'FINAL': 'ERC'
};

// Make sure pendingCalls exists in this scope (it does in your app). If not, provide it.
const effectivePendingCalls = (typeof pendingCalls !== 'undefined' && Array.isArray(pendingCalls))
  ? pendingCalls
  : (typeof window.pendingCalls !== 'undefined' ? window.pendingCalls : []);

// helpers removed: findCallByCallNo / findCallByPONo (unused in current UI)

// prefer to call your handler handleFilterChange if present; otherwise update filters state directly
const safeSetFilter = (key, value) => {
  if (typeof handleFilterChange === 'function') {
    handleFilterChange(key, value);
  } else if (typeof setFilters === 'function') {
    setFilters(prev => ({ ...prev, [key]: value }));
  } else {
    // fallback: create local state (very unlikely for your app)
    console.warn('No handleFilterChange or setFilters available in this scope.');
  }
};

// auto-sync helpers removed (unused) to satisfy lint rules

// helper to toggle product type checkboxes (works with your handler if present)
const safeToggleMulti = (field, value) => {
  if (typeof handleMultiSelectToggle === 'function') {
    handleMultiSelectToggle(field, value);
  } else if (typeof setFilters === 'function') {
    setFilters(prev => {
      const arr = Array.isArray(prev[field]) ? prev[field] : [];
      const exists = arr.includes(value);
      return { ...prev, [field]: exists ? arr.filter(x => x !== value) : [...arr, value] };
    });
  }
};

// derived counts for right-side lists (example uses unique lists if present)
const productTypesList = (typeof uniqueProductTypes !== 'undefined') ? uniqueProductTypes : (effectivePendingCalls.map(c => c.product_type).filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i));
const vendorsList = (typeof uniqueVendors !== 'undefined') ? uniqueVendors : (effectivePendingCalls.map(c => c.vendor).filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i));
const poSuggestions = (typeof uniquePONumbers !== 'undefined') ? uniquePONumbers : effectivePendingCalls.map(c => c.po_no || c.poNumber).filter(Boolean);

// UI: Drawer toggle + Drawer panel
return (
  <div>
    <div style={{ marginBottom: 'var(--space-16)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-12)' }}>
        <button
          className="btn btn-outline"
          onClick={() => setShowFilters(!showFilters)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-8)' }}
        >
          <span style={{ transform: showFilters ? 'rotate(180deg)' : 'none' }}>▾</span>
          <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
        </button>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Showing {typeof filteredCalls !== 'undefined' ? filteredCalls.length : effectivePendingCalls.length} of {effectivePendingCalls.length} results
        </div>
      </div>
    </div>

    {showFilters && (
      <>
        {/* Backdrop overlay */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setShowFilters(false)}
        />

        {/* Filter Modal */}
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '85vh',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937'
            }}>Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '0',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >×</button>
          </div>

          {/* Search Bar */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                fontSize: '18px'
              }}>🔍</span>
              <input
                type="search"
                placeholder="Search across filters..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          {/* Content Area */}
          <div style={{
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
            minHeight: 0
          }}>
            {/* LEFT: Filter Categories */}
            <div style={{
              width: '140px',
              borderRight: '1px solid #e5e7eb',
              overflowY: 'auto',
              backgroundColor: '#f9fafb'
            }}>
              {['Product Type', 'Vendor', 'Stage', 'Call Number', 'PO Number', 'Date Range'].map(cat => (
                <div
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: selectedCategory === cat ? '600' : '400',
                    color: selectedCategory === cat ? '#16a34a' : '#4b5563',
                    backgroundColor: selectedCategory === cat ? '#f0fdf4' : 'transparent',
                    borderLeft: selectedCategory === cat ? '3px solid #16a34a' : '3px solid transparent',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== cat) {
                      e.target.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== cat) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {cat}
                </div>
              ))}
            </div>

            {/* RIGHT: Options Panel */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 24px'
            }}>
              {/* PRODUCT TYPE */}
              {selectedCategory === 'Product Type' && (
                <div>
                  {(() => {
                    const filteredTypes = productTypesList.filter(type => {
                      if (!filterSearch) return true;
                      const displayName = type.startsWith('ERC') ? type : `ERC-${type}`;
                      return displayName.toLowerCase().includes(filterSearch.toLowerCase());
                    });

                    if (filteredTypes.length === 0) {
                      return (
                        <div style={{
                          padding: '40px 20px',
                          textAlign: 'center',
                          color: '#9ca3af',
                          fontSize: '14px'
                        }}>
                          No results found for "{filterSearch}"
                        </div>
                      );
                    }

                    return filteredTypes.map(type => {
                      const checked = (filters.productTypes || []).includes(type);
                      const displayName = type.startsWith('ERC') ? type : `ERC-${type}`;
                      return (
                        <label
                          key={type}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 0',
                            borderBottom: '1px solid #f3f4f6',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{
                            width: '40px',
                            height: '40px',
                            marginRight: '12px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px'
                          }}>📦</div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#1f2937'
                            }}>{displayName}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => safeToggleMulti('productTypes', type)}
                            style={{
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              accentColor: '#16a34a'
                            }}
                          />
                        </label>
                      );
                    });
                  })()}
                </div>
              )}

              {/* VENDOR */}
              {selectedCategory === 'Vendor' && (
                <div>
                  {vendorsList
                    .filter(vendor => {
                      if (!filterSearch) return true;
                      return vendor.toLowerCase().includes(filterSearch.toLowerCase());
                    })
                    .map(vendor => {
                      const checked = (filters.vendors || []).includes(vendor);
                      return (
                        <label
                          key={vendor}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 0',
                            borderBottom: '1px solid #f3f4f6',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{
                            width: '40px',
                            height: '40px',
                            marginRight: '12px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px'
                          }}>🏢</div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#1f2937'
                            }}>{vendor}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => safeToggleMulti('vendors', vendor)}
                            style={{
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              accentColor: '#16a34a'
                            }}
                          />
                        </label>
                      );
                    })}
                </div>
              )}

              {/* STAGE */}
              {selectedCategory === 'Stage' && (
                <div>
                  {CANONICAL_STAGES
                    .filter(stage => {
                      if (!filterSearch) return true;
                      return stage.toLowerCase().includes(filterSearch.toLowerCase());
                    })
                    .map(stage => {
                      const stageValue = stageMapping[stage];
                      const checked = filters.stage === stageValue;
                      return (
                        <label
                          key={stage}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 0',
                            borderBottom: '1px solid #f3f4f6',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{
                            width: '40px',
                            height: '40px',
                            marginRight: '12px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px'
                          }}>⚙️</div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#1f2937'
                            }}>{stage}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => safeSetFilter('stage', checked ? '' : stageValue)}
                            style={{
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              accentColor: '#16a34a'
                            }}
                          />
                        </label>
                      );
                    })}
                </div>
              )}

              {/* CALL NUMBER */}
              {selectedCategory === 'Call Number' && (
                <div>
                  {[...new Set(effectivePendingCalls.map(c => c.call_no).filter(Boolean))].sort()
                    .filter(callNo => {
                      if (!filterSearch) return true;
                      return callNo.toLowerCase().includes(filterSearch.toLowerCase());
                    })
                    .map(callNo => {
                      const checked = filters.callNumber === callNo;
                      return (
                        <label
                          key={callNo}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 0',
                            borderBottom: '1px solid #f3f4f6',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{
                            width: '40px',
                            height: '40px',
                            marginRight: '12px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px'
                          }}>📞</div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#1f2937'
                            }}>{callNo}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => safeSetFilter('callNumber', checked ? '' : callNo)}
                            style={{
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              accentColor: '#16a34a'
                            }}
                          />
                        </label>
                      );
                    })}
                </div>
              )}

              {/* PO NUMBER */}
              {selectedCategory === 'PO Number' && (
                <div>
                  {poSuggestions
                    .filter(poNo => {
                      if (!filterSearch) return true;
                      return poNo.toLowerCase().includes(filterSearch.toLowerCase());
                    })
                    .map(poNo => {
                      const checked = filters.poNumber === poNo;
                      return (
                        <label
                          key={poNo}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 0',
                            borderBottom: '1px solid #f3f4f6',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{
                            width: '40px',
                            height: '40px',
                            marginRight: '12px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px'
                          }}>📄</div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#1f2937'
                            }}>{poNo}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => safeSetFilter('poNumber', checked ? '' : poNo)}
                            style={{
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              accentColor: '#16a34a'
                            }}
                          />
                        </label>
                      );
                    })}
                </div>
              )}

              {/* DATE RANGE */}
              {selectedCategory === 'Date Range' && (
                <div style={{ padding: '8px 0' }}>
                  {/* From Date */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '13px',
                      color: '#6b7280',
                      marginBottom: '8px',
                      fontWeight: '500'
                    }}>
                      <span style={{
                        fontSize: '18px',
                        marginRight: '8px'
                      }}>📅</span>
                      From Date
                    </label>
                    <input
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={(e) => safeSetFilter('dateFrom', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  {/* To Date */}
                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '13px',
                      color: '#6b7280',
                      marginBottom: '8px',
                      fontWeight: '500'
                    }}>
                      <span style={{
                        fontSize: '18px',
                        marginRight: '8px'
                      }}>📅</span>
                      To Date
                    </label>
                    <input
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={(e) => safeSetFilter('dateTo', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer with Action Buttons */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '12px'
          }}>
            <button
              onClick={() => {
                if (typeof clearAllFilters === 'function') clearAllFilters();
                else {
                  setFilters({
                    callNumber:'',
                    poNumber:'',
                    stage:'',
                    dateFrom:'',
                    dateTo:'',
                    productTypes:[],
                    vendors:[]
                  });
                }
              }}
              style={{
                flex: 1,
                padding: '12px 24px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#6b7280',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.borderColor = '#e5e7eb';
              }}
            >
              Clear Filter
            </button>
            <button
              onClick={() => {
                setShowFilters(false);
              }}
              style={{
                flex: 1,
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'white',
                backgroundColor: '#16a34a',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#16a34a'}
            >
              Apply
            </button>
          </div>
        </div>
      </>
    )}



      {/* Bulk Action Bar */}
      {selectedRows.length > 1 && (
        <div style={{
          marginBottom: 'var(--space-16)',
          padding: 'var(--space-16)',
          background: 'var(--color-bg-1)',
          borderRadius: 'var(--radius-base)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
            {selectedRows.length} inspection calls selected
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-12)' }}>
            <button className="btn btn-outline" onClick={handleBulkReturn}>
              RETURN FOR ALL
            </button>
            <button className="btn btn-secondary" onClick={handleBulkSchedule}>
              SCHEDULE FOR ALL
            </button>
            <button className="btn btn-primary" onClick={handleBulkStart}>
              START FOR ALL
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredCalls}
        actions={actions}
        selectable={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
      />
    </div>
  );
};

export default PendingCallsTab;
