import React, {useContext, useEffect, useState} from "react";
import './App.css';
import Gemini_api from './content/Gemini_api'
import './css/background.css'
import './css/contentPage.css'
import { Helmet } from 'react-helmet';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import SignUpAndSignIn from "./authenticationPages/SignUpAndSignIn";
import {getRequest, postRequest} from "./API_helper/APIs";
import {AppContext} from "./context/AppContext";
// Importing CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import {UserContext} from "./context/UserContext";
import Chat from "./content/Chat";
import ForgotPassword from "./content/ForgotPassword";
import {setAuthToken} from "./service/authToken";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Box, useTheme} from "@mui/material";
import useMediaQuery from '@mui/material/useMediaQuery';

function App() {
    let {isServerActive, setIsServerActive, setGeolocation} = useContext(AppContext);
    const [isWindowActive, setIsWindowActive] = useState(true);
    let {state} = useContext(UserContext)
    window.addEventListener('blur', () => setIsWindowActive(false));
    window.addEventListener('focus', () => setIsWindowActive(true));
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sd'));

    useEffect( () =>  {
        const userData = JSON.parse(sessionStorage.getItem('user'));
        const userId = userData ? userData?._id : null;
        async function checkIsServerActive() {
            const res = await getRequest('/', {'Id' : `${userId}`});
            if(res && res?.status >= 200 && res?.status < 300) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                isServerActive = true;
                setIsServerActive(true)
                const token = res.headers?.authorization;
                setAuthToken(token);
                console.log("Server is Active: ", isServerActive);
            } else {
                console.log('Response Failed with status: ' + res?.status);
            }
        }
       checkIsServerActive();
    }, []);

    // useEffect( () => {
    //     setTimeout(() => {
    //         axios('https://api.ipify.org?format=json').then((res) => {
    //             axios.get(`https://ipinfo.io/${res.data.ip}/json?token=398c229072b4b7`).then((add) => {
    //                 setGeolocation(add.data);
    //                 let params = {
    //                     userId: state.user ? state.user._id : null,
    //                     geolocation:add.data
    //                 }
    //                 if(!localStorage.getItem('isLoaded')) {
    //                     postRequest('api/saveGeolocation', params)
    //                 }
    //                 localStorage.setItem('isLoaded', true);
    //             }).catch((e) => console.error(e))
    //         }).catch((e) => console.error(e))
    //     }, 2000);
    // },[isServerActive])

    return (
        <div style={{height: '100vh'}}>
            <Helmet>
                <meta charSet="utf-8"/>
                <title>{isWindowActive ? "IAmAI" : "Come Back 🙁"}</title>
            </Helmet>
            <div id={"top-level-popup-message"}></div>
            <Router>
                <Routes>
                    <Route path="/" index element={<Navigate to="IAmAI"/>}/>
                    {/* eslint-disable-next-line react/jsx-pascal-case */}
                    <Route path="/IAmAI" element={<Gemini_api/>}/>
                    <Route path="/IAmAI/signin" element={<SignUpAndSignIn formType='signin'/>}/>
                    <Route path="/IAmAI/signup" element={<SignUpAndSignIn formType='signup'/>}/>
                    <Route path="/IAmAI/reset_password" element={<ForgotPassword/>}/>
                    <Route path="/IAmAI/chat" element={<Chat/>}/>
                    <Route path="*" element={
                        <div className={'relative top-[45vh] left-[35vw] transform-[translate(-50%, -50%)]'}>
                            <h2><a href={"/IAmAI"}>404 PAGE NOT FOUND</a></h2>
                        </div>}/>
                </Routes>
            </Router>
            <Dialog id={'err-popup-model'} open={true} fullScreen={fullScreen} fullWidth={true}>
                <Box className={'dark:bg-[#2C2F33] shadow-[rgba(0, 0, 0, 0.6)]'}>
                    <DialogTitle className={"dark:text-[#DADADA]"} id="responsive-popup-title">
                        {"ERROR!! ):"}
                    </DialogTitle>
                    <DialogContent className={"dark:text-white"} id={"responsive-popup-content"}>
                        &emsp;&emsp; Server is not active. Please try again later.
                    </DialogContent>
                    <DialogActions id={"responsive-popup-actions"}>
                        <Button
                            id={"responsive-popup-ok"}
                            className={'dark:text-[#00A8E8]'}
                            color="primary"
                        >
                            Ok
                        </Button>
                        <Button
                            id={"responsive-popup-close"}
                            className={'dark:text-[#00A8E8]'}
                            color="primary"
                        > Close
                        </Button>
                        <Button
                            id={"responsive-popup-reload"}
                            style={{display: 'none'}}
                            onClick={() => window.location.reload()} color="primary">
                            Reload
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </div>
    );
}

export default App;
