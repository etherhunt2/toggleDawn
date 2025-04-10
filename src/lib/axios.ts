import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'development'
    ? process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_PRODUCTION_API_URL;

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
