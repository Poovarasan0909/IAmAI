import React, {useEffect, useRef} from 'react';
import {getThemeMode} from "../service/commonFun";

const CustomMenu = ({children, className, style, isMenuOpen, setIsMenuOpen = () => {}}) => {
    const menuRef = useRef(null);
    const themeMode = getThemeMode();

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        function handleEscape(event) {
            if (event.key === 'Escape') {
                setIsMenuOpen(false);
            }
        }

        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [])

    return (
        isMenuOpen ? (
                <div ref={menuRef} className={`${className} ${themeMode === 'light' ? "bg-white border text-black" : "bg-gray-700 border-[1px] border-gray-500 divide-gray-600"} z-[9999] min-w-28 max-w-52 shadow divide-y divide-gray-100 rounded-lg`} style={style}>
                    {children}
                </div>
                ) : null
    );
}
CustomMenu.Item = ({children, onClick, key}) => {
    const themeMode = getThemeMode();
    return (
        <div key={key} className={`${themeMode === 'light' ? 'hover:bg-gray-100': 'hover:bg-gray-600 border-gray-600'} cursor-pointer text-sm py-1 px-2 border-b truncate`}
             onClick={onClick}>
            {children}
        </div>
    )
}

export default CustomMenu