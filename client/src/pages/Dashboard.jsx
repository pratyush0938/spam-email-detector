import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  LogOut,
  Mail,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Trash2,
  Wand2,
  Eraser,
  ShieldAlert,
  Radar,
} from "lucide-react";
import toast from "react-hot-toast";
import GlowBackground from "../components/GlowBackground";
import API from "../services/api";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
} from "../utils/auth";
import StatsCards from "../components/StatsCards";
import HistoryList from "../components/HistoryList";
import PredictionChart from "../components/PredictionChart";

function Dashboard() {
  const navigate = useNavigate();
  const user = getUserFromLocalStorage();

  const [formData, setFormData] = useState({
    sender_email: "",
    subject: "",
    email_text: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const handleLogout = () => {
    removeUserFromLocalStorage();
    navigate("/login");
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const { data } = await API.get("/predictions/history");
      setHistory(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch history");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handlePredict = async (e) => {
    e.preventDefault();

    if (!formData.email_text.trim()) {
      return toast.error("Email text is required");
    }

    try {
      setLoading(true);
      setResult(null);

      const { data } = await API.post("/predictions/predict", formData);

      setResult(data.data);
      toast.success("Prediction completed successfully");

      setFormData({
        sender_email: "",
        subject: "",
        email_text: "",
      });

      fetchHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
      sender_email: "",
      subject: "",
      email_text: "",
    });
    setResult(null);
    toast.success("Form cleared");
  };

  const handleUseSampleSpam = () => {
    setFormData({
      sender_email: "verify-bank-alert0099@secure-wallet-update.xyz",
      subject: "Congratulations! You won a free iPhone",
      email_text:
        "You have been selected as the lucky winner of a free iPhone. Click this link now to claim your reward before the offer expires.",
    });
    toast.success("Sample spam filled");
  };

  const handleUseSampleSafe = () => {
    setFormData({
      sender_email: "hr@company.com",
      subject: "Project Meeting Reminder",
      email_text:
        "Hello team, this is a reminder that our project meeting is scheduled for tomorrow at 4 PM. Please bring the updated report with you.",
    });
    toast.success("Sample safe email filled");
  };

  const handleClearHistory = async () => {
    try {
      setClearingHistory(true);
      await API.delete("/predictions/clear");
      setHistory([]);
      setResult(null);
      toast.success("History cleared successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to clear history");
    } finally {
      setClearingHistory(false);
    }
  };

  const filteredHistory = useMemo(() => {
    if (activeFilter === "all") return history;
    return history.filter((item) => item.prediction === activeFilter);
  }, [history, activeFilter]);

  const isSpam = result?.prediction === "spam";
  const isSuspicious = result?.prediction === "suspicious";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b14] text-white">
      <GlowBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[28px] border border-white/12 bg-white/8 p-5 backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-cyan-200">
                <ShieldAlert size={16} />
                Secure Spam Detection Dashboard
              </div>

              <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                Welcome back, {user?.name || "User"}
              </h1>
              <p className="mt-2 text-sm text-slate-300 sm:text-base">
                Analyze suspicious emails, review your detection history, and monitor your spam insights in one premium dashboard.
              </p>
              <p className="mt-2 text-sm text-slate-400">{user?.email}</p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3 font-semibold text-red-300 transition hover:bg-red-500/20"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        <StatsCards history={history} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="rounded-[28px] border border-white/12 bg-white/8 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-cyan-200">
                <Sparkles size={16} />
                AI Email Analysis
              </div>

              <h2 className="mt-4 text-3xl font-bold text-white">
                Detect Spam Instantly
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Enter the sender email, subject and content. The ML model plus sender-trust analysis will classify whether it is spam, suspicious, or not spam.
              </p>
            </div>

            <div className="mb-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleUseSampleSpam}
                className="flex items-center gap-2 rounded-2xl bg-red-500/15 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
              >
                <Wand2 size={16} />
                Use Sample Spam
              </button>

              <button
                type="button"
                onClick={handleUseSampleSafe}
                className="flex items-center gap-2 rounded-2xl bg-green-500/15 px-4 py-2 text-sm font-medium text-green-300 transition hover:bg-green-500/20"
              >
                <Wand2 size={16} />
                Use Sample Safe
              </button>

              <button
                type="button"
                onClick={handleClearForm}
                className="flex items-center gap-2 rounded-2xl bg-white/8 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/12"
              >
                <Eraser size={16} />
                Clear Form
              </button>
            </div>

            <form onSubmit={handlePredict} className="space-y-5">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                  <Mail size={16} className="text-cyan-400" />
                  Sender Email
                </label>
                <input
                  type="email"
                  name="sender_email"
                  placeholder="Enter sender email (e.g. hr@company.com)"
                  value={formData.sender_email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                  <Mail size={16} className="text-cyan-400" />
                  Email Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  placeholder="Enter email subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                  <FileText size={16} className="text-purple-400" />
                  Email Text
                </label>
                <textarea
                  rows="8"
                  name="email_text"
                  placeholder="Paste email content here..."
                  value={formData.email_text}
                  onChange={handleChange}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 px-5 py-3 font-semibold text-white shadow-[0_10px_40px_rgba(59,130,246,0.35)] transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "AI is analyzing your email..." : "Detect Spam"}
              </motion.button>
            </form>
          </motion.div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="rounded-[28px] border border-white/12 bg-white/8 p-6 backdrop-blur-xl"
            >
              <h3 className="text-2xl font-bold text-white">Detection Result</h3>
              <p className="mt-2 text-sm text-slate-300">
                Your model output will appear here after analysis.
              </p>

              {!result && !loading && (
                <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-8 text-center text-slate-400">
                  No prediction yet. Submit an email to see the result.
                </div>
              )}

              {loading && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-8 text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-400/20 border-t-cyan-400" />
                  <p className="mt-4 text-slate-300">AI is analyzing your email...</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Checking suspicious patterns, keywords, sender trust, and model confidence.
                  </p>
                </div>
              )}

              {result && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-6 rounded-2xl border p-6 ${
                    isSpam
                      ? "border-red-400/20 bg-red-500/10"
                      : isSuspicious
                      ? "border-yellow-400/20 bg-yellow-500/10"
                      : "border-green-400/20 bg-green-500/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        isSpam
                          ? "bg-red-500/20"
                          : isSuspicious
                          ? "bg-yellow-500/20"
                          : "bg-green-500/20"
                      }`}
                    >
                      {isSpam ? (
                        <AlertTriangle className="text-red-300" size={24} />
                      ) : isSuspicious ? (
                        <AlertTriangle className="text-yellow-300" size={24} />
                      ) : (
                        <CheckCircle2 className="text-green-300" size={24} />
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-slate-300">Prediction</p>
                      <h4
                        className={`text-2xl font-bold ${
                          isSpam
                            ? "text-red-300"
                            : isSuspicious
                            ? "text-yellow-300"
                            : "text-green-300"
                        }`}
                      >
                        {result.prediction}
                      </h4>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-slate-300">
                    {isSpam
                      ? "⚠️ This email is likely dangerous. Avoid interacting with it."
                      : isSuspicious
                      ? "⚠️ This email looks suspicious. Verify sender before taking action."
                      : "✅ This email appears safe based on current analysis."}
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-950/40 p-4">
                      <p className="text-sm text-slate-400">Sender Email</p>
                      <p className="mt-1 break-all text-sm font-semibold text-white">
                        {result.sender_email || "Not provided"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-950/40 p-4">
                      <p className="text-sm text-slate-400">Sender Analysis</p>
                      <p
                        className={`mt-1 text-sm font-semibold ${
                          result.sender_analysis === "highly suspicious"
                            ? "text-red-300"
                            : result.sender_analysis === "suspicious"
                            ? "text-yellow-300"
                            : "text-green-300"
                        }`}
                      >
                        {result.sender_analysis}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-slate-950/40 p-4">
                    <p className="text-sm text-slate-400">Sender Risk Score</p>
                    <p className="mt-1 text-lg font-bold text-white">
                      {result.sender_risk_score || 0}/100
                    </p>

                    {result.sender_flags?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {result.sender_flags.map((flag, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-white/8 px-3 py-1 text-xs text-slate-300"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-950/40 p-4">
                      <p className="text-sm text-slate-400">Confidence</p>
                      <p className="mt-1 text-2xl font-bold text-white">
                        {result.confidence}%
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-950/40 p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Radar size={16} />
                        Spam Probability
                      </div>
                      <p className="mt-1 text-2xl font-bold text-white">
                        {result.spam_probability}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                      <span>Confidence Meter</span>
                      <span>{result.confidence}%</span>
                    </div>

                    <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence}%` }}
                        transition={{ duration: 0.8 }}
                        className={`h-full rounded-full ${
                          isSpam
                            ? "bg-gradient-to-r from-red-400 to-red-600"
                            : isSuspicious
                            ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                            : "bg-gradient-to-r from-green-400 to-green-600"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-950/40 p-4">
                      <p className="text-sm text-slate-400">Numeric Label</p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {result.label}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-950/40 p-4">
                      <p className="text-sm text-slate-400">Status</p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {isSpam
                          ? "Potential Threat"
                          : isSuspicious
                          ? "Needs Verification"
                          : "Looks Safe"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            <PredictionChart history={history} />
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-white/12 bg-white/8 p-4 backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Manage History</h3>
              <p className="mt-1 text-sm text-slate-300">
                Filter your history or clear all saved email analysis.
              </p>
            </div>

            <button
              onClick={handleClearHistory}
              disabled={clearingHistory || history.length === 0}
              className="flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3 font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={18} />
              {clearingHistory ? "Clearing..." : "Clear History"}
            </button>
          </div>
        </div>

        <div className="mt-8">
          {historyLoading ? (
            <div className="rounded-[28px] border border-white/12 bg-white/8 p-8 text-center text-slate-300 backdrop-blur-xl">
              Loading history...
            </div>
          ) : (
            <HistoryList
              history={filteredHistory}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;