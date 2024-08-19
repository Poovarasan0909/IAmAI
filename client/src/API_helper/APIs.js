import React from 'react';
import axios from "axios";
import packageJson from '../../package.json';

const baseURL = packageJson.baseURL;

export const postRequest = (url,data) => {
    const path = url.replace(/^\//, '');
    console.log(`${baseURL}/${path}`, data)
   return axios.post(`${baseURL}/${path}`, data);
}

export const getRequest = (url) => {
    const path = url.replace(/^\//, '');
    return axios.get(`${baseURL}/${path}`);
}