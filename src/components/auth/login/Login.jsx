'use client';

import { Github, CircleUserRound } from 'lucide-react';
import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { 
    doSignInWithEmailAndPassword, 
    doSignInWithGoogle, 
    doSignInWithGithub,
    doPasswordReset
} from '../../../firebase/auth';
import { useAuth } from '../../../contexts/authContext';

const Login = () => {
    const { userLoggedIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        if (!isSigningIn) {
            setIsSigningIn(true);
            try {
                await doSignInWithEmailAndPassword(email, password);
            } catch (err) {
                setErrorMessage(err.message);
                setIsSigningIn(false);
            }
        }
    };

    const onGoogleSignIn = (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        if (!isSigningIn) {
            setIsSigningIn(true);
            doSignInWithGoogle().catch(err => {
                setErrorMessage(err.message);
                setIsSigningIn(false);
            });
        }
    };

    const onGithubSignIn = (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        if (!isSigningIn) {
            setIsSigningIn(true);
            doSignInWithGithub().catch(err => {
                setErrorMessage(err.message);
                setIsSigningIn(false);
            });
        }
    };

    const onForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
        setErrorMessage("Please enter your email address first.");
        return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsSigningIn(true); // Используем как индикатор загрузки

    try {
        await doPasswordReset(email);
        setSuccessMessage("Password reset link has been sent to your email.");
        // Важно: очищаем ошибку, если она была
        setErrorMessage('');
    } catch (err) {
        // Firebase часто возвращает специфические коды ошибок
        setErrorMessage(err.message);
        setSuccessMessage('');
    } finally {
        setIsSigningIn(false);
    }
};

    return (
        <div>
            {userLoggedIn && (<Navigate to={'/home'} replace={true} />)}

            <main className="w-full h-screen flex self-center place-content-center place-items-center">
                <div className="w-96 text-gray-600 space-y-5 p-4 shadow-xl border rounded-xl bg-white">
                    <div className="text-center">
                        <div className="mt-2">
                            <h3 className="text-gray-800 text-xl font-semibold sm:text-2xl">Welcome Back</h3>
                        </div>
                    </div>
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div>
                            <label className="text-sm text-gray-600 font-bold">Email</label>
                            <input
                                type="email"
                                autoComplete='email'
                                required
                                value={email} onChange={(e) => { setEmail(e.target.value) }}
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                            />
                        </div>

                        <div>
                            <div className="flex flex-row items-center justify-between">
                                <label className="text-sm text-gray-600 font-bold">Password</label>
                                <button 
                                    onClick={onForgotPassword}
                                    className="text-xs text-indigo-600 hover:underline font-bold"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <input
                                type="password"
                                autoComplete='current-password'
                                required
                                value={password} onChange={(e) => { setPassword(e.target.value) }}
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                            />
                        </div>

                        {errorMessage && (
                            <span className='text-red-600 font-bold text-sm block'>{errorMessage}</span>
                        )}

                        {successMessage && (
                            <span className='text-green-600 font-bold text-sm block'>{successMessage}</span>
                        )}

                        <button
                            type="submit"
                            disabled={isSigningIn}
                            className={`w-full px-4 py-2 text-white font-medium rounded-lg ${isSigningIn ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300'}`}
                        >
                            {isSigningIn ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                    
                    <p className="text-center text-sm">Don't have an account? <Link to={'/register'} className="hover:underline font-bold">Sign up</Link></p>
                    
                    <div className='flex flex-row text-center w-full'>
                        <div className='border-b-2 mb-2.5 mr-2 w-full'></div>
                        <div className='text-sm font-bold w-fit'>OR</div>
                        <div className='border-b-2 mb-2.5 ml-2 w-full'></div>
                    </div>

                    <div className="space-y-3">
                        <button
                            disabled={isSigningIn}
                            onClick={onGoogleSignIn}
                            className="w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50 transition duration-300 disabled:cursor-not-allowed">
                            <CircleUserRound className="w-5 h-5" />
                            Continue with Google
                        </button>
                        <button
                            disabled={isSigningIn}
                            onClick={onGithubSignIn}
                            className="w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50 transition duration-300 disabled:cursor-not-allowed">
                            <Github className="w-5 h-5" />
                            Continue with GitHub
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Login;