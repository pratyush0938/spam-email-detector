import { motion } from "motion/react";
import { Mail, FileText } from "lucide-react";

function FormShell() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 45 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.25 }}
      className="relative mt-12 rounded-[28px] border border-white/12 bg-white/8 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-7"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white">Analyze Email</h2>
        <p className="mt-2 text-sm text-slate-300">
          Enter the subject and body of the email to check whether it is spam or not.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
            <Mail size={16} className="text-cyan-400" />
            Email Subject
          </label>
          <input
            type="text"
            placeholder="Enter email subject..."
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
            <FileText size={16} className="text-purple-400" />
            Email Text
          </label>
          <textarea
            rows="7"
            placeholder="Paste email content here..."
            className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 px-5 py-3 font-semibold text-white shadow-[0_10px_40px_rgba(59,130,246,0.35)] transition"
        >
          Detect Spam
        </motion.button>
      </div>
    </motion.div>
  );
}

export default FormShell;