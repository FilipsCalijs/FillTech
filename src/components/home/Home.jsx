import React from 'react';
import { useAuth } from '../../contexts/authContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';

const Home = () => {
  const { currentUser } = useAuth();

  if (!currentUser)
    return (
      <div className="pt-14 text-center">
        <Typography variant="body1" weight="bold">Loading...</Typography>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-14 p-4">
      <Card padding="lg" radius="2xl" className="max-w-md w-full space-y-6 border">
        <CardHeader padding="sm" className="flex flex-col items-center">
          {currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4">
              <Typography variant="h3" weight="bold">
                {currentUser.email?.charAt(0).toUpperCase()}
              </Typography>
            </div>
          )}
          <Typography variant="h2" weight="bold">
            Hello, {currentUser.displayName || 'User'}!
          </Typography>
          <Typography variant="body2" className="text-center">
            {currentUser.email}
          </Typography>
        </CardHeader>

        <hr />

        <CardContent padding="sm">
          <div className="space-y-3">
            <Typography variant="h3" weight="semibold">User Details:</Typography>
            <div className="space-y-1 text-sm">
              <p><span className="font-bold">UID:</span> {currentUser.uid}</p>
              <p><span className="font-bold">Email Verified:</span> {currentUser.emailVerified ? '✅ Yes' : '❌ No'}</p>
              <p><span className="font-bold">Last Login:</span> {currentUser.metadata.lastSignInTime}</p>
              <p><span className="font-bold">Account Created:</span> {currentUser.metadata.creationTime}</p>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            <Typography variant="h3" weight="semibold">Linked Providers:</Typography>
            {currentUser.providerData.map((profile) => (
              <Card key={profile.uid} padding="sm" radius="md" className="text-xs">
                <Typography variant="body2"><span className="font-bold">Provider:</span> {profile.providerId}</Typography>
                <Typography variant="body2"><span className="font-bold">Name:</span> {profile.displayName}</Typography>
                <Typography variant="body2"><span className="font-bold">Email:</span> {profile.email}</Typography>
                <Typography variant="body2" className="truncate"><span className="font-bold">Photo URL:</span></Typography>
              </Card>
            ))}
          </div>

          <div className="mt-4">
            <details className="cursor-pointer">
              <summary>
                <Typography variant="body2" weight="medium">View Raw JSON Data</Typography>
              </summary>
              <pre className="mt-2 p-4 text-[10px] overflow-x-auto rounded-lg">
                {JSON.stringify(currentUser, null, 2)}
              </pre>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
