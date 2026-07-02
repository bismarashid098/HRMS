import { createContext, use, useState, useEffect, PropsWithChildren } from 'react';
import api from 'api/axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext({} as AuthContextType);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('hrms_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api
        .get('/auth/verify')
        .then((res) => setUser(res.data))
        .catch(() => {
          setToken(null);
          localStorage.removeItem('hrms_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, ...userData } = res.data;
    localStorage.setItem('hrms_token', token);
    setToken(token);
    setUser(userData as User);
  };

  const logout = () => {
    localStorage.removeItem('hrms_token');
    setToken(null);
    setUser(null);
  };

  return <AuthContext value={{ user, token, login, logout, loading }}>{children}</AuthContext>;
};

export const useAuth = () => use(AuthContext);
export default AuthContext;
