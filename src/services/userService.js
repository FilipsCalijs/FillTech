const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5200';

export const syncUserWithBackend = async (user) => {
    if (!user) return;

    const userData = {
        uid: user.uid,
        email: user.email,
        isAnonymous: user.isAnonymous,
        displayName: user.displayName,
        photoURL: user.photoURL,
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
    };

    try {
        const response = await fetch(`${API_URL}/api/sync-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (data.success && data.role) {
            localStorage.setItem('userRole', data.role);
            return data.role; 
        }
    } catch (error) {
        console.error("Ошибка синхронизации:", error);
        return null;
    }
};