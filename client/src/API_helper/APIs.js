import axios from "axios";
import packageJson from '../../package.json';

const baseURL = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? 'http://192.168.29.57:4000' :  packageJson.baseURL;

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

export const deleteRequest = async (url) => {
    const path = url.replace(/^\//, '');
    try {
        return await axios.delete(`${baseURL}/${path}`);
    } catch (error) {
        console.error('Error during deleteRequest:', error.message);
        return { error: error.message };
    }
}

export const multipartPostRequest = async (url, formData) => {
    const path = url.replace(/^\//, '');
    try {
        return await axios.post(`${baseURL}/${path}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    } catch (error) {
        console.error('Error during multipartPostRequest: ', error.message);
        return { error: error.message}
    }
}