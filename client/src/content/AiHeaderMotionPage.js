import React, {useContext, useEffect, useRef, useState} from 'react'
import {motion} from "framer-motion";
import robot from "../css/webp/ro.webp";
import useIsMobile from "../hooks/useIsMobile";
import { useMediaQuery } from "react-responsive";
import {UserContext} from "../context/UserContext";


const AiHeaderMotionPage = () => {
    const {state} = useContext(UserContext);
    const userName = state.user ? 'Hello ' + state.user?.username.charAt(0).toUpperCase() + state.user?.username.substring(1) : 'Hello 👋';
    const isMobile = useIsMobile();
    const isMobileView = useMediaQuery({ maxWidth: 768 });
    const displayTexts = ["Welcome to IAmAI", userName];
    const [displayTextIndex, setDisplayTextIndex] = useState(0);
    const [imageProps, setImageProps] = useState({
        width: 250,
        height: 250,
        x: 0,
        y: 0,
    });
    useEffect(() => {
        if (isMobileView) {
            setImageProps({ width: 100, height: 100, x: -120, y: 160 });
        } else {
            setImageProps({ width: 150, height: 150, x: -210, y: 200 });
        }
    }, [isMobileView]);

    useEffect(() => {
        const interval = setInterval(() => {
            setDisplayTextIndex((prev) => (prev + 1) % displayTexts.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`relative user-select-none flex items-center justify-center ${isMobile ? 'top-[110px]' : ''} p-3`}>
            <motion.img
                src={robot} alt={"IAMAI"}
                className={''}
                onDoubleClickCapture={(e) => e.preventDefault()}
                initial={{width: 250, height: 250, x: 0, y: 0, rotate: -1}}
                animate={{ ...imageProps }}
                transition={{ duration: 1.3, ease: "easeInOut", type: "tween" }}
            />
            <motion.div
                className={'absolute text-lg font-semibold text-gray-800 dark:text-white px-6 py-4 rounded-br-2xl rounded-tr-2xl rounded-tl-2xl shadow'}
                style={{
                    top: isMobileView ? "-60%" : "10%",
                    left: isMobileView ? "35%" : "60%",
                    transform: "translate(-50%, -50%)",
                    maxWidth: isMobileView ? "80%" : "40%",
                }}
                initial={{ opacity: 0 }}
                animate={isMobileView ? { opacity: 1, x: 0, y: 150} : { opacity: 1, x: -200, y: 110}}
                transition={{duration: 1.5, ease: "easeInOut", delay: 0.3, type: "spring", repeatType: "reverse"}}>
               <motion.span
                 initial={{opacity: 0}}
                 animate={{opacity: 1}}
                 exit={{opacity: 0}}
                 transition={{duration: 2, repeat: Infinity, repeatType: "reverse"}}
                 className="text-blue-500 dark:text-blue-400"
               >
                   {displayTexts[displayTextIndex]},
               </motion.span>&ensp; <br />
                <p className={'mt-2 mb-1'}>I'm here to help you. </p>
                <p className={'text-green-500 dark:text-green-400 mb-1'}>
                    Ask me anything!&#129302;
                </p>
            </motion.div>
        </div>
    )
}

export default AiHeaderMotionPage;