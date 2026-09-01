'use client';

import React, { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/lib/redux/store';
import { authClient } from '@/lib/auth-client';
import { useAppDispatch } from '@/lib/redux/hooks';
import { setAuth, clearAuth } from '@/lib/redux/authSlice';

function SessionSync({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session) {
      dispatch(
        setAuth({
          user: session.user,
          session: session.session,
        }),
      );
    } else {
      dispatch(clearAuth());
    }
  }, [session, dispatch]);

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
