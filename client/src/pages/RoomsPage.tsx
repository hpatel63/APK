import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRooms, createReservation } from '../features/rooms/reservationSlice';
import { RootState, AppDispatch } from '../store/store';
import ReservationModal from '../features/rooms/ReservationModal';
import dayjs from 'dayjs';

const RoomsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { rooms, reservations } = useSelector((state: RootState) => state.reservations);
  const { activePropertyId } = useSelector((state: RootState) => state.properties);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [modalPayload, setModalPayload] = useState<any>(null);

  useEffect(() => {
    if (activePropertyId) {
      dispatch(fetchRooms(activePropertyId));
    }
  }, [dispatch, activePropertyId]);

  const visibleReservations = useMemo(() => {
    return reservations.filter((reservation) => dayjs(reservation.start).isSame(selectedDate, 'day'));
  }, [reservations, selectedDate]);

  const openModal = (room: any) => {
    setModalPayload({ room, propertyId: activePropertyId, start: selectedDate.toISOString() });
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Rooms</h1>
          <p className="text-white/70">Drag-friendly glassmorphism grid for quick booking.</p>
        </div>
        <input
          type="date"
          value={selectedDate.format('YYYY-MM-DD')}
          onChange={(event) => setSelectedDate(dayjs(event.target.value))}
          className="bg-aurora-glass border border-white/10 rounded-lg px-3 py-2"
        />
      </header>

      <section className="rounded-2xl border border-white/5 bg-aurora-glass backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
          {rooms.map((room) => {
            const statusStyles =
              room.status === 'clean'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-200';
            return (
            <button
              key={room.id}
              onDoubleClick={() => openModal(room)}
              className="text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:border-aurora-neon transition-colors"
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">Room {room.number}</p>
                <span className={`px-3 py-1 text-xs rounded-full border ${statusStyles}`}>{room.status}</span>
              </div>
              <p className="text-sm text-white/60">{room.type}</p>
              <p className="text-xs text-white/40 mt-2">Double-click to create booking</p>
            </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-white/5 bg-aurora-glass backdrop-blur-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Today's Reservations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleReservations.map((reservation) => (
            <div key={reservation.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="font-semibold">Room {reservation.roomNumber}</p>
              <p className="text-sm text-white/70">{reservation.guestName}</p>
              <p className="text-xs text-white/50">Status: {reservation.status}</p>
            </div>
          ))}
          {visibleReservations.length === 0 && <p className="text-white/60">No reservations for this date.</p>}
        </div>
      </section>

      {modalPayload && (
        <ReservationModal
          payload={modalPayload}
          onClose={() => setModalPayload(null)}
          onSubmit={(data) => {
            dispatch(createReservation(data));
            setModalPayload(null);
          }}
        />
      )}
    </div>
  );
};

export default RoomsPage;
