'use client';

import React, { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';

import { authClient } from '@/lib/auth-client';
import { setAuth, clearAuth } from '@/lib/redux/authSlice';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { makeStore, AppStore } from '@/lib/redux/store';

function SessionSync({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const reduxToken = useAppSelector((state) => state.auth.session?.token);
  const reduxRole = useAppSelector((state) => state.auth.user?.role);
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);
  const { data: session, isPending } = authClient.useSession();

  const sessionToken = session?.session.token;
  const currentRole = (session?.user as { role?: string } | undefined)?.role;
  const hasUserAndSession = Boolean(session);

  useEffect(() => {
    if (isPending) return;

    if (session) {
      if (!isInitialized || sessionToken !== reduxToken || currentRole !== reduxRole) {
        dispatch(
          setAuth({
            user: session.user,
            session: session.session,
          }),
        );
      }
    } else {
      if (!isInitialized || reduxToken) {
        dispatch(clearAuth());
      }
    }
  }, [
    isPending,
    hasUserAndSession,
    sessionToken,
    currentRole,
    reduxToken,
    reduxRole,
    isInitialized,
    dispatch,
  ]);

  return <>{children}</>;
}

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <SessionSync>{children}</SessionSync>
    </Provider>
  );
}
