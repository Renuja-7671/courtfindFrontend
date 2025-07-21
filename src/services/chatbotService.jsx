import api from "./api";

// Function to send user message to the chatbot API
export const sendMessageToChatbot = async (message) => {
    try {
        const response = await api.post("/common/chat", { message });
        return response.data;
    } catch (error) {
        console.error("Chatbot Service Error:", error.response?.data || error.message);
        throw error;
    }
};
