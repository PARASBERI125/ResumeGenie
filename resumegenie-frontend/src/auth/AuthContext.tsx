/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { loginUser, registerUser } from "../api/authApi";
import { createResume } from "../api/resumeApi";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types";
import { deleteGuestResume, getGuestResumes } from "../utils/guestResumes";

type AuthContextValue = {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser() {
  const rawUser = localStorage.getItem("resumeGenieUser");
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthResponse;
  } catch {
    localStorage.removeItem("resumeGenieUser");
    localStorage.removeItem("resumeGenieToken");
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(() => readStoredUser());

  const saveSession = useCallback(async (nextUser: AuthResponse) => {
    localStorage.setItem("resumeGenieToken", nextUser.token);
    localStorage.setItem("resumeGenieUser", JSON.stringify(nextUser));
    setUser(nextUser);

    const guestDocs = getGuestResumes();
    for (const doc of guestDocs) {
      try {
        await createResume({
          userId: nextUser.userId,
          title: doc.title,
          targetRole: doc.targetRole,
          personalDetails: doc.personalDetails,
          education: doc.education,
          experience: doc.experience,
          projects: doc.projects,
          skills: doc.skills,
          achievements: doc.achievements,
        });
        deleteGuestResume(doc.id);
      } catch (err) {
        console.error("Failed to sync guest resume", err);
      }
    }
  }, []);

  const login = useCallback(
    async (request: LoginRequest) => {
      const response = await loginUser(request);
      await saveSession(response);
    },
    [saveSession],
  );

  const register = useCallback(
    async (request: RegisterRequest) => {
      const response = await registerUser(request);
      await saveSession(response);
    },
    [saveSession],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("resumeGenieToken");
    localStorage.removeItem("resumeGenieUser");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
