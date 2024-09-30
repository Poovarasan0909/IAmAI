import React, {useContext, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {postRequest} from "../API_helper/APIs";
import {UserContext} from "../context/UserContext";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faXmark} from "@fortawesome/free-solid-svg-icons";
import usePopupMessage from "../hooks/usePopupMessage";
import {CircularProgress} from "@mui/material";
import TaskAlt from "@mui/icons-material/TaskAlt";
import {AppContext} from "../context/AppContext";
import ThemeButton from "../content/ThemeButton";


const SignUpAndSignIn = ({formType}) => {
    const isSignUp = formType === 'signup';
    const navigate = useNavigate();
    const { state, setState } = useContext(UserContext);
    const [userName, setUserName] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    const [userPassword, setUserPassword] = useState('');
    const [isloading, setIsloading] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState({isMin8Char: false, isAtleast1Caps: false,
                                                                                isAtleast1Lower: false, isAnyNumber: false, isValidPass: false});
    const showMessage = usePopupMessage(5000);
    const {isServerActive, isServerMsgVisible} = useContext(AppContext);

    // useEffect(() => {
    //     const handleKeyDown = (e) => {
    //         if(e.key === 'Enter') {
    //             handleOnSubmit();
    //         }
    //     };
    //     document.addEventListener('keyup', handleKeyDown);
    //     return () => {
    //         document.removeEventListener('keyup', handleKeyDown);
    //     };
    // }, []);


    const handleOnSubmit = () => {
        if(isSignUp) {
            if(userName && userEmail && userPassword !== '') {
                if (passwordValidation.isValidPass) {
                    setIsloading(true);
                    postRequest('createUser', {userName: userName, userEmail: userEmail, userPassword: userPassword})
                        .then((res) => {
                            setState({...state, user: res.data});
                            sessionStorage.setItem('user', JSON.stringify(res.data));
                            clearValues();
                            navigate('/');
                            setIsloading(false);
                        })
                } else {
                    showMessage('Enter valid password.', 'error')
                }
            } else {
                showMessage('All fields are required.', 'error');
            }
        }
        else {
            if(userEmail && userPassword) {
                setIsloading(true);
                postRequest('isUserLoginExit', {userEmail: userEmail, userPassword: userPassword})
                    .then((res) => {
                        if (res.data) {
                            setState({...state, user: res.data});
                            sessionStorage.setItem('user', JSON.stringify(res.data));
                            clearValues();
                            navigate('/');
                        } else {
                            showMessage('Email/Password are not exit in Database', 'error')
                        }
                        setIsloading(false);
                    })
            } else {
              showMessage('Email/Password are required', 'error')
        }
        }
    }

   const handlePasswordValidation = (value) => {
        const hasLowerCase = /[a-z]/.test(value);
        const hasUpperCase = /[A-Z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasMin8Length = value && value.length >= 8;
        setPasswordValidation({
           isMin8Char: hasMin8Length,
           isAnyNumber: hasNumber,
           isAtleast1Caps: hasUpperCase,
           isAtleast1Lower: hasLowerCase,
           isValidPass: hasLowerCase && hasUpperCase && hasNumber && hasMin8Length,
        });
   }

    const clearValues = () => {
        setUserName('')
        setUserEmail('')
        setUserPassword('')
    }

    return (
        <>
            <div className={'flex relative min-h-full flex-col justify-center px-6 py-12 lg:px-8 dark:bg-[rgba(52,52,52)]'}>
                <div className={'absolute right-3 top-3'}>
                   <ThemeButton/>
                </div>
                <div className="absolute top-4 left-4">
                    <button onClick={() => navigate('/')}
                            className="flex items-center text-indigo-600 hover:text-indigo-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                        </svg>
                        <span className="ml-2 font-medium">Back</span>
                    </button>
                </div>

                <div className={'sm:mx-auto sm:w-full sm:max-w-sm'}>
                    <h2 className={'mt-2 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white'}>{isSignUp ? 'Sign up to create your account' : 'Sign in your account'} </h2>
                </div>
                <div className={'mt-7 sm:mx-auto sm:w-full sm:max-w-sm'}>
                    <div className={'space-y-6'}>
                        {isSignUp && <div>
                            <label htmlFor="userName"
                                   className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"> User Name </label>
                            <div className={'mt-2'}>
                                <input id="userName" type="text" value={userName} name="userName"
                                       placeholder={"User Name"}
                                       className={'block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 shadow-sm ring-1 ring-inset ' +
                                           'ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-insert focus:ring-indigo-600 sm:text-sm sm:leading-6'}
                                       onChange={(event) => setUserName(event.target.value)}/>
                            </div>
                        </div>}
                        <div>
                            <label htmlFor={"user-email"}
                                   className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"> Email </label>
                            <div className={'mt-2'}>
                                <input id="user-email" value={userEmail} type="email" name={"user-email"}
                                       placeholder={'Email '}
                                       className={'block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 shadow-sm ring-1 ring-inset ' +
                                           'ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-insert focus:ring-indigo-600 sm:text-sm sm:leading-6'}
                                       onChange={(event) => setUserEmail(event.target.value)}/>
                            </div>
                        </div>
                        <div>
                            <div className={'flex items-center justify-between'}>
                                <label htmlFor={"user-login-password"}
                                       className={"block text-sm font-medium leading-6 text-gray-900 dark:text-white"}>
                                    Password
                                </label>
                                {!isSignUp &&
                                    <div className={'text-sm'}>
                                        <a href='#' className={'font-semibold text-indigo-600 hover:text-indigo-500'}>Forgot
                                            password?</a>
                                    </div>
                                }
                            </div>
                            <div className="mt-2">
                                <input id={'user-login-password'} value={userPassword} type={"password"}
                                       name={"user-login-password"} placeholder={'Password'}
                                       className={'block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 shadow-sm ring-1 ring-inset ' +
                                           'ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'}
                                       onChange={(event) => {
                                           setUserPassword(event.target.value)
                                           handlePasswordValidation(event.target.value)
                                       }}/>
                            </div>
                            {isSignUp &&
                            <div className={userPassword.length < 1 && 'hidden'}>
                                <label htmlFor={"user-login-password"}
                                       className={"block text-sm font-medium leading-6 py-1 text-gray-900 dark:text-white"}>
                                    Password must contain the following:
                                </label>
                                <div className={`grid grid-cols-2 gap-1`} style={{fontSize: '0.8em'}}>
                                    <div className={passwordValidation.isMin8Char ? 'text-green-500' : 'text-red-500'}>
                                        <FontAwesomeIcon
                                            icon={passwordValidation.isMin8Char ? faCheck : faXmark}/> Minimum 8
                                        characters
                                    </div>
                                    <div className={passwordValidation.isAnyNumber ? 'text-green-500' : 'text-red-500'}>
                                        <FontAwesomeIcon
                                            icon={passwordValidation.isAnyNumber ? faCheck : faXmark}/> Atleast one
                                        Number
                                    </div>
                                </div>
                                <div className={`grid grid-cols-2 gap-1`} style={{fontSize: '0.8em'}}>
                                    <div
                                        className={passwordValidation.isAtleast1Lower ? 'text-green-500' : 'text-red-500'}>
                                        <FontAwesomeIcon
                                            icon={passwordValidation.isAtleast1Lower ? faCheck : faXmark}/> Atleast one
                                        lowercase letter
                                    </div>
                                    <div
                                        className={passwordValidation.isAtleast1Caps ? 'text-green-500' : 'text-red-500'}>
                                        <FontAwesomeIcon
                                            icon={passwordValidation.isAtleast1Caps ? faCheck : faXmark}/> Atleast one
                                        uppercase letter
                                    </div>
                                </div>
                            </div> }
                        </div>
                        <div>
                            <button onClick={() => handleOnSubmit()}
                                    className={'flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-bold  leading-6 text-white ' +
                                        'shadow-sm hover:bg-indigo-500 focus-visible:outline ocus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'}>
                                {isloading ? <svg aria-hidden="true" role="status"
                                                  className="inline w-6 h-6 me-3 text-white animate-spin"
                                                  viewBox="0 0 100 101" fill="none"
                                                  xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="#E5E7EB"/>
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentColor"/>
                                </svg> : isSignUp ? 'Sign up' : 'Sign in'}
                            </button>
                        </div>
                    </div>
                    {isSignUp ?
                        <p className={"mt-2 text-center text-sm text-gray-500 dark:text-white"}>
                            Already have account?
                            <span onClick={() => {
                                clearValues();
                                navigate('/IAmAI/signin');
                            }}
                                  className={'font-semibold leading-6 text-indigo-600 hover:text-indigo-500 underline hover:cursor-pointer'}> Sign in</span>
                        </p> :
                        <p className={"mt-10 text-center text-sm text-gray-500 dark:text-white"}>
                            I don't have an account.
                            <span onClick={() => {
                                clearValues();
                                navigate('/IAmAI/signup')
                            }}
                                  className={'font-semibold leading-6 text-indigo-600 hover:text-indigo-500 underline hover:cursor-pointer'}> Sign up</span>
                        </p>
                    }
                </div>
                <div className={'flex center pt-3 dark:text-white'}>
                    {isServerMsgVisible &&
                        (!isServerActive ?
                            <>
                                <CircularProgress style={{width: '20px', height: '20px'}} color="inherit"/>
                                <pre className={'px-2'}>server starting, please wait...</pre>
                            </> :
                            <> <TaskAlt style={{width: '20px', height: '20px'}} color={'success'}/>
                                <pre>server started.</pre>
                            </>)
                    }
                </div>
            </div>
        </>
    )
}
export default SignUpAndSignIn;