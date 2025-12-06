import axios from 'axios';

// Use environment variable for API URL in production, fallback to localhost for dev
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/analyze/';

export const analyzeQuery = async (query) => {
    try {
        const response = await axios.post(BASE_URL, { query });
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export default { analyzeQuery };
