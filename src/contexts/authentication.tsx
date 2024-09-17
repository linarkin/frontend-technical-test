import { jwtDecode } from 'jwt-decode';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { useNavigate } from '@tanstack/react-router';

export type AuthenticationState =
  | {
      isAuthenticated: true;
      token: string;
      userId: string;
    }
  | {
      isAuthenticated: false;
    };

export type Authentication = {
  state: AuthenticationState;
  authenticate: (token: string) => void;
  signout: () => void;
};

function isTokenExpired(token: string): boolean {
  try {
    const decodedToken: any = jwtDecode(token);
    const expirationTime = decodedToken.exp * 1000;
    return Date.now() >= expirationTime;
  } catch (error) {
    return true;
  }
}

export const AuthenticationContext = createContext<Authentication | undefined>(
  undefined
);

export const AuthenticationProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthenticationState>(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken && !isTokenExpired(storedToken)) {
      const userId = jwtDecode<{ id: string }>(storedToken).id;
      return {
        isAuthenticated: true,
        token: storedToken,
        userId,
      };
    }
    return { isAuthenticated: false };
  });

  const authenticate = useCallback((token: string) => {
    const userId = jwtDecode<{ id: string }>(token).id;
    setState({
      isAuthenticated: true,
      token,
      userId,
    });
    localStorage.setItem('authToken', token);
  }, []);

  const signout = useCallback(() => {
    setState({ isAuthenticated: false });
    localStorage.removeItem('authToken');
  }, []);

  const handleTokenExpiration = useCallback(async () => {
    signout();
    navigate({ to: '/login' });
  }, [signout]);

  useEffect(() => {
    if (
      state.isAuthenticated &&
      (isTokenExpired(state.token) ||
        state.token !== localStorage.getItem('authToken'))
    ) {
      handleTokenExpiration();
    }
  }, [state, handleTokenExpiration]);

  const contextValue = useMemo(
    () => ({ state, authenticate, signout }),
    [state, authenticate, signout]
  );

  return (
    <AuthenticationContext.Provider value={contextValue}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export function useAuthentication() {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error(
      'useAuthentication must be used within an AuthenticationProvider'
    );
  }
  return context;
}

export function useAuthToken() {
  const { state } = useAuthentication();
  if (!state.isAuthenticated) {
    throw new Error('User is not authenticated');
  }
  return state.token;
}
