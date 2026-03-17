interface StatsCardProps {
  label: string;
  value: string | number;
  change: string;
  icon?: React.ReactNode;
}

export default function StatsCard({ label, value, change, icon }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          <p className="text-sm text-gray-500 mt-2">{change}</p>
        </div>
        {icon && <div className="text-4xl text-primary/20">{icon}</div>}
      </div>
    </div>
  );
}
