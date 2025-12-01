import { createContext, useContext, useState, useEffect } from "react";
import { checkLogin, logoutUser } from "./services/userServices";
import type { User } from "./const";
import { logAction } from "./logger";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => void;
  refreshUser?: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => { },
  refreshUser: async () => { }
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const data = await checkLogin();
      if (data?.username && data?.email && data?.id) {
        const newUser = {
          username: data.username,
          email: data.email,
          userID: data.id,
        };
        setUser(newUser);
        logAction('info', 'user' , 'logged in');
      } else {
        setUser(null); // invalid or missing data
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Failed to fetch user:", err.message);
        logAction('error', 'login', 'failed');
      } else {
        console.error("Failed to fetch user:", err);
        logAction('error', 'login', 'failed');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Logout failed:", err.message);
      } else {
        console.error("Logout failed:", err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, logout, refreshUser: fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
