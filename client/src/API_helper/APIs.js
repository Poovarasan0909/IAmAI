import axios from "axios";
import packageJson from '../../package.json';
import {getAuthToken} from "../service/authToken";
import {ShowPopup} from "../service/customPopup";

const baseURL = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? 'http://10.48.111.40:4000' :  packageJson.baseURL;

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
        if(url !== 'isUserLoginExit'){
            errorHandler(error);
        }
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
        errorHandler(error)
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
        errorHandler(error)
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

const errorHandler = (error) => {
    let message = "Something went wrong! 🤯";
    let reloadButton = false;
    if(error.response) {
        switch (error.response.status) {
            case 401:
                message = 'Unauthorized Access! You shall not pass! 🧙‍♂️🚫';
                break;
            case 403:
                message = 'Hey! Your session expired. Please Reload the page. 🤷‍♂️';
                reloadButton = true
                break;
            case 404:
                message = "This page is missing! 🕵️‍♂️";
                break;
            case 500:
                message = "Oh no! The server had a meltdown! 🔥";
                break;
            default:
                message = `Unexpected error: ${error.response.status}. Even I don't know why! 🤷‍♂️`
                break;
        }
    } else if(error.request) {
        message = "Can't able to reach the server 🤯"
    } else {
        message = `Something wrong: ${error.message}. Aliens? 👽`;
    }
    ShowPopup({
        content: message,
        isReloadAction: reloadButton,
        isCloseAction: true,
        title: "Oops!",
    });
    console.error("Error details:", error);
}