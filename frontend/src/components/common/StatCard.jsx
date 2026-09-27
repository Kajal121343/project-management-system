import clsx from "clsx";

const colorMap = {
  brand: { bg: "bg-brand-50 dark:bg-brand-900/30", text: "text-brand-600 dark:text-brand-400", ring: "ring-brand-100 dark:ring-brand-900/40" },
  blue: { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", ring: "ring-blue-100 dark:ring-blue-900/40" },
  green: { bg: "bg-emerald-50 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-100 dark:ring-emerald-900/40" },
  yellow: { bg: "bg-amber-50 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-100 dark:ring-amber-900/40" },
  red: { bg: "bg-red-50 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400", ring: "ring-red-100 dark:ring-red-900/40" },
  orange: { bg: "bg-orange-50 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400", ring: "ring-orange-100 dark:ring-orange-900/40" },
  slate: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-300", ring: "ring-slate-100 dark:ring-slate-800" },
};

export default function StatCard({ label, value, icon: Icon, color = "brand", hint }) {
  const c = colorMap[color] || colorMap.brand;
  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide dark:text-slate-400">
            {label}
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-2 dark:text-white">
            {value}
          </p>
          {hint && (
            <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">
              {hint}
            </p>
          )}
        </div>
        {Icon && (
          <div className={clsx("p-2.5 rounded-lg ring-1", c.bg, c.ring)}>
            <Icon className={clsx("w-5 h-5", c.text)} />
          </div>
        )}
      </div>
    </div>
  );
}