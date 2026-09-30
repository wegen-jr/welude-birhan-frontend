import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../Contexts/LanguageContext";
import AuthCard from "../../Components/auth/AuthCard";
import { useAuth } from "../../hooks/useAuth";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await login(email, password);

    // Login failed
    if (!res.success) {
      toast.error(res.data?.message || "Login failed");
      return;
    }

    // Get authentication data
    const token = res.data?.access_token;
    const user = res.data?.user;

    // Make sure required data exists
    if (!token || !user) {
      toast.error("Invalid login response from server");
      return;
    }

    // Store authentication data
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    toast.success("Logged in successfully");

    // Redirect according to role
    if (user.role === "ADMIN") {
      navigate("/dashboard", { replace: true });
    } else if (user.role === "MEMBER_USER") {
      navigate("/media", { replace: true });
    } else {
      navigate("/unauthorized", { replace: true });
    }
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all backdrop-blur-sm"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <input
            type="password"
            className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all backdrop-blur-sm"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 text-[#081226] py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {loading ? "Loading..." : "Sign In"}
        </button>
      </form>
    </AuthCard>
  );
}