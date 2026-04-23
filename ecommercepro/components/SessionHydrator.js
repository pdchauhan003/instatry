'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';

export default function SessionHydrator() {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        if (user) return; // Already hydrated, nothing to do
        try {
            const stored = localStorage.getItem('auth_user');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && parsed._id) {
                    dispatch(setAuthUser(parsed));
                    console.log('[SessionHydrator] Restored user from localStorage:', parsed.role);
                }
            }
        } catch (e) {
            console.warn('[SessionHydrator] Failed to restore session:', e);
        }
    }, [user, dispatch]);

    return null; 
}
