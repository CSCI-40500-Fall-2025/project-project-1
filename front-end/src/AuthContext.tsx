import { createContext, useContext, useState, useEffect } from "react";
import { checkLogin, logoutUser } from "./services/userServices";
import type { User } from "./const";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const data = await checkLogin();
      // setUser(data?.user || null);
      setUser(data || null);
      setLoading(false);
    }
    fetchUser();
  }, []);

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
