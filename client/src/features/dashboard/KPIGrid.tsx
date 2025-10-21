import classNames from 'classnames';

const kpiItems = [
  { key: 'occupancy', label: 'Occupancy', format: (value: number) => `${value}%`, color: 'from-aurora-neon/40 to-transparent' },
  { key: 'adr', label: 'ADR', format: (value: number) => `$${value.toFixed(2)}`, color: 'from-purple-400/40 to-transparent' },
  { key: 'revpar', label: 'RevPAR', format: (value: number) => `$${value.toFixed(2)}`, color: 'from-pink-400/40 to-transparent' },
  { key: 'revenueToday', label: 'Revenue Today', format: (value: number) => `$${value.toLocaleString()}`, color: 'from-emerald-400/40 to-transparent' }
];

const KPIGrid = ({ property, loading }: { property: any; loading: boolean }) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {kpiItems.map((item) => (
        <div
          key={item.key}
          className={classNames(
            'rounded-2xl p-6 bg-aurora-glass backdrop-blur-xl border border-white/10 transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-aurora-neon/20',
            `bg-gradient-to-br ${item.color}`
          )}
        >
          <p className="text-sm text-white/70">{item.label}</p>
          <p className="text-3xl font-semibold mt-2">
            {loading || !property ? '—' : item.format(property[item.key] || 0)}
          </p>
        </div>
      ))}
    </section>
  );
};

export default KPIGrid;
