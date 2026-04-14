'use client';

import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import { doCreateUserWithEmailAndPassword } from '../../../firebase/auth';
import { syncUserWithBackend } from '../../../services/userService';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';

const Register = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      setErrorMessage('Account created, but server sync failed.');
      setTimeout(() => navigate('/home'), 2000);
    }
  };

  const translateError = (code) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/invalid-email':
        return 'Invalid email format.';
      case 'auth/weak-password':
        return 'Password is too weak (min 6 chars).';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isRegistering) return;

    setErrorMessage('');

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
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

  if (userLoggedIn && !isRegistering) {
    return <Navigate to="/home" replace />;
  }

  return (
    <main className="w-full h-screen flex items-center justify-center p-4">
      <Card variant="outline" padding="lg" radius="xl" className="w-full max-w-md">
        <CardHeader padding="sm" className="text-center">
          <CardTitle>
            <Typography variant="h3" weight="semibold">
              Create a New Account
            </Typography>
          </CardTitle>
        </CardHeader>

        <CardContent padding="sm">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Typography variant="label" weight="medium">
                Email
              </Typography>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-input rounded-lg bg-background text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
              />
            </div>

            <div>
              <Typography variant="label" weight="medium">
                Password
              </Typography>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-input rounded-lg bg-background text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
              />
            </div>

            <div>
              <Typography variant="label" weight="medium">
                Confirm Password
              </Typography>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-input rounded-lg bg-background text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
              />
            </div>

            {errorMessage && (
              <Typography
                variant="body3"
                color="destructive"
                align="center"
                className="py-2 border border-red-200 rounded-md bg-red-50"
              >
                {errorMessage}
              </Typography>
            )}

            <Button variant="primary" size="md" type="submit" isLoading={isRegistering} className="w-full">
              {isRegistering ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>

        <CardFooter padding="sm" className="justify-center">
          <Typography variant="body2" align="center">
            Already have an account?{' '}
            <Link to="/login" className="font-bold hover:underline text-primary">
              Sign in
            </Link>
          </Typography>
        </CardFooter>
      </Card>
    </main>
  );
};

export default Register;
