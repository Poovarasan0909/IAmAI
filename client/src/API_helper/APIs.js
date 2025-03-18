import axios from "axios";
import packageJson from '../../package.json';
import {getAuthToken} from "../service/authToken";

const baseURL = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? 'http://192.168.29.57:4000' :  packageJson.baseURL;

const API = axios.create({
    baseURL: baseURL,
    withCredentials: true,
    headers: {
        'Authorization': getAuthToken(),
    },
});

export const postRequest = async (url, data, header = {}) => {
    const path = url.replace(/^\//, '');
    try {
        return await API.post(`/${path}`, data, {
            headers : {
                'Authorization' : getAuthToken(),
                ...header
            }
        });
    } catch (error) {
        console.error("Error during post request:", error.message);
        throw new Error(error.response?.data?.message);
    }
}

export const getRequest = async (url, header = {}) => {
    const path = url.replace(/^\//, '');
    try {
        return await API.get(`/${path}`, {
            headers: {
                'Authorization': getAuthToken(),
                ...header
            }
        });
    } catch (error) {
        console.error('Error during getRequest:', error.message);
        throw new Error(error.response?.data?.message);
    }
}

export const deleteRequest = async (url, header = {}) => {
    const path = url.replace(/^\//, '');
    try {
        return await API.delete(`/${path}`, {
            headers: {
                'Authorization': getAuthToken(),
                ...header
            }
        });
    } catch (error) {
        console.error('Error during deleteRequest:', error.message);
        throw new Error(error.response?.data?.message);
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