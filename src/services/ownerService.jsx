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


export const downloadInvoice = async (filename) => {
  const response = await api.get(`/player/download-invoice/${filename}`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  return url;
};

// Fix your generateArenaInvoice function in ownerService.js

export const generateArenaInvoice = async (arenaId, price) => {
  try {
    console.log('Calling backend to generate invoice...');
    const res = await api.get(`/owner/generate-arena-invoice/${arenaId}`, {
      params: { price },
    });
    
    console.log('Backend response:', res.data);
    
    if (!res.data.invoiceUrl) {
      throw new Error('No invoice URL returned from server');
    }
    
    return res.data.invoiceUrl;
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw error;
  }
};

export const updatePaymentsTableForArenaAdd = async (arenaId, total, token) => {
    try {
        const response = await api.post(
            "/owner/update-payments-table-for-arena-add",
            { arenaId, total },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating payments table for arena add:", error);
        throw error;
    }
};

