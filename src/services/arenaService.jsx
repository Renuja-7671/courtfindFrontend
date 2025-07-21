import api from './api';

export const getAllArenas = async () => {
    const response = await api.get("/arena/");
    return response.data;
};

export const searchArenas = async (filters) => {
    //console.log("Filters in service:", filters); // Debugging line
    const response = await api.get("/arena/search", { params: filters });
    return response.data;
};

export const addArena = async (arenaData, token) => {
    const response = await api.post("/arena/", arenaData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
};

export const uploadArenaImage = async (file, token) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post("/arena/upload", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const getAllSports = async (token) => {
    try{
      const response = await api.get("/arena/sports", {
          headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching sports:", error);
      throw error;
    }
  };

  export const getArenaByRating = async () => {
    try {
        const response = await api.get("/common/arenasByRating"); 
        return response.data;
    } catch (error) {
        console.error("Error fetching arenas by rating:", error);
        throw error; 
    }
};

export const getSportForHome = async () => {
    try {
        const response = await api.get("/common/sport");
        return response.data;
    } catch (error) {
        console.error("Error fetching sports for home:", error);
        throw error; 
    }
};

export const searchArenasForHome = async (sport, venue) => {
    try {
        const response = await api.get("/common/searchArenas", {
            params: { sport, venue },
        });
        return response.data;
    } catch (error) {
        console.error("Error searching arenas for home:", error);
        throw error; 
    }
};

//for manage arena
// Get arenas by owner
export const getArenasByOwner = async (token) => {
    try {
        const response = await api.get("/arena/owner", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching arenas by owner:", error);
        throw error;
    }
};

// Update arena name
export const updateArenaName = async (arenaId, name, token) => {
    try {
        const response = await api.put(`/arena/${arenaId}`, 
            { name }, 
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating arena name:", error);
        throw error;
    }
};

// Delete arena
export const deleteArena = async (arenaId, token) => {
    try {
        const response = await api.delete(`/arena/${arenaId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting arena:", error);
        throw error;
    }
};




