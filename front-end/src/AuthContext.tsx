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
  logout: () => {},
  refreshUser: async () => {},
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
        logAction("info", "user", "logged in");
      } else {
        setUser(null); // invalid or missing data
      }
    } catch (err: unknown) {
      // Always set user to null on error (backend down, not logged in, etc.)
      setUser(null);
      if (err instanceof Error) {
        console.error("Failed to fetch user:", err.message);
        logAction("error", "login", "failed");
      } else {
        console.error("Failed to fetch user:", err);
        logAction("error", "login", "failed");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    // Always clear user state first, even if backend call fails
    // This ensures the UI updates immediately and user can't access protected routes
    setUser(null);

    try {
      await logoutUser();
    } catch (err: unknown) {
      // Log error but don't prevent logout
      // If backend is down, we've already cleared the frontend state
      // The cookie will be cleared when backend is running
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
