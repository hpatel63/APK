import { useEffect, useState } from 'react';
import axios from 'axios';

const TaxSettings = () => {
  const [taxes, setTaxes] = useState<any[]>([]);

  useEffect(() => {
    axios.get('/api/settings/taxes').then((response) => setTaxes(response.data.taxes));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Tax Profiles</h2>
      <table className="w-full text-left text-sm">
        <thead className="text-white/60">
          <tr>
            <th className="py-2">Name</th>
            <th>Rate</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {taxes.map((tax) => (
            <tr key={tax.id} className="border-t border-white/10">
              <td className="py-2">{tax.name}</td>
              <td>{(tax.rate * 100).toFixed(2)}%</td>
              <td>{tax.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaxSettings;
