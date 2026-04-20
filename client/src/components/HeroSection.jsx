import { motion } from "motion/react";
import { ShieldCheck, Sparkles, ScanSearch } from "lucide-react";

function HeroSection() {
  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-cyan-200 backdrop-blur-md"
      >
        <Sparkles size={16} />
        AI Powered Email Security Tool
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl"
      >
        Detect Spam Emails
        <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          With Premium AI Experience
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base"
      >
        Paste your email subject and content, and the system will analyze whether
        it is spam or safe. Built with Machine Learning, modern UI, and a
        futuristic cyber-security feel.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-4"
      >
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-slate-200 backdrop-blur-md">
          <ShieldCheck className="text-green-400" size={18} />
          Safe Email Detection
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-slate-200 backdrop-blur-md">
          <ScanSearch className="text-cyan-400" size={18} />
          Real-Time Spam Analysis
        </div>
      </motion.div>
    </div>
  );
}

export default HeroSection;