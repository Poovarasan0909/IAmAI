import React, {useContext, useEffect, useState} from 'react';
import lightImg from '../css/light-mode.png'
import darkModeImg from '../css/night-mode.png'
import {AppContext} from "../context/AppContext";


const ThemeButton = () => {
    const themeFromLocalStore = localStorage.getItem("theme");
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const [theme, setTheme] = useState(themeFromLocalStore || 'light');
    const {setThemeMode} = useContext(AppContext);

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

    const updateTheme = (value) => {
        setTheme(value);
    }

    return (
        <div className="relative">
            <button id='themebutton' data-dropdown-toggle="themeMenu"
                    className={'flex items-center mr-3 p-2 pe-1 text-sm font-medium text-gray-900 rounded-full hover:text-blue-600 focus:ring-4 dark:focus:ring-gray-700 dark:text-white focus:ring-gray-100 dark:hover:text-blue-500'}
                    onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                    onBlur={() => setTimeout(() => {
                        setIsThemeMenuOpen(!isThemeMenuOpen)
                    }, 300)}
            >
                {theme === 'light' ?
                    <img src={lightImg} alt={"Light"} width={'25px'} height={'25px'}/>
                    : <img src={darkModeImg} alt={''} width={'25px'} height={'25px'}/>}
                {theme.charAt(0).toUpperCase() + theme.slice(1, theme.length)}
                <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                     fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth="2" d="m1 1 4 4 4-4"/>
                </svg>
            </button>

            <div id="themeMenu"
                 className={`z-10 ${!isThemeMenuOpen && 'hidden'} divide-y divide-gray-100 rounded-lg shadow w-35 dark:divide-gray-600 absolute top-full left-0 mt-2 dark:bg-gray-700`}>
                <div className="py-2 text-sm text-gray-900 dark:text-white">
                    {theme !== 'light' &&
                        <div className={'cursor-pointer flex px-3 hover:bg-blue-100 dark:hover:bg-gray-800 py-1'}
                             onClick={() => updateTheme('light')}>
                            <img src={lightImg} alt={""} width={'25px'} height={'25px'}/> {' Light'}
                        </div>}
                    {theme !== 'dark' &&
                        <div className={'cursor-pointer flex px-3 hover:bg-blue-100 dark:hover:bg-gray-800 py-1'}
                             onClick={() => updateTheme('dark')}>
                            <img src={darkModeImg} style={{filter: 'brightness(0.5)'}} alt={""} width={'23px'}
                                 height={'23px'}/>{' Dark'}
                        </div>}
                </div>
            </div>
        </div>
    )
}

export default ThemeButton;