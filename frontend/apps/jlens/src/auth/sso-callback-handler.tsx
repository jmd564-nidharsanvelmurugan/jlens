import { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

export const SSOCallbackHandler = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    // Check URL parameters
    const sso = searchParams.get('sso');
    const email = searchParams.get('email');
    const name = searchParams.get('name');

    if (sso === 'success' && email && name) {
      // Token is in HTTP-only cookie (set by backend)
      // Only store non-sensitive user info
      sessionStorage.setItem('email', email);
      sessionStorage.setItem('name', name);

      // Clean URL and reload to trigger auth check
      const cleanPath = location.pathname;
      window.history.replaceState({}, '', cleanPath);
      window.location.href = cleanPath;
    }
  }, [searchParams, location]);

  return null;
};
