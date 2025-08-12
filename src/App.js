import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Redux
import { connect } from 'react-redux';
import { setCurrentUser } from './Redux/user/user.actions';
import { setCBBTimestamp } from './Redux/timestamp/timestamp.actions';
import { setCFBTimestamp } from './Redux/timestamp/timestamp.actions';

// Firebase
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from './Firebase/firebase';

// Auth Context
import { useAuth } from './Context/AuthProvider';
// CSS
import './style.css';

// Routes and Pages
import Home from './Home';
import AdminService from './_Services/simFBA/AdminService';
import BBAAdminService from './_Services/simNBA/BBAAdminService';

const App = ({ setCurrentUser, setCBBTimestamp, setCFBTimestamp }) => {
    const navigate = useNavigate(); // ✅ Hooks are now inside a functional component

    // Memoize service instances to prevent recreation on every render
    const _adminService = useRef(new AdminService()).current;
    const _bbaAdminService = useRef(new BBAAdminService()).current;

    // Get authenticated user from context
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) return; // Wait for auth to initialize

        if (!user) {
            setCurrentUser(null);
            return;
        }

        const userRef = doc(firestore, `users/${user.uid}`);
        const unsub = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
                setCurrentUser({ id: snap.id, ...snap.data() });
            } else {
                setCurrentUser({
                    id: user.uid,
                    email: user.email ?? '',
                    username: user.displayName ?? user.email ?? ''
                });
            }
        });
        return unsub;
    }, [user, loading, setCurrentUser]);

    // fetch timestamps just once per session
    const fetchedRef = useRef(false);
    useEffect(() => {
        if (!user || fetchedRef.current) return;
        fetchedRef.current = true;
        (async () => {
            const [cfbTS, cbbTS] = await Promise.all([
                _adminService.GetCurrentTimestamp(),
                _bbaAdminService.GetCurrentTimestamp()
            ]);
            setCFBTimestamp(cfbTS);
            setCBBTimestamp(cbbTS);
        })().catch(console.error);
    }, [
        user,
        _adminService,
        _bbaAdminService,
        setCFBTimestamp,
        setCBBTimestamp
    ]);

    return <Home />;
};

// const mapStateToProps = ({ user }) => ({ // commenting out, not used
//   setCurrentUser: user.currentUser
// });

const mapDispatchToProps = (dispatch) => ({
    setCurrentUser: (user) => dispatch(setCurrentUser(user)),
    setCBBTimestamp: (cbbTimestamp) => dispatch(setCBBTimestamp(cbbTimestamp)),
    setCFBTimestamp: (cfbTimestamp) => dispatch(setCFBTimestamp(cfbTimestamp))
});

export default connect(null, mapDispatchToProps)(App);
