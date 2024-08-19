import './App.css';
import Gemini_api from './content/Gemini_api'
import './css/background.css'
import './css/contentPage.css'
import { Helmet } from 'react-helmet';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import LoginPage from './authenticationPages/LoginPage';
import SignUp from "./authenticationPages/SignUp";
import {useEffect, useState} from "react";
// Importing CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
    const [theme, setTheme] = useState('light');
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);
    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
      <div className={"container"}>
          <Helmet>
              <meta charSet="utf-8" />
              <title>IAmAI</title>
          </Helmet>
          <div style={{position: 'absolute', top: 0, right: 0, width: '100%', height: '100%'}}>
              {/*<button*/}
              {/*    onClick={toggleTheme}*/}
              {/*    className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded-md"*/}
              {/*> Toggle Theme*/}
              {/*</button>*/}
                  <Router>
                      <Routes>
                          <Route path="/" index element={<Navigate to="IAmAI"/>}/>
                          {/* eslint-disable-next-line react/jsx-pascal-case */}
                          <Route path="/IAmAI" element={<Gemini_api/>}/>
                          <Route path="/IAmAI/signin" element={<SignUp formType='signin'/>}/>
                          <Route path="/IAmAI/signup" element={<SignUp formType='signup'/>}/>
                      </Routes>
                  </Router>
          </div>
      </div>
);
}

export default App;
