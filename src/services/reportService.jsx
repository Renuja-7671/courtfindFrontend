import api from "./api";

export const downloadArenaRevenueReport = async (token) => {
  const response = await api.get('/report/arena-revenue', {
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};