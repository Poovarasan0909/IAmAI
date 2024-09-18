import axios from "axios";
import packageJson from '../../package.json';

const baseURL = packageJson.baseURL;

export const postRequest = async (url,data) => {
    const path = url.replace(/^\//, '');
    try {
        return await axios.post(`${baseURL}/${path}`, data);
    } catch (error) {
        console.error("Error during post request:", error.message);
        return { error: error.message };
    }
}

export const getRequest = async (url) => {
    const path = url.replace(/^\//, '');
    try {
        return await axios.get(`${baseURL}/${path}`);
    } catch (error) {
        console.error('Error during getRequest:', error.message);
        return { error: error.message };
    }
}