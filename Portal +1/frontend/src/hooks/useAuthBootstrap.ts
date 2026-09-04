import { useEffect } from 'react';
import { authApi, clearToken, getToken } from '../api/client';
import { setBootstrapped, setUser, logout } from '../store/authSlice';
import { useAppDispatch } from '../store';

export function useAuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (!getToken()) {
        dispatch(setBootstrapped(true));
        return;
      }
      try {
        const me = await authApi.me();
        if (!cancelled) dispatch(setUser(me));
      } catch {
        clearToken();
        if (!cancelled) dispatch(logout());
      } finally {
        if (!cancelled) dispatch(setBootstrapped(true));
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);
}
