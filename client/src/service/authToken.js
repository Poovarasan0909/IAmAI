
export let authToken = 'null';

export const setAuthToken = (newToken) => {
    authToken = newToken;
}

export const getAuthToken = () => {
    return authToken;
}