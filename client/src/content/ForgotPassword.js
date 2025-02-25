import React from 'react';
import ThemeButton from "./ThemeButton";
import {useNavigate} from "react-router-dom";

const ForgotPassword = () => {
    const navigate = useNavigate();
    return (
        <div className={'flex relative min-h-full flex-col justify-center px-6 py-12 lg:px-8 dark:bg-darkBg'}>
            <div className={'absolute right-3 top-3'}>
                <ThemeButton/>
            </div>
            <div className="absolute top-3 left-3">
                <button onClick={() => navigate('/')}
                        className="flex items-center text-indigo-600 hover:text-indigo-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                    </svg>
                    <span className="ml-2 font-medium">Back</span>
                </button>
            </div>
            <div>
                <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">Forgot Password</h1>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Enter your email address and we'll send you a link
                    to reset your password</p>
                <div className={"flex"}>
                <input
                    className={"w-[45%] pl-3 pr-3 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 dark:text-slate-200 text-sm border border-slate-200 " +
                        "rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"}
                    type={"text"} placeholder={"Email"}/>
                <button type="button"
                        className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-3 py-2.5 text-center mb-1 ml-4 hover:scale-90">
                    Send Email
                </button>
                </div>
                <div>

                </div>
            </div>

        </div>
    )
}

export default ForgotPassword;