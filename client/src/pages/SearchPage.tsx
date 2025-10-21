import { useState } from 'react';
import axios from 'axios';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>({ guests: [], reservations: [], payments: [] });

  const search = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await axios.get('/api/search', { params: { q: query } });
    setResults(response.data);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Search</h1>
          <p className="text-white/70">Find guests, reservations, payments, or documents instantly.</p>
        </div>
      </header>

      <form onSubmit={search} className="flex space-x-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search guests, reservations, payments"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3"
        />
        <button className="px-4 py-2 rounded-lg bg-aurora-neon/20 border border-aurora-neon text-aurora-neon">Search</button>
      </form>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-aurora-glass backdrop-blur-xl p-4">
          <h2 className="text-lg font-semibold mb-2">Guests</h2>
          <ul className="space-y-2 text-sm text-white/70">
            {results.guests.map((guest: any) => (
              <li key={guest.id} className="p-2 rounded-lg bg-white/5 border border-white/10">
                {guest.firstName} {guest.lastName}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-aurora-glass backdrop-blur-xl p-4">
          <h2 className="text-lg font-semibold mb-2">Reservations</h2>
          <ul className="space-y-2 text-sm text-white/70">
            {results.reservations.map((reservation: any) => (
              <li key={reservation.id} className="p-2 rounded-lg bg-white/5 border border-white/10">
                {reservation.id} — {reservation.status}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-aurora-glass backdrop-blur-xl p-4">
          <h2 className="text-lg font-semibold mb-2">Payments</h2>
          <ul className="space-y-2 text-sm text-white/70">
            {results.payments.map((payment: any) => (
              <li key={payment.id} className="p-2 rounded-lg bg-white/5 border border-white/10">
                {payment.method} — ${payment.amount}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default SearchPage;
