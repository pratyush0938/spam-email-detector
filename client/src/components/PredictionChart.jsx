import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function PredictionChart({ history }) {
  const spamCount = history.filter((item) => item.prediction === "spam").length;
  const suspiciousCount = history.filter(
    (item) => item.prediction === "suspicious"
  ).length;
  const safeCount = history.filter(
    (item) => item.prediction === "not spam"
  ).length;

  const data = [
    { name: "Spam", value: spamCount },
    { name: "Suspicious", value: suspiciousCount },
    { name: "Safe", value: safeCount },
  ];

  return (
    <div className="rounded-[28px] border border-white/12 bg-white/8 p-6 backdrop-blur-xl">
      <h3 className="text-2xl font-bold text-white">Prediction Overview</h3>
      <p className="mt-2 text-sm text-slate-300">
        Visual summary of your spam detection activity.
      </p>

      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={4}
            >
              <Cell fill="#f87171" />
              <Cell fill="#facc15" />
              <Cell fill="#4ade80" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-300">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          Spam
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          Suspicious
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-400" />
          Safe
        </div>
      </div>
    </div>
  );
}

export default PredictionChart;