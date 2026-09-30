import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../Contexts/LanguageContext";
import AuthCard from "../../Components/auth/AuthCard";
import { useAuth } from "../../hooks/useAuth";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await login(email, password);

    if (!res.success) {
      toast.error(res.data?.message || "Login failed");
      return;
    }

    if (res.data?.access_token) {
      localStorage.setItem("token", res.data.access_token);
    }

    toast.success("Logged in successfully");

    setTimeout(() => navigate("/dashboard"), 500);
  };

  return (
    <AuthCard
      title={t.signIn.title}
      subtitle={t.signIn.subtitle}
      forgotPassword={t.signIn.forgotPassword}
      noAccount={t.signIn.noAccount}
      signUp={t.signIn.signUp}
    >
      <ToastContainer />

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          className="w-full px-4 py-3 rounded-lg bg-blue-950 border border-yellow-500 text-white"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full px-4 py-3 rounded-lg bg-blue-950 border border-yellow-500 text-white"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          className="w-full bg-yellow-500 py-3 rounded-lg font-semibold"
        >
          {loading ? "Loading..." : "Sign In"}
        </button>
      </form>
      
    </AuthCard>
  );
}