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
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

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

    const validateEmail = (email) =>
        String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );

    const handleSyncAndRedirect = async (user) => {
        try {
            await syncUserWithBackend(user);
            navigate('/home');
        } catch {
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
        <main className="w-full h-screen flex items-center justify-center bg-background">
            <Card className="w-96 space-y-5" variant="default" padding="sm" radius="xl">
                <CardHeader padding="sm" className="text-center">
                    <CardTitle className="text-xl sm:text-2xl">Welcome Back</CardTitle>
                </CardHeader>

                <CardContent padding="sm">
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div>
                            <label className="text-sm font-semibold text-foreground">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full mt-2 px-3 py-2 border border-input bg-background text-foreground rounded-lg outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-foreground">Password</label>
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="sm"
                                    className="text-primary hover:underline p-4"
                                    onClick={onResetPassword}
                                >
                                    Forgot password?
                                </Button>

                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mt-2 px-3 py-2 border border-input bg-background text-foreground rounded-lg outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition"
                            />
                        </div>

                        {errorMessage && (
                            <p className="text-xs font-bold text-center text-destructive">{errorMessage}</p>
                        )}
                        {successMessage && (
                            <p className="text-xs font-bold text-center text-green-600">{successMessage}</p>
                        )}

                        <Button
                            variant="destructive"
                            size="md"
                            type="submit"
                            disabled={isSigningIn}
                            className="w-full"
                        >
                            {isSigningIn ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </form>

                    <p className="text-center text-sm mt-2 text-foreground">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>

                    <div className="relative flex items-center my-2">
                        <div className="flex-grow border-t border-border"></div>
                        <span className="mx-4 text-sm font-semibold text-foreground">OR</span>
                        <div className="flex-grow border-t border-border"></div>
                    </div>
                </CardContent>

                <CardFooter padding="sm" className="grid grid-cols-2 gap-3">
                    <Button
                        type="button"
                        disabled={isSigningIn}
                        variant="outline"
                        size="md"
                        className="w-full flex items-center justify-center"
                        onClick={onGoogleSignIn}
                    >
                        <CircleUserRound className="w-5 h-5 mr-2" />
                        Google
                    </Button>

                    <Button
                        type="button"
                        disabled={isSigningIn}
                        variant="outline"
                        size="md"
                        className="w-full flex items-center justify-center"
                        onClick={onGithubSignIn}
                    >
                        <Github className="w-5 h-5 mr-2" />
                        GitHub
                    </Button>
                </CardFooter>

            </Card>
        </main>
    );
};

export default Login;
