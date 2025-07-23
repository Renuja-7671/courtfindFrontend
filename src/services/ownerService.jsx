import api from "./api";

export const getPendingArenasForOwner = async (token) => {
    try {
        const response = await api.get("/arena/pending-by-owner", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching pending arenas:", error);
        throw error;
    }
};


export const getPricingForNewArena = async (token) => {
    try {
        const response = await api.get("/arena/price-for-new-arena-by-owner", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching pricing for new arena:", error);
        throw error;
    }
};

export const getArenasForOwnerWithStatus = async (token) => {
    try {
        const response = await api.get("/arena/get-arenas-with-arenastatus", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching arenas with status for owner:", error);
        throw error;
    }
};

// Update your ownerService.js

// ownerService.js - Fixed version

import { REACT_APP_API_BASE_URL } from '../config';

const API_URL = REACT_APP_API_BASE_URL;

export const generateArenaInvoice = async (arenaId, price) => {
  try {
    console.log('=== FRONTEND: Calling generateArenaInvoice API ===');
    console.log('Arena ID:', arenaId);
    console.log('Price:', price);
    console.log('API URL:', API_URL);
    
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_URL}/api/owner/generate-arena-invoice/${arenaId}?price=${price}`;
    console.log('Request URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    if (!response.ok) {
      console.error('API Error Response:', responseText);
      throw new Error(`Failed to generate invoice: ${response.status} - ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error('Invalid response format from server');
    }

    console.log('Parsed response data:', data);

    if (!data.success) {
      throw new Error(data.message || 'Failed to generate invoice');
    }

    if (!data.invoiceUrl) {
      throw new Error('No invoice URL returned from server');
    }

    console.log('=== FRONTEND: Invoice generation successful ===');
    return data.invoiceUrl;

  } catch (error) {
    console.error('=== FRONTEND: Error in generateArenaInvoice ===');
    console.error('Error details:', error);
    throw error;
  }
};

export const updatePaymentsTableForArenaAdd = async (arenaId, total, token) => {
  try {
    console.log('=== FRONTEND: Updating payments table ===');
    console.log('Arena ID:', arenaId);
    console.log('Total:', total);
    console.log('API URL:', API_URL);
    
    if (!token) {
      throw new Error("No authentication token provided");
    }

    const url = `${API_URL}/api/owner/update-payments-table`;
    console.log('Request URL:', url);

    const requestBody = {
      arenaId: parseInt(arenaId),
      total: parseFloat(total),
    };
    console.log('Request body:', requestBody);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      console.error('Payment update error:', responseText);
      throw new Error(`Failed to update payment: ${response.status} - ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error('Invalid response format from server');
    }

    console.log('Payment update response:', data);
    console.log('=== FRONTEND: Payment update successful ===');
    return data;

  } catch (error) {
    console.error('=== FRONTEND: Error updating payment status ===');
    console.error('Error details:', error);
    throw error;
  }
};

export const downloadInvoice = async (filename) => {
  const response = await api.get(`/player/download-invoice/${filename}`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  return url;
};



