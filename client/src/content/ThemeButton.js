import React, {useContext, useEffect, useState} from 'react';
import lightImg from '../css/light-mode.png'
import darkModeImg from '../css/night-mode.png'
import {AppContext} from "../context/AppContext";


const ThemeButton = () => {
    const themeFromLocalStore = localStorage.getItem("theme");
    const [theme, setTheme] = useState(themeFromLocalStore || 'light');
    const {setThemeMode} = useContext(AppContext);

    const [isRight, setIsRight] = useState(theme === 'dark');
    const handleOnClick = () => {
        setIsRight(!isRight);
        if(!isRight) {
            setTheme("dark")
        } else {
            setTheme("light")
        }
    }

    useEffect(() => {
        setThemeMode(theme);
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [setThemeMode, theme]);

    if(themeFromLocalStore && themeFromLocalStore === 'dark') {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            setThemeMode('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }


    return (
        <div id="theme-button" onClick={handleOnClick}>
            <div className="theme-button-circle"
                 style={{
                     transform: isRight ? "translateX(30px)" : "translateX(0)",
                     transition: "transform 0.5s ease-in-out"
                 }}>
                {isRight ? <img src={darkModeImg} alt={''} width={'25px'} height={'25px'}/> :
                    <img src={lightImg} alt={"Light"} width={'25px'} height={'25px'}
                         style={{zIndex: 100, filter: 'brightness(5)'}}/>}
            </div>
            <img src={lightImg} alt={"Light"} width={'25px'} height={'25px'}
                 style={{zIndex: 100, opacity: isRight ? 1 : 0, marginLeft: "3px"}}/>
            <img src={darkModeImg} alt={'Dark'} width={'25px'} height={'25px'}
                 style={{opacity: !isRight ? 1 : 0, marginLeft: "5px", filter: 'brightness(0.5)'}}/>
        </div>
    )
}

export default ThemeButton;