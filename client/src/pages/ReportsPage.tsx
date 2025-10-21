import { useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const reportTypes = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'occupancy', label: 'Occupancy & Production' },
  { key: 'payment_mix', label: 'Payment Mix' }
];

const ReportsPage = () => {
  const [type, setType] = useState(reportTypes[0].key);
  const [data, setData] = useState<any[]>([]);
  const [period, setPeriod] = useState({ start: dayjs().startOf('day'), end: dayjs().endOf('day') });

  const runReport = async () => {
    const response = await axios.get(`/api/reports/${type}`, {
      params: {
        start: period.start.toISOString(),
        end: period.end.toISOString(),
      }
    });
    setData(response.data.rows || []);
  };

  const exportReport = async (format: 'pdf' | 'csv') => {
    const response = await axios.get(`/api/reports/${type}`, {
      params: {
        start: period.start.toISOString(),
        end: period.end.toISOString(),
        format
      },
      responseType: 'blob'
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-${dayjs().format('YYYYMMDD')}.${format}`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Reports</h1>
          <p className="text-white/70">Generate exportable insights with one click.</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={period.start.format('YYYY-MM-DD')}
            onChange={(event) => setPeriod((prev) => ({ ...prev, start: dayjs(event.target.value) }))}
            className="bg-aurora-glass border border-white/10 rounded-lg px-3 py-2"
          />
          <input
            type="date"
            value={period.end.format('YYYY-MM-DD')}
            onChange={(event) => setPeriod((prev) => ({ ...prev, end: dayjs(event.target.value) }))}
            className="bg-aurora-glass border border-white/10 rounded-lg px-3 py-2"
          />
          <select value={type} onChange={(event) => setType(event.target.value)} className="bg-aurora-glass border border-white/10 rounded-lg px-4 py-2">
            {reportTypes.map((report) => (
              <option key={report.key} value={report.key}>
                {report.label}
              </option>
            ))}
          </select>
          <button onClick={runReport} className="px-4 py-2 rounded-lg bg-aurora-neon/20 border border-aurora-neon text-aurora-neon">
            Run
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-white/5 bg-aurora-glass backdrop-blur-xl p-6 space-y-4">
        <div className="flex space-x-3">
          <button onClick={() => exportReport('pdf')} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">Export PDF</button>
          <button onClick={() => exportReport('csv')} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">Export CSV</button>
        </div>
        <pre className="bg-black/30 rounded-xl p-4 text-sm overflow-auto max-h-72">
          {JSON.stringify(data, null, 2) || 'Run a report to see data'}
        </pre>
      </section>
    </div>
  );
};

export default ReportsPage;
