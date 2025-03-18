import React, {useContext, useState} from 'react';
import userDefaultImage from "../css/9187604.png";
import {useNavigate} from "react-router-dom";
import ThemeButton from "./ThemeButton";
import {isMobile} from "react-device-detect";
import LogoutIcon from '@mui/icons-material/Logout';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import {AppContext} from "../context/AppContext";
import CustomMenu from "../common/CustomMenu";
import {useQuery} from "@tanstack/react-query";
import {getRequest} from "../API_helper/APIs";
import {setAuthToken} from "../service/authToken";

const UserProfile = ({state, setState}) => {
    const navigate = useNavigate();
    const firstChar = state?.user?.username?.charAt(0).toUpperCase();
    const userName = firstChar + state?.user?.username?.substring(1);
    const [isUserMenuHide, setIsUserMenuHide] = useState(false);
    const {themeMode} = useContext(AppContext);

    const handleOnSignOut = () => {
        setState({ ...state, user: null});
        refetch().then((res) => {
            const token = res.data.headers.get('authorization');
            setAuthToken(token);
        })
        sessionStorage.removeItem('user');
        navigate('/')
    }
    const {refetch} = useQuery({
        queryKey: ['user_log_out'],
        queryFn: async () => {
            return await getRequest('userLogout')
        },
        enabled: false
    })

    return (<>
        {!state.user ? <>
                <div className="absolute top-1 right-0 m-2 flex">
                    {!isMobile && <ThemeButton/>}
                    <button
                        className={`cursor-pointer mr-3 inline-flex items-center rounded-full lg:px-4 py-1 text-1xl font-mono font-semibold text-blue-600
                            hover:text-white border-2 border-blue-600 hover:bg-blue-600 transition ease-in-out delay-150 hover:translate-y-1 hover:scale-75 duration-300 focus:bg-transparent max-md:px-1`}
                        onClick={() => navigate("/IAmAI/signin")}>
                        Sign in
                    </button>
                    <button
                        className="cursor-pointer inline-flex items-center rounded-full lg:px-4 py-1 text-1xl font-mono font-semibold text-blue-600
                            hover:text-white border-2 border-blue-600 hover:bg-blue-600 transition ease-in-out delay-150 hover:translate-y-1 hover:scale-75 duration-300 focus:bg-transparent max-md:px-1"
                        onClick={() => navigate("/IAmAI/signup")}>
                        Sign up
                    </button>
                </div>
            </> :
            <>
                <div className="absolute top-1 right-0 m-1 inline-flex">
                    {!isMobile && <ThemeButton/>}
                    <button id="dropdownAvatarNameButton" data-dropdown-toggle="dropdownAvatarName"
                            className="flex items-center text-sm pe-1 font-medium text-gray-900 rounded-full hover:text-blue-600 dark:hover:text-blue-500 md:me-0 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-white"
                            type="button" onClick={() => setIsUserMenuHide(!isUserMenuHide)}>
                        <span className="sr-only">Open user menu</span>
                        {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                        <img className="w-8 h-8 me-2 rounded-full"
                             src={userDefaultImage} alt="user photo"/>
                        {userName}
                        <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                             fill="none" viewBox="0 0 10 6">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                  strokeWidth="2" d="m1 1 4 4 4-4"/>
                        </svg>
                    </button>
                </div>

                <CustomMenu isMenuOpen={isUserMenuHide} setIsMenuOpen={setIsUserMenuHide} className={`absolute top-10 right-0 m-3`}>
                    <CustomMenu.Item>
                        <div className="px-2 py-1 text-sm text-gray-900 dark:text-white">
                            <div className="font-medium "> {userName}</div>
                            <div className="truncate">{state.user.email}</div>
                        </div>
                    </CustomMenu.Item>
                    {isMobile &&
                        <CustomMenu.Item>
                            <div className={"px-2 py-1 text-sm text-gray-900 dark:text-white flex relative"}>
                                <div>Theme</div>
                                <div className={"absolute right-px"}><ThemeButton/></div>
                            </div>
                        </CustomMenu.Item>}
                    <CustomMenu.Item onClick={()=> navigate('/IAmAI/chat')}>
                          <span className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600
                            dark:text-gray-200 dark:hover:text-white cursor-pointer">
                              <ChatOutlinedIcon/>  Message
                          </span>
                    </CustomMenu.Item>
                    <CustomMenu.Item>
                            <span className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600
                            dark:text-gray-200 dark:hover:text-white cursor-pointer"
                                  onClick={() => handleOnSignOut()}>
                                <LogoutIcon/> Sign out</span>
                    </CustomMenu.Item>
                </CustomMenu>
            </>
        }
    </>);
}

export default UserProfile;