import api from "./api";

// Profile Insights

// Get last profile update date & login count
export const getOwnerActivitySummary = async (token) => {
    const response = await api.get("/owner/activity-summary", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Get login times grouped by hour (for peak login chart)
export const getOwnerLoginTimes = async (token) => {
    const response = await api.get("/owner/login-times", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Set login count by inserting one new record
export const setOwnerLoginCount = async (token) => {
    const response = await api.post("/owner/add-login-record", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
};