import { motion } from "motion/react";
import {
  AlertTriangle,
  CheckCircle2,
  Mail,
  Inbox,
  Radar,
} from "lucide-react";

function HistoryList({ history, activeFilter, setActiveFilter }) {
  return (
    <div className="rounded-[28px] border border-white/12 bg-white/8 p-6 backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Recent Prediction History</h3>
          <p className="mt-2 text-sm text-slate-300">
            Your latest analyzed emails are shown below.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeFilter === "all"
                ? "bg-cyan-500 text-white"
                : "bg-white/8 text-slate-300 hover:bg-white/12"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setActiveFilter("spam")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeFilter === "spam"
                ? "bg-red-500 text-white"
                : "bg-white/8 text-slate-300 hover:bg-white/12"
            }`}
          >
            Spam
          </button>

          <button
            onClick={() => setActiveFilter("suspicious")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeFilter === "suspicious"
                ? "bg-yellow-500 text-white"
                : "bg-white/8 text-slate-300 hover:bg-white/12"
            }`}
          >
            Suspicious
          </button>

          <button
            onClick={() => setActiveFilter("not spam")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeFilter === "not spam"
                ? "bg-green-500 text-white"
                : "bg-white/8 text-slate-300 hover:bg-white/12"
            }`}
          >
            Safe
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/8">
            <Inbox className="text-slate-300" size={28} />
          </div>
          <h4 className="mt-4 text-xl font-semibold text-white">No history found</h4>
          <p className="mt-2 text-sm text-slate-400">
            Start analyzing emails and your recent history will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {history.map((item, index) => {
            const isSpam = item.prediction === "spam";
            const isSuspicious = item.prediction === "suspicious";

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 transition hover:border-white/20 hover:bg-slate-950/55"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-slate-200">
                      <Mail size={16} className="text-cyan-300" />
                      <p className="font-medium">
                        {item.subject?.trim() ? item.subject : "No Subject"}
                      </p>
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                      {item.email_text}
                    </p>

                    <p className="mt-3 text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>

                    {item.sender_email && (
                      <p className="mt-2 text-xs text-slate-400">
                        Sender: <span className="text-slate-300">{item.sender_email}</span>
                      </p>
                    )}

                    <p className="mt-3 text-sm text-slate-300">
                      {isSpam
                        ? "Potentially harmful email pattern detected."
                        : isSuspicious
                        ? "This email looked suspicious and may need manual verification."
                        : "This email looked relatively safe based on model analysis."}
                    </p>
                  </div>

                  <div className="w-full lg:w-80">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
                        isSpam
                          ? "bg-red-500/15 text-red-300"
                          : isSuspicious
                          ? "bg-yellow-500/15 text-yellow-300"
                          : "bg-green-500/15 text-green-300"
                      }`}
                    >
                      {isSpam ? (
                        <AlertTriangle size={16} />
                      ) : isSuspicious ? (
                        <AlertTriangle size={16} />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      {item.prediction}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      <div className="rounded-2xl bg-white/5 p-3">
                        <p className="text-xs text-slate-400">Confidence</p>
                        <p className="mt-1 text-lg font-bold text-white">
                          {item.confidence?.toFixed?.(2)
                            ? item.confidence.toFixed(2)
                            : item.confidence}
                          %
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white/5 p-3">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Radar size={14} />
                          Spam Probability
                        </div>
                        <p className="mt-1 text-lg font-bold text-white">
                          {item.spam_probability?.toFixed?.(2)
                            ? item.spam_probability.toFixed(2)
                            : item.spam_probability || 0}
                          %
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white/5 p-3">
                        <p className="text-xs text-slate-400">Sender Analysis</p>
                        <p
                          className={`mt-1 text-sm font-bold ${
                            item.sender_analysis === "highly suspicious"
                              ? "text-red-300"
                              : item.sender_analysis === "suspicious"
                              ? "text-yellow-300"
                              : "text-green-300"
                          }`}
                        >
                          {item.sender_analysis || "unknown"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white/5 p-3">
                        <p className="text-xs text-slate-400">Sender Risk</p>
                        <p className="mt-1 text-sm font-bold text-white">
                          {item.sender_risk_score || 0}/100
                        </p>
                      </div>
                    </div>

                    {item.sender_flags?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.sender_flags.map((flag, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-white/8 px-3 py-1 text-[11px] text-slate-300"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                        <span>Confidence Meter</span>
                        <span>{item.confidence}%</span>
                      </div>

                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full ${
                            isSpam
                              ? "bg-gradient-to-r from-red-400 to-red-600"
                              : isSuspicious
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                              : "bg-gradient-to-r from-green-400 to-green-600"
                          }`}
                          style={{ width: `${item.confidence || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default HistoryList;