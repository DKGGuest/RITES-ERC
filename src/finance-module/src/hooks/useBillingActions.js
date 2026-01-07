/**
 * useBillingActions Hook
 * Hook for billing generation and payment recording actions
 */

import { useState } from 'react';
import { BILL_STATUS } from '../utils/constants';
import { generateBillNumber } from '../utils/helpers';

/**
 * Custom hook for billing actions
 */
export const useBillingActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generate bill for inspection call
   */
  const generateBill = async (inspectionCall, billData) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const billNumber = generateBillNumber();
      const gstAmount = billData.billAmount * 0.18; // 18% GST
      const totalAmount = billData.billAmount + gstAmount;

      // In production, this would call the backend API
      // const response = await fetch('/api/finance/generate-bill', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...billData, billNumber })
      // });

      console.log('Bill generated:', {
        billNumber,
        callNumber: inspectionCall.callNumber,
        billAmount: billData.billAmount,
        gstAmount,
        totalAmount,
        generatedBy: 'Finance - Suresh Menon',
        generatedAt: new Date().toISOString()
      });

      setLoading(false);
      return {
        success: true,
        message: `Bill ${billNumber} generated successfully`,
        data: {
          billNumber,
          callNumber: inspectionCall.callNumber,
          vendor: inspectionCall.vendor,
          poNumber: inspectionCall.poNumber,
          billDate: new Date().toISOString(),
          billAmount: billData.billAmount,
          gstAmount,
          totalAmount,
          billStatus: BILL_STATUS.BILL_GENERATED,
          generatedBy: 'Finance - Suresh Menon',
          generatedAt: new Date().toISOString()
        }
      };
    } catch (err) {
      setError(err.message || 'Failed to generate bill');
      setLoading(false);
      return {
        success: false,
        message: err.message || 'Failed to generate bill'
      };
    }
  };

  /**
   * Record payment for a bill
   */
  const recordPayment = async (bill, paymentData) => {
    try {
      setLoading(true);
      setError(null);

      if (!paymentData.paymentReference || !paymentData.paymentDate) {
        throw new Error('Payment reference and date are required');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // In production, this would call the backend API
      // const response = await fetch('/api/finance/record-payment', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ billId: bill.id, ...paymentData })
      // });

      console.log('Payment recorded:', {
        billNumber: bill.billNumber,
        paymentReference: paymentData.paymentReference,
        paymentDate: paymentData.paymentDate,
        paymentMode: paymentData.paymentMode,
        recordedBy: 'Finance - Suresh Menon',
        recordedAt: new Date().toISOString()
      });

      setLoading(false);
      return {
        success: true,
        message: 'Payment recorded successfully',
        data: {
          ...bill,
          billStatus: BILL_STATUS.PAYMENT_RECORDED,
          paymentDate: paymentData.paymentDate,
          paymentReference: paymentData.paymentReference,
          paymentMode: paymentData.paymentMode,
          recordedBy: 'Finance - Suresh Menon',
          recordedAt: new Date().toISOString()
        }
      };
    } catch (err) {
      setError(err.message || 'Failed to record payment');
      setLoading(false);
      return {
        success: false,
        message: err.message || 'Failed to record payment'
      };
    }
  };

  /**
   * Mark bill as cleared
   */
  const clearBill = async (bill) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));

      // In production, this would call the backend API
      // const response = await fetch('/api/finance/clear-bill', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ billId: bill.id })
      // });

      console.log('Bill cleared:', {
        billNumber: bill.billNumber,
        clearedBy: 'Finance - Suresh Menon',
        clearedAt: new Date().toISOString()
      });

      setLoading(false);
      return {
        success: true,
        message: 'Bill cleared successfully',
        data: {
          ...bill,
          billStatus: BILL_STATUS.BILL_CLEARED,
          clearedBy: 'Finance - Suresh Menon',
          clearedAt: new Date().toISOString()
        }
      };
    } catch (err) {
      setError(err.message || 'Failed to clear bill');
      setLoading(false);
      return {
        success: false,
        message: err.message || 'Failed to clear bill'
      };
    }
  };

  return {
    generateBill,
    recordPayment,
    clearBill,
    loading,
    error
  };
};

export default useBillingActions;

