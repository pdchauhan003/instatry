'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';

/**
 * SessionHydrator - Mounts invisibly in the root layout.
 * On every page load/refresh, it reads the persisted user from
 * localStorage and restores the Redux auth state if it's empty.
 * This ensures role-based UI (like Admin Panel) survives page refreshes.
 */
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

    return null; // Renders nothing
}
