import { motion } from "motion/react";
import { Link, Navigate } from "react-router-dom";
import { Shield, Sparkles, ScanSearch } from "lucide-react";
import GlowBackground from "../components/GlowBackground";
import { isAuthenticated } from "../utils/auth";

function Landing() {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b14] text-white">
      <GlowBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-cyan-200 backdrop-blur-md"
        >
          <Sparkles size={16} />
          Smart ML Security Platform
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-6 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl"
        >
          AI Spam Email
          <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Detection System
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base"
        >
          Secure your inbox with an animated AI-powered platform that detects spam
          emails, stores your prediction history, and gives you a premium cyber-security experience.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-slate-200 backdrop-blur-md">
            <Shield className="text-green-400" size={18} />
            Secure Authentication
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-slate-200 backdrop-blur-md">
            <ScanSearch className="text-cyan-400" size={18} />
            Spam Analysis Dashboard
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Link
            to="/register"
            className="rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 px-8 py-3 font-semibold text-white shadow-[0_10px_40px_rgba(59,130,246,0.35)] transition hover:scale-[1.02]"
          >
            Create Account
          </Link>

          <Link
            to="/login"
            className="rounded-2xl border border-white/15 bg-white/8 px-8 py-3 font-semibold text-white backdrop-blur-md transition hover:bg-white/12"
          >
            Login
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default Landing;