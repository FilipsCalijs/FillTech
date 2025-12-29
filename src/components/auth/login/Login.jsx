'use client';

import { Github, CircleUserRound } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    doSignInWithEmailAndPassword, 
    doSignInWithGoogle, 
    doSignInWithGithub,
    doPasswordReset
} from '../../../firebase/auth';
import { useAuth } from '../../../contexts/authContext';
import { syncUserWithBackend } from '../../../services/userService';
import { Button } from '@/components/ui/Button';

const Login = () => {
    const { userLoggedIn } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (userLoggedIn && !isSigningIn) {
            navigate('/home');
        }
    }, [userLoggedIn, navigate, isSigningIn]);

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    };

    const handleSyncAndRedirect = async (user) => {
        try {
            await syncUserWithBackend(user);
            navigate('/home');
        } catch (error) {
            setErrorMessage("Login successful, but sync failed.");
            setTimeout(() => navigate('/home'), 2000);
        }
    };

    const translateError = (code) => {
        switch (code) {
            case 'auth/invalid-email': return "Invalid email format.";
            case 'auth/user-disabled': return "This account has been disabled.";
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential': return "Invalid email or password.";
            case 'auth/too-many-requests': return "Too many attempts. Try again later.";
            default: return "An error occurred. Please try again.";
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (isSigningIn) return;

        setErrorMessage('');
        setSuccessMessage('');

        if (!validateEmail(email)) {
            setErrorMessage("Please enter a valid email address.");
            return;
        }

        setIsSigningIn(true);
        try {
            const res = await doSignInWithEmailAndPassword(email, password);
            await handleSyncAndRedirect(res.user);
        } catch (err) {
            setErrorMessage(translateError(err.code));
            setIsSigningIn(false);
        }
    };

    const onGoogleSignIn = async (e) => {
        e.preventDefault();
        if (isSigningIn) return;
        setIsSigningIn(true);
        setErrorMessage('');
        try {
            const res = await doSignInWithGoogle();
            if (res?.user) await handleSyncAndRedirect(res.user);
        } catch (err) {
            setErrorMessage(translateError(err.code));
            setIsSigningIn(false);
        }
    };

    const onGithubSignIn = async (e) => {
        e.preventDefault();
        if (isSigningIn) return;
        setIsSigningIn(true);
        setErrorMessage('');
        try {
            const res = await doSignInWithGithub();
            if (res?.user) await handleSyncAndRedirect(res.user);
        } catch (err) {
            setErrorMessage(translateError(err.code));
            setIsSigningIn(false);
        }
    };

    const onResetPassword = async (e) => {
        e.preventDefault();
        if (!email || !validateEmail(email)) {
            setErrorMessage("Please enter a valid email to reset password.");
            return;
        }
        try {
            await doPasswordReset(email);
            setSuccessMessage("Password reset link sent!");
            setErrorMessage('');
        } catch (err) {
            setErrorMessage(translateError(err.code));
        }
    };

    return (
        <main className="w-full h-screen flex self-center place-content-center place-items-center bg-gray-50">
            <div className="w-96 text-gray-600 space-y-5 p-4 shadow-xl border rounded-xl bg-white">
                <div className="text-center">
                    <h3 className="text-gray-800 text-xl font-semibold sm:text-2xl">Welcome Back</h3>
                </div>
                
                
                <form onSubmit={onSubmit} className="space-y-5">
                    <div>
                        <label className="text-sm font-bold">Email</label>
                        <input
                            type="email" required value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-2 px-3 py-2 border rounded-lg outline-none focus:border-indigo-600 transition"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold">Password</label>
                            <button type="button" onClick={onResetPassword} className="text-xs text-indigo-600 hover:underline font-bold">
                                Forgot password?
                            </button>
                        </div>
                        <input
                            type="password" required value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mt-2 px-3 py-2 border rounded-lg outline-none focus:border-indigo-600 transition"
                        />
                    </div>

                    {errorMessage && <p className='text-red-600 text-xs font-bold text-center'>{errorMessage}</p>}
                    {successMessage && <p className='text-green-600 text-xs font-bold text-center'>{successMessage}</p>}

                    
                    <Button
                        variant="primary"
                        size="sm"
                        type="submit" disabled={isSigningIn}
                        className="w-full"
                        >
                         {isSigningIn ? 'Signing In...' : 'Sign In'}
                    </Button>
                </form>
                
                <p className="text-center text-sm">Don't have an account? <Link to='/register' className="font-bold hover:underline">Sign up</Link></p>

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm font-bold">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button" disabled={isSigningIn} onClick={onGoogleSignIn}
                        className="flex items-center justify-center py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                    >
                        <CircleUserRound className="w-5 h-5 mr-2" /> Google
                    </button>
                    <button
                        type="button" disabled={isSigningIn} onClick={onGithubSignIn}
                        className="flex items-center justify-center py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                    >
                        <Github className="w-5 h-5 mr-2" /> GitHub
                    </button>
                </div>
            </div>
        </main>
    );
};

export default Login;