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

import { REACT_APP_API_BASE_URL } from '../config';

const API_URL = REACT_APP_API_BASE_URL;

export const generateArenaInvoice = async (arenaId, price) => {
  try {
    console.log('Calling generateArenaInvoice API:', { arenaId, price });
    
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${API_URL}/api/owner/generate-arena-invoice/${arenaId}?price=${price}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Failed to generate invoice: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Invoice generation response:', data);

    if (!data.success) {
      throw new Error(data.message || 'Failed to generate invoice');
    }

    return data.invoiceUrl;
  } catch (error) {
    console.error('Error in generateArenaInvoice:', error);
    throw error;
  }
};

export const updatePaymentsTableForArenaAdd = async (arenaId, total, token) => {
  try {
    console.log('Updating payments table:', { arenaId, total });
    
    const response = await fetch(`${API_URL}/api/owner/update-payments-table`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        arenaId: parseInt(arenaId),
        total: parseFloat(total),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Payment update error:', errorText);
      throw new Error(`Failed to update payment: ${response.status}`);
    }

    const data = await response.json();
    console.log('Payment update response:', data);
    return data;
  } catch (error) {
    console.error('Error updating payment status:', error);
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



