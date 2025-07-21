import api from './api';

export const uploadCourtImages = async (files, token) => {
    console.log("Files to upload:", files);
    const formData = new FormData();
    files.forEach(file => {
        if (file) formData.append("images", file);
        });
    
        const response = await api.post("/courts/upload-images", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
}});
    console.log("Response From Upload Court Images:", response);
    return response.data.imageUrls;
};

export const createCourt = async (courtData, token) => {
    console.log("Court Data:", courtData);
    const response = await api.post("/courts/create", courtData, {
        headers: { Authorization: `Bearer ${token}` },
})
return response.data;
};

export const getCourtsForBooking = async (courtId) => { 
    const response = await api.get(`/common/courtsForBooking/${courtId}`);
    return response.data;
};

// Get courts by arena
export const getCourtsByArena = async (arenaId, token) => {
    try {
        const response = await api.get(`/courts/arenas/${arenaId}/courts`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching courts by arena:", error);
        throw error;
    }
};

// Update court name
export const updateCourtName = async (courtId, name, token) => {
    try {
        const response = await api.put(`/courts/${courtId}`, 
            { name }, 
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating court name:", error);
        throw error;
    }
};

// Delete court
export const deleteCourt = async (courtId, token) => {
    try {
        const response = await api.delete(`/courts/${courtId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting court:", error);
        throw error;
    }
};