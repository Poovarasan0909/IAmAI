import React, {createContext, useEffect, useState} from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const themeFromLocalStore = localStorage.getItem("theme");
    const [isServerActive, setIsServerActive] = useState(false);
    const [isServerMsgVisible, setIsServerMsgVisible] = useState(true);
    const [themeMode, setThemeMode] = useState(themeFromLocalStore ? themeFromLocalStore : 'light');

    useEffect(() => {
        if(isServerActive) {
            setTimeout(() => {
                setIsServerMsgVisible(false);
            }, 3000);
        }
    }, [isServerActive]);

    return (
        <AppContext.Provider value={{isServerActive, setIsServerActive, isServerMsgVisible, themeMode, setThemeMode}}>
            {children}
        </AppContext.Provider>
    );
}