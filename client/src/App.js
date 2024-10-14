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
import axios from "axios";
import {UserContext} from "./context/UserContext";

function App() {
    let {isServerActive, setIsServerActive, setGeolocation} = useContext(AppContext);
    let {state} = useContext(UserContext)

    useEffect( () =>  {
        async function checkIsServerActive() {
            const res = await getRequest('/');
            if(res && res.status >= 200 && res.status < 300) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                isServerActive = true;
                setIsServerActive(true)
                console.log("Server is Active: ", isServerActive);
            } else {
                console.log('Response Failed with status: ' + res.status);
            }
        }
       checkIsServerActive();
    }, []);

    useEffect( () => {
        setTimeout(() => {
            axios('https://api.ipify.org?format=json').then((res) => {
                axios.get(`https://ipinfo.io/${res.data.ip}/json?token=398c229072b4b7`).then((add) => {
                    setGeolocation(add.data);
                    let params = {
                        userId: state.user ? state.user._id : null,
                        geolocation:add.data
                    }
                    if(!localStorage.getItem('isLoaded')) {
                        postRequest('/saveGeolocation', params)
                    }
                    localStorage.setItem('isLoaded', true);
                }).catch((e) => console.error(e))
            }).catch((e) => console.error(e))
        }, 2000);
    },[isServerActive])

    return (
      <div className={"container"}>
          <Helmet>
              <meta charSet="utf-8" />
              <title>IAmAI</title>
          </Helmet>
          <div style={{position: 'absolute', top: 0, right: 0, width: '100%', height: '100%'}}>
              <div id={"top-level-popup-message"}></div>
              <Router>
                  <Routes>
                      <Route path="/" index element={<Navigate to="IAmAI"/>}/>
                      {/* eslint-disable-next-line react/jsx-pascal-case */}
                      <Route path="/IAmAI" element={<Gemini_api/>}/>
                      <Route path="/IAmAI/signin" element={<SignUpAndSignIn formType='signin'/>}/>
                      <Route path="/IAmAI/signup" element={<SignUpAndSignIn formType='signup'/>}/>
                      <Route path="*" element={<div className={'center'}><h2><a href={"/IAmAI"}>404 PAGE NOT FOUND</a> </h2></div>}/>
                  </Routes>
              </Router>
          </div>
      </div>
    );
}

export default App;
