interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: string;
}

export function StatsCard({ title, value, icon, color = "text-[#0f7bb5]" }: StatsCardProps) {
  return (
    <div className="card p-5 flex items-center gap-4">
      {icon && (
        <div className="w-11 h-11 rounded-full bg-[#0f7bb5]/10 flex items-center justify-center flex-shrink-0">
          <span className={color}>{icon}</span>
        </div>
      )}
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{title}</p>
      </div>
    </div>
  );
}
