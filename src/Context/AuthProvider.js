// auth-provider.tsx
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useMemo
} from 'react';
import { onIdTokenChanged, User } from 'firebase/auth';
import { auth } from '../Firebase/firebase';

const AuthCtx = createContext({ user: null, token: null, loading: true });
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('AuthProvider mounted');
        return () => console.log('AuthProvider unmounted');
    }, []);

    useEffect(() => {
        const unsubAuth = onIdTokenChanged(auth, async (u) => {
            try {
                let t = null;
                if (u) {
                    t = await u.getIdToken(); // fetch ONCE
                    localStorage.setItem('token', t);
                } else {
                    localStorage.removeItem('token');
                }

                setUser(u ?? null);
                setToken(t);
            } catch (error) {
                console.error('Error in auth state change:', error);
                setUser(null);
                setToken(null);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        });
        return unsubAuth;
    }, []);

    const value = useMemo(
        () => ({
            user,
            token,
            loading
        }),
        [user, token, loading]
    );

    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
