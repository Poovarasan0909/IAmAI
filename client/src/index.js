import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {UserProvider} from "./context/UserContext";
import {AppProvider} from "./context/AppContext";
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "./service/queryClient"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <AppProvider>
                <UserProvider>
                    <App/>
                    <ReactQueryDevtools initialIsOpen={false} />
                </UserProvider>
            </AppProvider>
        </QueryClientProvider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
