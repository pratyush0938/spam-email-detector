import { motion } from "motion/react";
import {
  ShieldAlert,
  ShieldCheck,
  BarChart3,
  TriangleAlert,
} from "lucide-react";

function StatsCards({ history }) {
  const total = history.length;
  const spamCount = history.filter((item) => item.prediction === "spam").length;
  const suspiciousCount = history.filter(
    (item) => item.prediction === "suspicious"
  ).length;
  const safeCount = history.filter(
    (item) => item.prediction === "not spam"
  ).length;

  const cards = [
    {
      title: "Total Checks",
      value: total,
      icon: <BarChart3 className="text-cyan-300" size={22} />,
      bg: "from-cyan-500/20 to-blue-500/20",
    },
    {
      title: "Spam Detected",
      value: spamCount,
      icon: <ShieldAlert className="text-red-300" size={22} />,
      bg: "from-red-500/20 to-pink-500/20",
    },
    {
      title: "Suspicious",
      value: suspiciousCount,
      icon: <TriangleAlert className="text-yellow-300" size={22} />,
      bg: "from-yellow-500/20 to-amber-500/20",
    },
    {
      title: "Safe Emails",
      value: safeCount,
      icon: <ShieldCheck className="text-green-300" size={22} />,
      bg: "from-green-500/20 to-emerald-500/20",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.08 }}
          className={`rounded-[24px] border border-white/12 bg-gradient-to-br ${card.bg} p-5 backdrop-blur-xl`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">{card.title}</p>
              <h3 className="mt-2 text-3xl font-bold text-white">{card.value}</h3>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">{card.icon}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default StatsCards;