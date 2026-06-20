// auth-provider.tsx
import { useEffect, useState } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '@/lib/auth/msalConfig';

const msalInstance = new PublicClientApplication(msalConfig);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    msalInstance.initialize()
      .then(() => setIsInitialized(true))
      .catch((err) => setError(err?.message || 'Authentication failed to initialize'));
  }, []);

  if (error) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Authentication Error: {error}</div>;
  }

  if (!isInitialized) {
    return null; // or show a loader
  }

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};
