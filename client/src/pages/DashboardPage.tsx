import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPropertySummary, setActiveProperty } from '../features/dashboard/propertySlice';
import { RootState, AppDispatch } from '../store/store';
import KPIGrid from '../features/dashboard/KPIGrid';
import AIInsightCard from '../features/dashboard/AIInsightCard';

const DashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list, activePropertyId, status } = useSelector((state: RootState) => state.properties);

  useEffect(() => {
    dispatch(fetchPropertySummary());
  }, [dispatch]);

  const activeProperty = useMemo(() => list.find((p) => p.id === activePropertyId) || list[0], [list, activePropertyId]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-white/70">Multi-property overview at a glance</p>
        </div>
        <select
          value={activeProperty?.id || ''}
          onChange={(event) => dispatch(setActiveProperty(event.target.value))}
          className="bg-aurora-glass border border-white/10 rounded-lg px-4 py-2 backdrop-blur-md"
        >
          {list.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>
      </header>

      <KPIGrid property={activeProperty} loading={status === 'loading'} />
      <AIInsightCard propertyId={activeProperty?.id} />
    </div>
  );
};

export default DashboardPage;
