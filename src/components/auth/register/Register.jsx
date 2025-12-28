'use client';

import React, { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import { doCreateUserWithEmailAndPassword } from '../../../firebase/auth';
import { syncUserWithBackend } from '../../../services/userService';

const Register = () => {
    const navigate = useNavigate();
    const { userLoggedIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setconfirmPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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
            setErrorMessage("Account created, but server sync failed.");
            setTimeout(() => navigate('/home'), 2000);
        }
    };

    const translateError = (code) => {
        switch (code) {
            case 'auth/email-already-in-use': return "This email is already registered.";
            case 'auth/invalid-email': return "Invalid email format.";
            case 'auth/weak-password': return "Password is too weak (min 6 chars).";
            case 'auth/network-request-failed': return "Network error. Check your connection.";
            default: return "An error occurred. Please try again.";
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (isRegistering) return;

        setErrorMessage('');

        if (!validateEmail(email)) {
            setErrorMessage("Please enter a valid email address.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setErrorMessage("Password must be at least 6 characters.");
            return;
        }

        setIsRegistering(true);

        try {
            const res = await doCreateUserWithEmailAndPassword(email, password);
            await handleSyncAndRedirect(res.user);
        } catch (error) {
            setErrorMessage(translateError(error.code));
            setIsRegistering(false);
        }
    };

    return (
        <main className="w-full h-screen flex self-center place-content-center place-items-center bg-gray-50">
            {userLoggedIn && !isRegistering && (<Navigate to={'/home'} replace={true} />)}

            <div className="w-96 text-gray-600 space-y-5 p-4 shadow-xl border rounded-xl bg-white">
                <div className="text-center mb-6">
                    <h3 className="text-gray-800 text-xl font-semibold sm:text-2xl">Create a New Account</h3>
                </div>
                
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-bold">Email</label>
                        <input
                            type="email" required value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-2 px-3 py-2 border rounded-lg outline-none focus:border-indigo-600 transition"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-bold">Password</label>
                        <input
                            type="password" required value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mt-2 px-3 py-2 border rounded-lg outline-none focus:border-indigo-600 transition"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-bold">Confirm Password</label>
                        <input
                            type="password" required value={confirmPassword}
                            onChange={(e) => setconfirmPassword(e.target.value)}
                            className="w-full mt-2 px-3 py-2 border rounded-lg outline-none focus:border-indigo-600 transition"
                        />
                    </div>

                    {errorMessage && (
                        <p className='text-red-600 font-bold text-xs text-center py-2 bg-red-50 border border-red-200 rounded-md'>
                            {errorMessage}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isRegistering}
                        className={`w-full px-4 py-2 text-white font-medium rounded-lg transition duration-300 ${isRegistering ? 'bg-gray-300' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {isRegistering ? 'Creating Account...' : 'Sign Up'}
                    </button>
                    
                    <div className="text-sm text-center">
                        Already have an account? {' '}
                        <Link to='/login' className="hover:underline font-bold">Sign in</Link>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default Register;