import React from 'react'
import { useAuth } from '../../contexts/authContext'

const Home = () => {
    const { currentUser } = useAuth()

    if (!currentUser) return <div className="pt-14 text-center">Loading...</div>

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 pt-14 p-4">
            <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-6 space-y-6 border border-gray-200">
                
                {/* Аватар и Приветствие */}
                <div className="flex flex-col items-center">
                    {currentUser.photoURL ? (
                        <img 
                            src={currentUser.photoURL} 
                            alt="Profile" 
                            className="w-24 h-24 rounded-full border-4 border-indigo-500 mb-4"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                            <span className="text-3xl font-bold text-indigo-600">
                                {currentUser.email?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-gray-800">
                        Hello, {currentUser.displayName || 'User'}!
                    </h1>
                    <p className="text-gray-500 text-sm">{currentUser.email}</p>
                </div>

                <hr />

                {/* Основные данные пользователя */}
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-gray-700">User Details:</h2>
                    <div className="text-sm space-y-1">
                        <p><span className="font-bold">UID:</span> {currentUser.uid}</p>
                        <p><span className="font-bold">Email Verified:</span> {currentUser.emailVerified ? '✅ Yes' : '❌ No'}</p>
                        <p><span className="font-bold">Last Login:</span> {currentUser.metadata.lastSignInTime}</p>
                        <p><span className="font-bold">Account Created:</span> {currentUser.metadata.creationTime}</p>
                    </div>
                </div>

                {/* Данные от провайдеров (GitHub/Google/Apple) */}
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-gray-700">Linked Providers:</h2>
                    {currentUser.providerData.map((profile) => (
                        <div key={profile.uid} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs">
                            <p><span className="font-bold">Provider:</span> {profile.providerId}</p>
                            <p><span className="font-bold">Name:</span> {profile.displayName}</p>
                            <p><span className="font-bold">Email:</span> {profile.email}</p>
                            <p className="truncate"><span className="font-bold">Photo URL:</span> {profile.photoURL}</p>
                        </div>
                    ))}
                </div>

                {/* JSON для отладки (выводит абсолютно всё) */}
                <div className="mt-4">
                    <details className="cursor-pointer">
                        <summary className="text-indigo-600 font-medium text-sm">View Raw JSON Data</summary>
                        <pre className="mt-2 p-4 bg-gray-800 text-green-400 text-[10px] overflow-x-auto rounded-lg">
                            {JSON.stringify(currentUser, null, 2)}
                        </pre>
                    </details>
                </div>
            </div>
        </div>
    )
}

export default Home