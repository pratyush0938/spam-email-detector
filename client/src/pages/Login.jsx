import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import GlowBackground from "../components/GlowBackground";
import API from "../services/api";
import {
  isAuthenticated,
  saveUserToLocalStorage,
} from "../utils/auth";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return toast.error("Email and password are required");
    }

    try {
      setLoading(true);

      const { data } = await API.post("/auth/login", formData);

      saveUserToLocalStorage(data.data);
      toast.success(data.message || "Login successful");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b14] text-white">
      <GlowBackground />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md rounded-[28px] border border-white/12 bg-white/8 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8"
        >
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="mt-2 text-sm text-slate-300">
            Login to continue to your spam detection dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                <Mail size={16} className="text-blue-400" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-blue-400/70 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                <Lock size={16} className="text-purple-400" />
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 px-5 py-3 font-semibold text-white shadow-[0_10px_40px_rgba(59,130,246,0.35)] transition hover:scale-[1.01] disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Login"}
              {!loading && <LogIn size={18} />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-300">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-cyan-300 hover:text-cyan-200">
              Register
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;