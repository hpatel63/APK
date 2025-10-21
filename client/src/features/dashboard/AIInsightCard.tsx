import { useEffect, useState } from 'react';
import axios from 'axios';

const AIInsightCard = ({ propertyId }: { propertyId?: string }) => {
  const [insight, setInsight] = useState<string>('Generating insights...');

  useEffect(() => {
    if (!propertyId) return;
    let cancelled = false;
    axios
      .get('/api/insights', { params: { propertyId } })
      .then((response) => {
        if (!cancelled) {
          setInsight(response.data.message);
        }
      })
      .catch(() => setInsight('Unable to fetch insight right now.'));
    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  return (
    <section className="p-6 rounded-2xl bg-aurora-glass backdrop-blur-xl border border-white/10 shadow-inner shadow-aurora-neon/20">
      <h2 className="text-xl font-semibold flex items-center space-x-2">
        <span className="text-aurora-neon">✨</span>
        <span>Daily Insight</span>
      </h2>
      <p className="text-white/80 mt-2 leading-relaxed">{insight}</p>
    </section>
  );
};

export default AIInsightCard;
