// src/services/payhereService.js
import api from './api';

// Create PayHere payment hash
export const createPayHereHash = async (paymentData) => {
  try {
    const response = await api.post('/payment/create-payhere-hash', paymentData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to create PayHere hash:", error);
    throw error;
  }
};

// Initialize PayHere payment (Manual implementation without npm package)
export const initiatePayHerePayment = (paymentConfig) => {
  return new Promise((resolve, reject) => {
    // Check if PayHere is loaded
    if (!window.payhere) {
      reject(new Error('PayHere SDK not loaded. Please refresh the page and try again.'));
      return;
    }

    // Configure PayHere callbacks
    window.payhere.onCompleted = function onCompleted(orderId) {
      console.log("Payment completed. OrderID:", orderId);
      resolve({ status: 'success', orderId });
    };

    window.payhere.onDismissed = function onDismissed() {
      console.log("Payment dismissed");
      reject(new Error('Payment was cancelled by user'));
    };

    window.payhere.onError = function onError(error) {
      console.log("PayHere Error:", error);
      reject(new Error(`Payment failed: ${error}`));
    };

    // Validate required fields
    const requiredFields = ['merchant_id', 'order_id', 'amount', 'currency', 'hash'];
    for (const field of requiredFields) {
      if (!paymentConfig[field]) {
        reject(new Error(`Missing required field: ${field}`));
        return;
      }
    }

    // Start payment
    try {
      console.log('Starting PayHere payment with config:', {
        ...paymentConfig,
      });
      window.payhere.startPayment(paymentConfig);
    } catch (error) {
      console.error('Error starting PayHere payment:', error);
      reject(new Error(`Failed to start payment: ${error.message}`));
    }
  });
};

// Verify PayHere payment
export const verifyPayHerePayment = async (orderId) => {
  try {
    const response = await api.get(`/payment/verify-payhere/${orderId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to verify PayHere payment:", error);
    throw error;
  }
};

// Check if PayHere SDK is loaded
export const isPayHereLoaded = () => {
  return typeof window !== 'undefined' && window.payhere;
};

// Get supported payment methods
export const getPaymentMethods = async () => {
  try {
    const response = await api.get('/payment/payment-methods');
    return response.data;
  } catch (error) {
    console.error("Failed to get payment methods:", error);
    throw error;
  }
};

//get arena details for payment
export const getArenaDetailsForPayment = async (arenaId) => {
  try {
    const response = await api.get(`/payment/arena-details/${arenaId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch arena details:", error);
    throw error;
  }
};

//update owner payments table
export const updateOwnerPaymentsTable = async (arenaId, ownerId, amount) => {
  try {
    const response = await api.post('/payment/update-owner-payments-table', {
      arenaId,
      ownerId,
      amount
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update owner payments table:", error);
    throw error; // Propagate the error to be handled by the caller
  }
};