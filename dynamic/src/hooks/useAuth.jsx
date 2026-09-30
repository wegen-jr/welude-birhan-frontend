import { useState } from "react";
import {signIn, signUp  } from "../services/AuthService";
export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (email, password) => {
    setLoading(true);
    setError("");

    try {
      const res = await signIn(email, password);

      if (!res.ok) {
        setError(res.data.message || "Login failed");
        return { success: false, data: res.data };
      }

      return { success: true, data: res.data };
    } catch (err) {
      setError("Network error");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, phone, password) => {
    setLoading(true);
    setError("");

    try {
      const res = await signUp(email, phone, password);

      if (!res.ok) {
        setError(res.data.message || "Signup failed");
        return { success: false, data: res.data };
      }

      return { success: true, data: res.data };
    } catch (err) {
      setError("Network error");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    login,
    register,
  };
}