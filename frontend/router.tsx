import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

// Use hash-based routing to avoid SecurityError in blob/sandbox environments
const getHashPath = () => {
  const hash = window.location.hash.slice(1); // remove '#'
  if (!hash) return '/';
  return hash.startsWith('/') ? hash : '/' + hash;
};

const RouterContext = createContext<{ path: string; navigate: (path: string) => void }>({
  path: '/',
  navigate: () => {},
});

export const useRouter = () => useContext(RouterContext);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState(getHashPath());

  useEffect(() => {
    const onHashChange = () => {
      setPath(getHashPath());
    };
    
    // Set initial hash if empty
    if (!window.location.hash) {
      window.location.hash = '/';
    }

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((newPath: string) => {
    window.location.hash = newPath;
  }, []);

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const Link: React.FC<{ to: string; className?: string; children: React.ReactNode }> = ({
  to,
  className,
  children,
}) => {
  // Construct a hash URL for native browser behavior (hover, new tab)
  const href = `#${to}`;
  
  return (
    <a
      href={href}
      className={className}
      // We rely on native browser hash navigation behavior
    >
      {children}
    </a>
  );
};