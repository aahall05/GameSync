// this is to store a global variable that determines whether a user is logged in or not
// the user's ID will also be stored here to make sure other pages pull the correct information for the user

import { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
    loggedIn: boolean;
    setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    userId: number | null;
    setUserId: React.Dispatch<React.SetStateAction<number | null>>;
    authLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/auth/session', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    setLoggedIn(false);
                    setUserId(null);
                    return;
                }

                const data = await response.json();
                setLoggedIn(Boolean(data.authenticated));
                setUserId(data.userId ?? null);
            } catch (error) {
                console.error('Session check failed:', error);
                setLoggedIn(false);
                setUserId(null);
            } finally {
                setAuthLoading(false);
            }
        };

        checkSession();
    }, []);

    return (
        <AuthContext.Provider value={{ loggedIn, setLoggedIn, userId, setUserId, authLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
};