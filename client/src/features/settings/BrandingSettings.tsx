import { useEffect, useState } from 'react';
import axios from 'axios';

const BrandingSettings = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    axios.get('/api/settings/branding').then((response) => {
      setProperties(response.data.properties);
      if (response.data.properties.length) {
        setForm(response.data.properties[0]);
      }
    });
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, String(value)));
    await axios.post('/api/settings/branding', formData);
    alert('Branding updated');
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <select
          value={form.id || ''}
          onChange={(event) => {
            const property = properties.find((p) => p.id === event.target.value);
            setForm(property);
          }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
        >
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>
        <input
          placeholder="Property Name"
          value={form.name || ''}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
        />
        <input
          placeholder="Address"
          value={form.address || ''}
          onChange={(event) => setForm({ ...form, address: event.target.value })}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
        />
        <input
          placeholder="Phone"
          value={form.phone || ''}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
        />
      </div>
      <button type="submit" className="px-4 py-2 rounded-lg bg-aurora-neon/20 border border-aurora-neon text-aurora-neon">
        Save Branding
      </button>
    </form>
  );
};

export default BrandingSettings;
