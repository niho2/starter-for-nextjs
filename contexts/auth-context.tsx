"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  setClientSession,
  clearClientSession,
  account,
} from "@/lib/client/appwrite";

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = async () => {
    setIsLoading(true);
    try {
      // First set the client session
      const sessionSet = await setClientSession();
      if (!sessionSet) {
        setIsAuthenticated(false);
        setUserId(null);
        clearClientSession();
        return;
      }

      // Then verify the user
      const user = await account.get();
      setIsAuthenticated(true);
      setUserId(user.$id);
      console.log("Auth context: User authenticated", user.$id);
    } catch (error) {
      console.error("Auth context: Authentication failed", error);
      setIsAuthenticated(false);
      setUserId(null);
      clearClientSession();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userId,
        isLoading,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
