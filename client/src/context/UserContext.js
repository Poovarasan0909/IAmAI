import React, {createContext, useEffect, useState} from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [state, setState] = useState({
        user: null
    })

    useEffect(() => {
        const userData = JSON.parse(sessionStorage.getItem('user'));
        if (userData) {
             setState({...state, user: userData});
             console.log("state created.....")
        }
    }, []);

    useEffect(() => {
        console.log("state updated .....", state)
    },[state.user])
    return (
        <UserContext.Provider value={{state, setState}}>
            {children}
        </UserContext.Provider>
    );
}