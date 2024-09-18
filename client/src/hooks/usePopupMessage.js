import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from "react-dom/client";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faXmark} from "@fortawesome/free-solid-svg-icons";


const usePopupMessage = (timeout = 5000) => {
   const [message, setMessage] = useState(null);
   const [messageType, setMessageType] = useState('info');
   const popupContainerRef = useRef(null);
   const popupRootRef = useRef(null);

    useEffect(() => {
        if (!popupContainerRef.current) {
            popupContainerRef.current = document.getElementById('top-level-popup-message');
        }

        if (popupContainerRef.current && !popupRootRef.current) {
            popupRootRef.current = createRoot(popupContainerRef.current);
        }
        if (message && popupContainerRef.current) {
            const bgColor = {
                success: 'bg-green-500',
                error: 'bg-red-500',
                info: 'bg-blue-500',
                warning: 'bg-yellow-500'
            }[messageType] || 'bg-gray-500';

            const popupShadowColor1 = {
                success: 'rgba(20, 255, 20, 0.5)',
                error: 'rgba(255, 20, 20, 0.7)',
                info: 'rgba(20, 20, 255, 0.5)',
                warning: 'rgba(255, 255, 20, 0.7)'
            }[messageType] || 'rgba(0, 0, 0, 0.5)';
            const popupShadowColor2 = {
                success: 'rgba(20, 255, 20, 0.7)',
                error: 'rgba(255, 20, 20, 0.9)',
                info: 'rgba(20, 20, 255, 0.7)',
                warning: 'rgba(255, 255, 20, 0.9)'
            }[messageType] || 'rgba(0, 0, 0, 0.7)';

            document.documentElement.style.setProperty('--shadow-color-popup-msg-1', popupShadowColor1);
            document.documentElement.style.setProperty('--shadow-color-popup-msg-2', popupShadowColor2);

            popupRootRef.current.render(
                <div style={{zIndex: 9999}}
                    className={`flex absolute top-12 right-10 py-3 text-neutral-100 font-bold pl-4 pr-9 bg-red-500 rounded-3 min-w-80 min-h-12 max-w-96 break-words shadow-blink ${bgColor}`}>
                    <div className="flex-grow">{message}</div>
                    <button
                        className={'absolute right-1 top-1/2 transform -translate-y-1/2 shadow px-2 rounded bg-gray-600'}
                        onClick={() => {
                            if (popupRootRef.current) {
                                popupRootRef.current.unmount();
                                popupRootRef.current = null;
                            }
                            setMessage(null);
                        }}>
                        <FontAwesomeIcon icon={faXmark}/>
                    </button>
                </div>);

            const timer = setTimeout(() => {
                if (popupRootRef.current) {
                    popupRootRef.current.unmount();
                    popupRootRef.current = null;
                }
                setMessage(null)
            }, timeout)

            return () => clearTimeout(timer);
        }
        return () => {
            if (popupRootRef.current && !message) {
                popupRootRef.current.unmount();
                popupRootRef.current = null;
            }
        };
    }, [message, messageType, timeout]);

    return (msg, type = 'info') => {
        setMessage(msg);
        setMessageType(type);
    };
}

export default usePopupMessage;