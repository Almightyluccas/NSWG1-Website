'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';

export default function SessionErrorHandler() {
  const { data: session } = useSession();

  useEffect(() => {
    console.log(session?.error)
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: '/' });
    }
  }, [session]);

  return null;
}
