interface StatsGridProps {
  total: number;
  publicCount: number;
  privateCount: number;
  totalValue: number;
  totalSpent: number;
}

export default function StatsGrid({ total, publicCount, privateCount, totalValue }: StatsGridProps) {
  const stats = [
    { label: 'Total Jerseys', value: total },
    { label: 'Public', value: publicCount },
    { label: 'Private', value: privateCount },
    { label: 'Est. Value', value: `€${totalValue.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white/5 border border-[#39FF14]/20 rounded-xl p-4 text-center"
        >
          <div className="text-[#39FF14] font-oswald text-3xl font-bold">
            {stat.value}
          </div>
          <div className="text-gray-400 text-sm uppercase tracking-wide mt-1">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
