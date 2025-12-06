import axios from 'axios';

// Use environment variable for API URL in production, fallback to localhost for dev
let BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/analyze/';

// Auto-correct the URL if the user only provided the domain (e.g. from Render dashboard)
if (BASE_URL && !BASE_URL.includes('/api/analyze/')) {
    BASE_URL = BASE_URL.replace(/\/$/, '') + '/api/analyze/';
}

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
