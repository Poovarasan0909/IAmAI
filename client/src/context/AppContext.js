import React, {createContext, useEffect, useState} from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isServerActive, setIsServerActive] = useState(false);
    const [isServerMsgVisible, setIsServerMsgVisible] = useState(true);

    useEffect(() => {
        if(isServerActive) {
            setTimeout(() => {
                setIsServerMsgVisible(false);
            }, 2000);
        }
    }, [isServerActive]);

    return (
        <AppContext.Provider value={{isServerActive, setIsServerActive, isServerMsgVisible}}>
            {children}
        </AppContext.Provider>
    );
}