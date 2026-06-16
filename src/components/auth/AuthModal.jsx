import React, { useState } from 'react';
import { Github, CircleUserRound, X } from 'lucide-react';
import {
  doSignInWithEmailAndPassword,
  doCreateUserWithEmailAndPassword,
  doSignInWithGoogle,
  doSignInWithGithub,
  doPasswordReset,
} from '@/firebase/auth';
import { syncUserWithBackend } from '@/services/userService';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';

const validateEmail = (email) =>
  String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

const translateError = (code) => {
  switch (code) {
    case 'auth/invalid-email': return 'Invalid email format.';
    case 'auth/user-disabled': return 'This account has been disabled.';
    case 'auth/email-already-in-use': return 'This email is already registered.';
    case 'auth/weak-password': return 'Password is too weak (min 6 chars).';
    case 'auth/network-request-failed': return 'Network error. Check your connection.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Invalid email or password.';
    case 'auth/too-many-requests': return 'Too many attempts. Try again later.';
    default: return 'An error occurred. Please try again.';
  }
};

const AuthModal = ({ isOpen, mode = 'login', onModeChange, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const reset = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const switchMode = (next) => {
    setErrorMessage('');
    setSuccessMessage('');
    onModeChange?.(next);
  };

  const finish = async (user) => {
    try {
      await syncUserWithBackend(user);
    } catch {
      // Non-fatal: user is authenticated even if backend sync fails
    }
    reset();
    onSuccess?.();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (mode === 'register') {
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = mode === 'login'
        ? await doSignInWithEmailAndPassword(email, password)
        : await doCreateUserWithEmailAndPassword(email, password);
      await finish(res.user);
    } catch (err) {
      setErrorMessage(translateError(err.code));
      setIsSubmitting(false);
    }
  };

  const onGoogle = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await doSignInWithGoogle();
      if (res?.user) await finish(res.user);
      else setIsSubmitting(false);
    } catch (err) {
      setErrorMessage(translateError(err.code));
      setIsSubmitting(false);
    }
  };

  const onGithub = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await doSignInWithGithub();
      if (res?.user) await finish(res.user);
      else setIsSubmitting(false);
    } catch (err) {
      setErrorMessage(translateError(err.code));
      setIsSubmitting(false);
    }
  };

  const onResetPassword = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email to reset password.');
      return;
    }
    try {
      await doPasswordReset(email);
      setSuccessMessage('Password reset link sent!');
    } catch (err) {
      setErrorMessage(translateError(err.code));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
      <Card variant="elevated" bordered="disable" padding="lg" radius="xl" className="w-full max-w-md relative shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <CardHeader padding="sm" className="text-center">
          <CardTitle>
            {mode === 'login' ? 'Welcome Back' : 'Create a New Account'}
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
              <div className="flex items-center justify-between">
                <Typography variant="label" weight="medium">
                  Password
                </Typography>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={onResetPassword}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-input rounded-lg bg-background text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
              />
            </div>

            {mode === 'register' && (
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
            )}

            {errorMessage && (
              <Typography
                variant="body3"
                color="destructive"
                align="center"
                className="py-2 border border-red-200 rounded-md bg-red-50 dark:border-red-900 dark:bg-red-950"
              >
                {errorMessage}
              </Typography>
            )}
            {successMessage && (
              <Typography
                variant="body3"
                color="success"
                align="center"
                className="py-2 border border-green-200 rounded-md bg-green-50 dark:border-green-900 dark:bg-green-950"
              >
                {successMessage}
              </Typography>
            )}

            <Button variant="primary" size="md" type="submit" disabled={isSubmitting} isLoading={isSubmitting} className="w-full">
              {mode === 'login'
                ? (isSubmitting ? 'Signing In...' : 'Sign In')
                : (isSubmitting ? 'Creating Account...' : 'Sign Up')}
            </Button>
          </form>

          <div className="relative flex items-center my-4">
            <div className="flex-grow border-t border-border"></div>
            <span className="mx-4 text-sm font-semibold text-foreground">OR</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button type="button" disabled={isSubmitting} variant="outline" size="md" className="w-full flex items-center justify-center" onClick={onGoogle}>
              <CircleUserRound className="w-5 h-5 mr-2" /> Google
            </Button>
            <Button type="button" disabled={isSubmitting} variant="outline" size="md" className="w-full flex items-center justify-center" onClick={onGithub}>
              <Github className="w-5 h-5 mr-2" /> GitHub
            </Button>
          </div>
        </CardContent>

        <CardFooter padding="sm" className="justify-center">
          <Typography variant="body2" align="center">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="font-bold text-primary hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </Typography>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthModal;
