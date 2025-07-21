import api from "./api";

// Fetch owner profile
export const getOwnerProfile = async (token) => {
    const response = await api.get("/owner/profile", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Update owner profile
export const updateOwnerProfile = async (token, profileData) => {
    const response = await api.put("/owner/profile", profileData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Upload profile image
export const uploadProfileImage = async (file, token) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post("/owner/profile/upload", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data.imageUrl;
};

// Get profile image
export const getProfileImage = async (token) => {
    const response = await api.get("/owner/profile/image", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Dashboard stats
export const getDashboardStats = async (token) => {
    const response = await api.get("/owner/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getIncomeOverview = async (token, year) => {
    const response = await api.get(`/owner/dashboard/income-overview/${year}`,{ 
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getTotalIncomeForYear = async (token, year) => {
    const response = await api.get(`/owner/dashboard/get-total-income-for-year/${year}`,{ 
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getRecentBookings = async (token) => {
    const response = await api.get("/owner/dashboard/recent-bookings", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getPaymentHistory = async (token) => {
    const response = await api.get("/owner/dashboard/payment-history", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Arena bookings
export const getBookings = async (token) => {
    const response = await api.get("/owner/arena-bookings", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const updateBookingStatus = async (token, bookingId, cancellationReason) => {
    const response = await api.put(`/owner/arena-bookings/${bookingId}`, { reason: cancellationReason }, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getArenasOfOwner = async (token) => {
    const response = await api.get("/owner/arena-bookings/allArenas", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getSelectedArenaBookings = async (token, arenaId) => {
    const response = await api.get(`/owner/arena-bookings/${arenaId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getCourtsByArenaId = async (token, arenaId) => {
    try {
        const response = await api.get(`/owner/arena-bookings/courts/${arenaId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
            } catch (error) {
                console.error('Error fetching courts by arena id:', error);
                throw error;
            }
};

export const getFilteredArenaBookings = async (token, filters) => {
    try {
        const { arenaId, courtName } = filters;
        //console.log("Filter parameters initially:", { arenaId, courtName });
        const queryParams = new URLSearchParams({
            arenaId: arenaId,
            ...(courtName !== "all" && courtName ? { courtName } : {}),
        });
        //console.log("Filter parameters:", queryParams.toString());

        const response = await api.get(`/owner/arena-bookings/filter/${arenaId}/${courtName}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching filtered bookings:", error);
        throw error;
    }
};

// My Profit
export const getTotalRevenueService = async (token) => {
    const response = await api.get("/owner/my-profit/total-revenue", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getCurrentMonthRevenueService = async (token) => {
    const response = await api.get("/owner/my-profit/current-month-revenue", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getYearlyChartDataService = async (token, year) => {
    const response = await api.get(`/owner/my-profit/yearly-chart?year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getMonthlyChartDataService = async (token, year, month) => {
    const response = await api.get(`/owner/my-profit/monthly-chart?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getAllTransactionsService = async (token) => {
    const response = await api.get("/owner/my-profit/transactions", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getPaymentHistoryService = async (token) => {
    const response = await api.get("/owner/my-profit/payment-history", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Courtwise Profit Page
export const getOwnerArenas = async () => {
    const response = await api.get("/owner/arenas", {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return response.data;
};

export const getArenaDetails = async (arenaId) => {
    const response = await api.get(`/owner/arenas/${arenaId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return response.data;
};

export const getArenaCourtYearlyData = async (arenaId, year) => {
    const response = await api.get(`/owner/arenas/${arenaId}/yearly-chart`, {
        params: { year },
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return response.data;
};

// Fetch top earning courts for last 3 months
export const fetchTopEarningCourtsLast3Months = async (token) => {
  const response = await api.get("/owner/top-courts", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Fetch player behavior (new/repeat) analysis
export const fetchPlayerBehaviorAnalysis = async (token) => {
  const response = await api.get("/owner/player-activity", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getArenaRevenueDistribution = async (token) => {
  const res = await api.get("/owner/arena-revenue-distribution", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};


export const fetchMostBookedCourts = async (token) => {
  const response = await api.get('/owner/dashboard/most-booked-courts', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};


